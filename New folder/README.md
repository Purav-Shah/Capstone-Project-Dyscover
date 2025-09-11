# Dyslexia Screening Tool

A full-stack, offline dyslexia screening tool that uses audio recording and transcription to assess reading abilities. The application consists of a Next.js frontend and a Python Flask backend with OpenAI Whisper integration.

## Features

- **Audio Recording**: Capture audio using the browser's MediaRecorder API
- **Speech-to-Text**: Offline transcription using OpenAI Whisper (medium model)
- **Reading Analysis**: Calculate Words Per Minute (WPM) and error counts
- **Visual Comparison**: Side-by-side comparison of original vs. transcribed text
- **Error Classification**: Identify correct, incorrect, omitted, and added words
- **Offline Capability**: Works without internet connection after initial setup

## Project Structure

```
dyslexia-screening-tool/
├── app/                    # Next.js frontend (App Router)
│   ├── globals.css        # Tailwind CSS styles
│   ├── layout.js          # Root layout component
│   └── page.js            # Main application page
├── app.py                 # Python Flask backend
├── requirements.txt       # Python dependencies
├── package.json           # Node.js dependencies
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
└── README.md              # This file
```

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **Microphone access** in your browser
- **Sufficient RAM** (Whisper medium model requires ~1.5GB)

## Installation & Setup

### 1. Frontend Setup (Next.js)

```bash
# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 2. Backend Setup (Python Flask)

```bash
# Create and activate virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```

The backend will be available at `http://localhost:5000`

**Note**: The first time you run the backend, it will download the Whisper medium model (~1.5GB), which may take several minutes depending on your internet connection.

## Usage

1. **Open the Application**: Navigate to `http://localhost:3000` in your browser
2. **Grant Microphone Access**: Allow the browser to access your microphone when prompted
3. **Read the Passage**: Read the displayed passage aloud at your normal pace
4. **Start Recording**: Click "Start Recording" and begin reading
5. **Stop Recording**: Click "Stop Recording" when finished
6. **View Results**: The application will process your audio and display:
   - Words Per Minute (WPM)
   - Total error count
   - Detailed analysis (correct, omitted, added words)
   - Side-by-side text comparison with color coding

## API Endpoints

### Backend (`http://localhost:5000`)

- `GET /health` - Health check endpoint
- `POST /transcribe` - Audio transcription endpoint
  - **Input**: Multipart form data with audio file
  - **Output**: JSON with transcribed text

## Technical Details

### Frontend (Next.js)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Audio Recording**: MediaRecorder API
- **State Management**: React hooks (useState, useRef)
- **HTTP Client**: Fetch API

### Backend (Python Flask)
- **Framework**: Flask 2.3.3
- **CORS**: Flask-CORS for cross-origin requests
- **Speech Recognition**: OpenAI Whisper (medium model)
- **Audio Processing**: Temporary file handling with cleanup
- **Error Handling**: Comprehensive error handling and logging

### Audio Processing
- **Format**: WAV audio files
- **Recording**: Browser-based MediaRecorder API
- **Transcription**: OpenAI Whisper medium model (offline)
- **Model Loading**: Single model load on server startup

## Troubleshooting

### Common Issues

1. **Microphone Access Denied**
   - Check browser permissions
   - Ensure microphone is not being used by other applications

2. **Whisper Model Download Issues**
   - Ensure stable internet connection for initial download
   - Check available disk space (requires ~1.5GB)
   - Verify Python environment and dependencies

3. **CORS Errors**
   - Ensure backend is running on port 5000
   - Check that Flask-CORS is properly installed
   - Verify frontend is making requests to correct URL

4. **Audio Recording Issues**
   - Test microphone in other applications
   - Check browser console for errors
   - Ensure HTTPS (required for MediaRecorder in some browsers)

### Performance Tips

- **Whisper Model**: The medium model provides good accuracy vs. speed balance
- **Audio Quality**: Clear speech and minimal background noise improve transcription accuracy
- **Browser**: Use modern browsers (Chrome, Firefox, Safari) for best MediaRecorder support

## Development

### Adding New Features

1. **Frontend**: Modify components in `app/page.js`
2. **Backend**: Add new routes in `app.py`
3. **Styling**: Update Tailwind classes in components
4. **Dependencies**: Add new packages to respective dependency files

### Testing

- **Frontend**: Use `npm run dev` for development with hot reload
- **Backend**: Restart Python server after code changes
- **Integration**: Test full workflow from recording to results display

## License

This project is open source and available under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console and server logs
3. Ensure all dependencies are properly installed
4. Verify both frontend and backend are running

