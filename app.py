#!/usr/bin/env python3
"""
Dyslexia Screening Tool Backend
Simple Flask server with Whisper transcription
"""

import os
import logging
import warnings
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import whisper
import re
from datetime import datetime
from bson import ObjectId
from pymongo import MongoClient, ReturnDocument
from dotenv import load_dotenv
try:
    import torch
except Exception:
    torch = None
try:
    import pyttsx3
except Exception:
    pyttsx3 = None

# Suppress FP16 warnings
warnings.filterwarnings("ignore", category=UserWarning)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load env and initialize Mongo
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "dyscover")
mongo_client = None
db = None

def init_mongo():
    global mongo_client, db
    try:
        mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
        # Trigger server selection
        mongo_client.server_info()
        db = mongo_client[MONGO_DB]
        logger.info(f"✅ Connected to MongoDB at {MONGO_URI}, db={MONGO_DB}")
        return True
    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}")
        return False

# Global variable to store the Whisper model
whisper_model = None

def load_whisper_model():
    """Load the Whisper model once at startup"""
    global whisper_model
    try:
        logger.info("Loading Whisper model...")
        # Use small model for better Windows compatibility and faster loading
        whisper_model = whisper.load_model("medium")
        logger.info("✅ Whisper model loaded successfully!")
        logger.info("✅ XGBoost model loaded successfully!")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to load Whisper model: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "message": "Dyslexia Screening Tool Backend is running",
        "status": "healthy",
        "whisper_model": "loaded" if whisper_model else "not loaded",
        "mongo": "connected" if db is not None else "not connected"
    })

# -----------------------------
# Assessment Storage Endpoints
# -----------------------------

def oid(oid_str):
    try:
        return ObjectId(oid_str)
    except Exception:
        return None

@app.route('/api/assessments', methods=['POST'])
def create_assessment():
    if db is None:
        return jsonify({"error": "database not available"}), 503
    data = request.get_json(force=True, silent=True) or {}
    user = (data.get('user') or {})
    doc = {
        'user': {
            'first': (user.get('first') or '').strip(),
            'last': (user.get('last') or '').strip(),
            'age': int(user.get('age') or 0),
            'sex': (user.get('sex') or '').strip(),
        },
        'ageGroup': data.get('ageGroup') or None,
        'results': {},
        'startedAt': datetime.utcnow(),
        'completedAt': None,
        'version': 1,
    }
    res = db.assessments.insert_one(doc)
    return jsonify({
        'assessmentId': str(res.inserted_id),
        'userId': None,
    })

@app.route('/api/assessments/<assessment_id>', methods=['GET'])
def get_assessment(assessment_id):
    if db is None:
        return jsonify({"error": "database not available"}), 503
    _id = oid(assessment_id)
    if not _id:
        return jsonify({"error": "invalid id"}), 400
    doc = db.assessments.find_one({'_id': _id})
    if not doc:
        return jsonify({"error": "not found"}), 404
    doc['id'] = str(doc.pop('_id'))
    return jsonify(doc)

@app.route('/api/assessments/<assessment_id>/results', methods=['POST'])
def upsert_result(assessment_id):
    if db is None:
        return jsonify({"error": "database not available"}), 503
    _id = oid(assessment_id)
    if not _id:
        return jsonify({"error": "invalid id"}), 400
    data = request.get_json(force=True, silent=True) or {}
    test_type = data.get('type')
    payload = data.get('payload') or {}
    if test_type not in {'questionnaire','pretest','phoneme','nonsense','reading'}:
        return jsonify({"error": "invalid type"}), 400
    # Add server timestamp
    payload['savedAt'] = datetime.utcnow().isoformat()
    update = {
        '$set': {f'results.{test_type}': payload},
        '$setOnInsert': {'startedAt': datetime.utcnow()},
    }
    doc = db.assessments.find_one_and_update(
        {'_id': _id}, update, return_document=ReturnDocument.AFTER
    )
    if not doc:
        return jsonify({"error": "not found"}), 404
    return jsonify({"ok": True})

