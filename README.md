# DYSCOVER - AI-Powered Dyslexia Screening Tool

A comprehensive, AI-powered dyslexia screening tool designed for children aged 3-12 years. DYSCOVER combines multiple assessment tests with machine learning to provide accurate risk classification and personalized recommendations.

## 🎯 Overview

DYSCOVER is a full-stack web application that helps parents and educators identify early signs of dyslexia in children through:
- **Parent Questionnaire**: Structured questions about child's development and learning
- **Pretest**: Age-appropriate pattern recognition and shape matching
- **Phoneme Awareness Tests**: Assessment of sound recognition and pronunciation
- **Reading Fluency Tests**: Oral reading with WPM and error analysis
- **Nonsense Word Decoding**: Pseudoword repetition and decoding skills

## ✨ Key Features

### Assessment Components
- **Multi-Age Support**: Tailored tests for 3-5, 6-8, and 9-12 age groups
- **Comprehensive Testing**: 5 different test types covering all dyslexia indicators
- **Real-time Audio Transcription**: Whisper ASR model fine-tuned for Indian English child speech
- **Automated Scoring**: Automatic calculation of scores and risk levels
- **Chronological Results Display**: Test results shown in order of completion

### AI & Machine Learning
- **XGBoost Risk Classification**: 93.5% accuracy, 98.8% AUROC for risk prediction
- **Personalized Recommendations**: Gemini AI-powered suggestions based on weak areas
- **Decision Tree Logic**: Rule-based risk assessment with weighted scoring
- **Feature Importance**: Identifies which test areas contribute most to risk

### User Experience
- **Beautiful Modern UI**: Gradient backgrounds, dark mode support, responsive design
- **Progress Tracking**: Visual progress indicators for each test
- **Comprehensive Reports**: Detailed breakdown of all test results
- **Areas of Improvement**: AI-generated personalized recommendations
- **MongoDB Integration**: Persistent storage of assessment data

## 📊 Assessment Metrics

### Questionnaire Scoring
- **Scoring System**: 
  - Yes = 0 points (indicates concern)
  - Sometimes = 1 point
  - No = 2 points (indicates no concern)
- **Lower Score = Higher Risk**
- **Age-Specific Thresholds**:
  - Age 3-5: 0-12 (High), 13-24 (Medium), 25-36 (Low)
  - Age 6-8: 0-15 (High), 16-27 (Medium), 28-40 (Low)
  - Age 9-12: 0-15 (High), 16-27 (Medium), 28-40 (Low)

### Risk Classification
- **Low Risk**: Minimal indicators, normal development
- **Medium Risk**: Some concerns, preventive interventions recommended
- **High Risk**: Multiple indicators, professional consultation recommended

### Model Performance
- **XGBoost Accuracy**: 93.52%
- **AUROC**: 0.9883 (macro, one-vs-rest)
- **Sensitivity**: 93.52% (weighted recall)
- **Specificity**: 96.76% (macro)
- **Precision**: 93.52% (weighted)

## 🏗️ Project Structure

```
Capstone/
├── CTOPP Test/              # Next.js Frontend
│   ├── app/
│   │   ├── questionnaire/   # Parent questionnaire module
│   │   ├── pretest/         # Pretest assessments
│   │   ├── phoneme/         # Phoneme awareness tests
│   │   ├── reading/         # Reading fluency tests
│   │   ├── nonsense/        # Nonsense word decoding
│   │   ├── results/         # Comprehensive results page
│   │   └── utils/
│   │       ├── riskCalculator.js      # Risk calculation logic
│   │       ├── decisionTree.js        # Decision tree implementation
│   │       └── geminiRecommendations.js # AI recommendations
│   ├── package.json
│   └── README.md
├── analysis/                 # Machine Learning Models
│   ├── xgb.py              # XGBoost model training
│   ├── xgb_model.json      # Trained XGBoost model
│   └── xgb_results_summary.txt
├── app.py                   # Flask Backend
├── requirements.txt         # Python dependencies
├── dyslexia_screening_dataset_MDA.csv  # Training dataset
└── venv/                    # Python virtual environment
```

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.8+
- **MongoDB** (local or cloud instance)
- **Microphone access** in browser
- **RAM**: ~2GB+ (for Whisper model)

### 1. Frontend Setup

```bash
cd "CTOPP Test"
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up MongoDB connection (optional)
# Create .env file with:
# MONGO_URI=mongodb://localhost:27017
# MONGO_DB=dyscover

# Start Flask server
python app.py
```

Backend runs on `http://localhost:5000`

**Note**: First run downloads Whisper medium model (~1.5GB)

### 3. MongoDB Setup (Optional)

```bash
# Install MongoDB locally or use MongoDB Atlas
# Update .env file with connection string
MONGO_URI=mongodb://localhost:27017
MONGO_DB=dyscover
```

## 📖 Usage Guide

### Starting an Assessment

1. **Navigate to Home**: Open `http://localhost:3000`
2. **Enter Child Information**: Name, age, gender
3. **Complete Questionnaire**: Answer 18-20 questions based on age
4. **Take Pretest**: Age-appropriate pattern/shape recognition
5. **Phoneme Test**: Sound recognition and pronunciation
6. **Reading Test**: Read passage aloud (for ages 6+)
7. **Nonsense Words**: Decode pseudowords (if applicable)
8. **View Results**: Comprehensive assessment with recommendations

### Understanding Results

- **Overall Risk Assessment**: Low/Medium/High risk classification
- **Composite Score**: Weighted score from all tests (0-100)
- **Individual Test Results**: Detailed breakdown by test type
- **Areas of Improvement**: AI-generated personalized recommendations
- **Test Order**: Results displayed chronologically

