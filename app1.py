#!/usr/bin/env python3
"""
Dyslexia Screening Tool Backend
Simple Flask server with Whisper transcription
"""

import os
import logging
import warnings
from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import torch

# Suppress FP16 warnings
warnings.filterwarnings("ignore", category=UserWarning)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Global variables to store the Whisper model and device
whisper_model = None
whisper_device = "cpu"

def load_whisper_model():
    """Load the Whisper model once at startup, preferring GPU when available"""
    global whisper_model, whisper_device
    try:
        logger.info("Loading Whisper model...")
        # Prefer CUDA GPU if available; fallback to CPU
        whisper_device = "cuda" if torch.cuda.is_available() else "cpu"
        if whisper_device == "cuda":
            logger.info(f"Detected CUDA GPU: {torch.cuda.get_device_name(0)}")
        else:
            logger.info("CUDA GPU not available, using CPU")

        # Use small model for better Windows/VRAM compatibility
        whisper_model = whisper.load_model("small", device=whisper_device)
        logger.info("✅ Whisper model loaded successfully!")
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
        "device": whisper_device
    })

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
            
            # Transcribe using Whisper
            logger.info("Starting Whisper transcription...")
            # Enable fp16 when on CUDA; CPU uses fp32
            use_fp16 = (whisper_device == "cuda")
            result = whisper_model.transcribe(temp_path, fp16=use_fp16)
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

if __name__ == '__main__':
    # Load Whisper model at startup
    if not load_whisper_model():
        logger.error("Failed to load Whisper model. Exiting.")
        exit(1)
    
    logger.info("🚀 Starting Dyslexia Screening Tool Backend...")
    logger.info("📝 Using Whisper small model for transcription")
    logger.info(f"💻 Inference device: {whisper_device}")
    logger.info("🌐 Server will run on http://localhost:5000")

    # Disable reloader to avoid double-loading the model
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
