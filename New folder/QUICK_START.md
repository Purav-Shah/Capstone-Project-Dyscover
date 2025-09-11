# Quick Start Guide

Get your Dyslexia Screening Tool up and running in minutes!

## Prerequisites Check

Before starting, ensure you have:
- ✅ **Node.js 18+** installed ([Download here](https://nodejs.org/))
- ✅ **Python 3.8+** installed ([Download here](https://www.python.org/downloads/))
- ✅ **Microphone** connected and working
- ✅ **Stable internet** (for initial Whisper model download)

## Option 1: Automatic Startup (Windows)

1. **Start the Backend First**
   - Double-click `start_backend.bat`
   - Wait for "Whisper model loaded successfully!" message
   - Keep this window open

2. **Start the Frontend**
   - Double-click `start_frontend.bat`
   - Wait for "Ready - started server on 0.0.0.0:3000" message
   - Keep this window open

3. **Open Your Browser**
   - Navigate to `http://localhost:3000`
   - Grant microphone permissions when prompted

## Option 2: Manual Startup

### Step 1: Backend Setup
```bash
# Open Command Prompt or PowerShell
cd /d "C:\Purav\Capstone"

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
python app.py
```

**Wait for**: "Whisper model loaded successfully!" message

### Step 2: Frontend Setup
```bash
# Open new Command Prompt or PowerShell
cd /d "C:\Purav\Capstone"

# Install dependencies
npm install

# Start development server
npm run dev
```

**Wait for**: "Ready - started server on 0.0.0.0:3000" message

### Step 3: Access Application
- Open browser and go to `http://localhost:3000`
- Grant microphone permissions

## First Run Notes

⚠️ **Important**: The first time you run the backend, it will download the Whisper model (~1.5GB). This may take 5-15 minutes depending on your internet speed.

## Testing the Application

1. **Check Backend Health**
   - Visit `http://localhost:5000/health`
   - Should see: `{"status": "healthy", "message": "Dyslexia Screening Tool Backend is running"}`

2. **Test Frontend**
   - Visit `http://localhost:3000`
   - Should see the dyslexia screening interface
   - Click "Start Recording" to test microphone access

## Troubleshooting

### Backend Won't Start
- Check Python version: `python --version`
- Ensure virtual environment is activated
- Check internet connection for model download

### Frontend Won't Start
- Check Node.js version: `node --version`
- Ensure you're in the correct directory
- Try deleting `node_modules` and running `npm install` again

### Microphone Issues
- Check browser permissions
- Test microphone in other applications
- Ensure no other apps are using the microphone

### CORS Errors
- Ensure backend is running on port 5000
- Ensure frontend is running on port 3000
- Check browser console for specific error messages

## Stopping the Application

- **Backend**: Press `Ctrl+C` in the backend terminal
- **Frontend**: Press `Ctrl+C` in the frontend terminal
- **Both**: Close the terminal windows

## Next Steps

Once everything is running:
1. Read the full [README.md](README.md) for detailed information
2. Test the complete workflow: record → transcribe → analyze
3. Customize the reading passage in `app/page.js`
4. Explore the code structure for modifications

## Need Help?

- Check the [README.md](README.md) for comprehensive documentation
- Review terminal output for error messages
- Ensure both services are running simultaneously
- Verify microphone permissions in your browser