## 🔌 API Endpoints

### Backend (`http://localhost:5000`)

#### Assessment Management
- `POST /api/assessments` - Create new assessment
- `GET /api/assessments/<id>` - Get assessment data
- `POST /api/assessments/<id>/results` - Save test results
- `POST /api/assessments/<id>/complete` - Mark assessment complete

#### Audio Processing
- `POST /transcribe` - Transcribe audio using Whisper
  - Input: Multipart form data with audio file
  - Output: `{ "transcribed_text": "...", "success": true }`
  
- `POST /check_pronunciation` - Score pronunciation
  - Input: Audio file + target word
  - Output: `{ "score": 0|1, "transcript": "..." }`

#### Utilities
- `GET /health` - Health check
- `GET /tts_offline` - Text-to-speech (offline)

## 🧠 Machine Learning Integration

### XGBoost Model

The XGBoost model uses 5 features:
- `phoneme_score`: Phoneme awareness performance
- `pattern_score`: Pattern recognition ability
- `nonsense_score`: Nonsense word decoding
- `reading_wpm`: Reading speed (words per minute)
- `questionnaire_score`: Parent questionnaire responses

**Model Configuration**:
- Objective: `multi:softprob` (multi-class classification)
- Classes: Low Risk, Medium Risk, High Risk
- Estimators: 120
- Max Depth: 3
- Learning Rate: 0.07
- Regularization: L2 (lambda=1.0)

### Gemini AI Recommendations

- **API**: Google Gemini 2.0 Flash
- **Purpose**: Generate personalized recommendations based on weak areas
- **Input**: Test results, demographics, risk assessment
- **Output**: 4-6 actionable, age-appropriate recommendations

## 🎨 Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Audio**: MediaRecorder API
- **Storage**: localStorage + MongoDB

### Backend
- **Framework**: Flask 2.3.3
- **ASR**: OpenAI Whisper (medium model)
- **Database**: MongoDB (via pymongo)
- **CORS**: Flask-CORS
- **ML**: XGBoost

### AI/ML
- **Speech Recognition**: Whisper-medium (fine-tuned for Indian English)
- **Risk Classification**: XGBoost (gradient boosting)
- **Recommendations**: Google Gemini 2.0 Flash API

## 📈 Data & Performance

### Dataset
- **Total Sessions**: 2,004 assessments
- **Age Range**: 3-12 years
- **Features**: 5 test domains
- **Classes**: 3 risk levels (balanced)

### ASR Performance
- **Phoneme Tasks**: 96.5% agreement, 3.2% CER, 4.8% WER
- **Pseudowords**: 94.1% agreement, 5.6% CER, 7.9% WER
- **Oral Reading**: 91.3% agreement, 7.8% CER, 10.5% WER

### Reliability (Cronbach's Alpha)
- **Phoneme Awareness**: α = 0.91 (Excellent)
- **Decoding**: α = 0.88 (Good)
- **Oral Reading**: α = 0.86 (Good)

## 🔧 Configuration

### Environment Variables (.env)

```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB=dyscover
```

### Gemini API Key

Update in `CTOPP Test/app/utils/geminiRecommendations.js`:
```javascript
const GEMINI_API_KEY = 'your-api-key-here';
```

## 🐛 Troubleshooting

### Common Issues

1. **Whisper Model Not Loading**
   - Ensure stable internet for first download
   - Check disk space (~1.5GB required)
   - Verify Python environment

2. **MongoDB Connection Failed**
   - Check MongoDB is running
   - Verify connection string in .env
   - Test connection: `mongosh mongodb://localhost:27017`

3. **Audio Transcription Errors**
   - Check microphone permissions
   - Ensure clear audio quality
   - Verify Whisper model loaded

4. **Gemini API Errors**
   - Verify API key is correct
   - Check API quota/limits
   - Review network connectivity

5. **CORS Errors**
   - Ensure backend running on port 5000
   - Check Flask-CORS configuration
   - Verify frontend URL matches

## 🧪 Testing

### Manual Testing Flow
1. Complete full assessment for each age group
2. Verify results are saved to MongoDB
3. Check risk classification accuracy
4. Test Gemini recommendations generation
5. Verify chronological test ordering

### Model Training
```bash
cd analysis
python xgb.py
```

This generates:
- `xgb_medium_model.json` - Trained model
- `xgb_results_summary.txt` - Performance metrics
- `xgb_confusion_matrix.csv` - Classification details
- `xgb_roc_curve.png` - ROC curve visualization

## 📝 Recent Updates

- ✅ Reversed questionnaire scoring (Yes=0, No=2)
- ✅ Added pretest support for age 9-12
- ✅ Chronological test results display
- ✅ Gemini AI personalized recommendations
- ✅ "Areas of Improvement" section
- ✅ Enhanced risk calculation with decision trees

## 🔮 Future Enhancements

- [ ] Add longitudinal progress tracking
- [ ] Export PDF reports
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Teacher dashboard

## 📄 License

This project is open source and available under the MIT License.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For issues and questions:
- Check troubleshooting section above
- Review browser console and server logs
- Ensure all dependencies are installed
- Verify both frontend and backend are running

## 🙏 Acknowledgments

- OpenAI Whisper for speech recognition
- XGBoost for risk classification
- Google Gemini for personalized recommendations
- Research community for dyslexia screening methodologies

---

**DYSCOVER** - Making dyslexia screening accessible, accurate, and actionable.