@app.route('/api/assessments/<assessment_id>/complete', methods=['POST'])
def complete_assessment(assessment_id):
    if db is None:
        return jsonify({"error": "database not available"}), 503
    _id = oid(assessment_id)
    if not _id:
        return jsonify({"error": "invalid id"}), 400
    doc = db.assessments.find_one_and_update(
        {'_id': _id},
        {'$set': {'completedAt': datetime.utcnow()}},
        return_document=ReturnDocument.AFTER
    )
    if not doc:
        return jsonify({"error": "not found"}), 404
    return jsonify({"ok": True})

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe audio file using Whisper"""
    
    try:
        # Check if model is loaded
        if not whisper_model:
            logger.error("Whisper model not loaded")
            return jsonify({"error": "Whisper model not available"}), 500
        
        # Check if audio file is in request
        if 'audio' not in request.files:
            logger.error("No audio file in request")
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        
        # Validate file
        if audio_file.filename == '':
            logger.error("No file selected")
            return jsonify({"error": "No file selected"}), 400
        
        # Log file info
        logger.info(f"Received audio file: {audio_file.filename}")
        logger.info(f"Content type: {audio_file.content_type}")
        
        # Save audio file temporarily
        temp_filename = f"temp_audio_{os.getpid()}.webm"
        temp_path = os.path.join(os.getcwd(), temp_filename)
        
        try:
            # Save the file
            audio_file.save(temp_path)
            
            # Check file was saved
            if not os.path.exists(temp_path):
                raise FileNotFoundError("Failed to save audio file")
            
            file_size = os.path.getsize(temp_path)
            logger.info(f"Audio file saved: {temp_path} ({file_size} bytes)")
            
            if file_size == 0:
                raise ValueError("Audio file is empty")
            
            # Transcribe using Whisper (same logic as test_whisper.py)
            logger.info("Starting Whisper transcription (forced English)...")
            result = whisper_model.transcribe(
                temp_path,
                language='en',
                task='transcribe'
            )
            transcribed_text = result["text"].strip()
            
            logger.info("✅ Transcription successful!")
            logger.info(f"Transcribed text: {transcribed_text[:100]}...")
            
            # Return the transcribed text
            return jsonify({
                "transcribed_text": transcribed_text,
                "success": True
            })
            
        finally:
            # Clean up temporary file
            try:
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                    logger.info("Temporary audio file cleaned up")
            except Exception as cleanup_error:
                logger.warning(f"Failed to cleanup temporary file: {cleanup_error}")
        
    except FileNotFoundError as e:
        logger.error(f"File not found error: {e}")
        return jsonify({"error": "Audio file not found"}), 500
    except ValueError as e:
        logger.error(f"Invalid file error: {e}")
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        logger.error(f"Unexpected error during transcription: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route('/check_pronunciation', methods=['POST'])
def check_pronunciation():
    """Score a short audio clip against a target word/phrase (1 or 0).
    Implements the same file handling/transcription pattern as /transcribe.
    """
    try:
        # Check model loaded
        if not whisper_model:
            logger.error("Whisper model not loaded")
            return jsonify({"error": "Whisper model not available"}), 500

        # Validate request
        if 'audio' not in request.files or 'target' not in request.form:
            logger.error("Missing audio or target in request")
            return jsonify({"error": "audio file and target required"}), 400

        target = request.form['target'].strip().lower()
        audio_file = request.files['audio']
        if audio_file.filename == '':
            logger.error("No file selected")
            return jsonify({"error": "No file selected"}), 400

        # Save temp file (same pattern as /transcribe)
        temp_filename = f"temp_audio_{os.getpid()}_pron.webm"
        temp_path = os.path.join(os.getcwd(), temp_filename)

        try:
            audio_file.save(temp_path)
            if not os.path.exists(temp_path):
                raise FileNotFoundError("Failed to save audio file")

            file_size = os.path.getsize(temp_path)
            logger.info(f"Pronunciation clip saved: {temp_path} ({file_size} bytes)")
            if file_size == 0:
                raise ValueError("Audio file is empty")

            # Transcribe using the same approach as /transcribe
            logger.info("Transcribing pronunciation clip...")
            result = whisper_model.transcribe(
                temp_path,
                language='en',
                task='transcribe'
            )
            transcribed_text = (result.get("text") or "").strip().lower()

            # Simple scoring: exact token match for target
            tokens = re.findall(r"[a-zA-Z]+", transcribed_text)
            is_correct = int(target in tokens or target == transcribed_text)

            # Log outcome in server console
            logger.info(f"Pronunciation target='{target}', transcript='{transcribed_text}', score={is_correct}")

            return jsonify({"success": True, "score": is_correct, "transcript": transcribed_text})
        finally:
            # Cleanup temp file
            try:
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                    logger.info("Pronunciation temp file cleaned up")
            except Exception:
                pass
    except FileNotFoundError as e:
        logger.error(f"File not found error (pronunciation): {e}")
        return jsonify({"error": "Audio file not found"}), 500
    except ValueError as e:
        logger.error(f"Invalid file error (pronunciation): {e}")
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        logger.error(f"check_pronunciation error: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route('/tts_offline', methods=['GET'])
def tts_offline():
    """Generate speech audio (WAV) from text using pyttsx3 and return it."""
    try:
        if pyttsx3 is None:
            return jsonify({"error": "pyttsx3 not installed"}), 500

        text = (request.args.get('text') or '').strip()
        if not text:
            return jsonify({"error": "text query param required"}), 400

        engine = pyttsx3.init()
        # Optional: query params for rate, voice, volume
        rate = request.args.get('rate', type=int)
        volume = request.args.get('volume', type=float)
        voice_index = request.args.get('voice', type=int)
        if rate is not None:
            engine.setProperty('rate', rate)
        if volume is not None:
            engine.setProperty('volume', max(0.0, min(1.0, volume)))
        if voice_index is not None:
            voices = engine.getProperty('voices')
            if 0 <= voice_index < len(voices):
                engine.setProperty('voice', voices[voice_index].id)

        temp_filename = f"tts_{os.getpid()}.wav"
        temp_path = os.path.join(os.getcwd(), temp_filename)
        try:
            engine.save_to_file(text, temp_path)
            engine.runAndWait()
            if not os.path.exists(temp_path):
                raise FileNotFoundError("Failed to synthesize audio")
            return send_file(temp_path, mimetype='audio/wav', as_attachment=False)
        finally:
            try:
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
            except Exception:
                pass
    except Exception as e:
        logger.error(f"tts_offline error: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Load Whisper model at startup
    if not load_whisper_model():
        logger.error("Failed to load Whisper model. Exiting.")
        exit(1)
    # Init Mongo
    init_mongo()
    
    logger.info("🚀 Starting Dyslexia Screening Tool Backend...")
    logger.info("📝 Using Whisper medium model for transcription")
    logger.info("🌐 Server will run on http://localhost:5000")
    
    app.run(host='0.0.0.0', port=5000, debug=False)
