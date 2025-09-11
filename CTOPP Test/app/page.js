'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    router.push('/questionnaire')
  }, [router])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [transcribedText, setTranscribedText] = useState('')
  const [results, setResults] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingIntervalRef = useRef(null)
  const startTimeRef = useRef(null)

  // Hardcoded reading passage for dyslexia screening
  const originalPassage = "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet at least once. It is commonly used to test typing speed and accuracy. Reading this passage aloud can help identify potential reading difficulties."

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      })
      
      // Try to use WAV format first, fallback to WebM if not supported
      let mimeType = 'audio/wav'
      if (!MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/webm;codecs=opus'
        console.log('WAV not supported, using WebM fallback')
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType
      })
      audioChunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = () => {
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current.start(1000) // Collect data every second
      setIsRecording(true)
      startTimeRef.current = Date.now()
      
      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Error accessing microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(recordingIntervalRef.current)
      
      // Create audio blob and send for transcription
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      console.log('Audio blob created:', audioBlob.size, 'bytes, type:', audioBlob.type)
      sendAudioForTranscription(audioBlob)
    }
  }

  const sendAudioForTranscription = async (audioBlob) => {
    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      
      const response = await fetch('http://localhost:5000/transcribe', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setTranscribedText(data.transcribed_text)
      
      // Calculate results
      calculateResults(data.transcribed_text)
      
    } catch (error) {
      console.error('Error transcribing audio:', error)
      alert('Error transcribing audio. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const calculateResults = (transcribed) => {
    // Remove punctuation and convert to lowercase for comparison
    const cleanOriginal = originalPassage.toLowerCase().replace(/[.,!?;:]/g, '')
    const cleanTranscribed = transcribed.toLowerCase().replace(/[.,!?;:]/g, '')
    
    const originalWords = cleanOriginal.split(/\s+/)
    const transcribedWords = cleanTranscribed.split(/\s+/)
    
    // Calculate WPM
    const durationMinutes = recordingTime / 60
    const wpm = transcribedWords.length / durationMinutes
    
    // Calculate errors
    let errorCount = 0
    let correctWords = 0
    let omittedWords = 0
    let addedWords = 0
    
    // Compare word by word
    const maxLength = Math.max(originalWords.length, transcribedWords.length)
    
    for (let i = 0; i < maxLength; i++) {
      if (i < originalWords.length && i < transcribedWords.length) {
        if (originalWords[i] === transcribedWords[i]) {
          correctWords++
        } else {
          errorCount++
        }
      } else if (i < originalWords.length) {
        omittedWords++
        errorCount++
      } else {
        addedWords++
        errorCount++
      }
    }
    
    setResults({
      wpm: Math.round(wpm * 100) / 100,
      errorCount,
      correctWords,
      omittedWords,
      addedWords,
      duration: recordingTime,
      originalWords: originalWords,
      transcribedWords: transcribedWords
    })
  }

  const resetRecording = () => {
    setIsRecording(false)
    setRecordingTime(0)
    setTranscribedText('')
    setResults(null)
    setIsProcessing(false)
    audioChunksRef.current = []
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
    if (startTimeRef.current) {
      startTimeRef.current = null
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }



  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">
          Dyslexia Screening Tool
        </h1>
        <div className="flex justify-center mb-8">
          <a
            href="/questionnaire"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
          >
            Parent Questionnaire
          </a>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Original Passage */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Reading Passage</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-800 leading-relaxed text-lg">
                {originalPassage}
              </p>
            </div>
            
            {/* Recording Controls */}
            <div className="mt-6 space-y-4">
              {!isRecording && !results && (
                <button
                  onClick={startRecording}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Start Recording
                </button>
              )}
              
              {isRecording && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 mb-2">
                      Recording... {formatTime(recordingTime)}
                    </div>
                    <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse mx-auto"></div>
                  </div>
                  <button
                    onClick={stopRecording}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Stop Recording
                  </button>
                </div>
              )}
              
              {isProcessing && (
                <div className="text-center py-4">
                  <div className="text-lg text-gray-600 mb-2">Processing audio...</div>
                  <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              )}
              
              {results && (
                <button
                  onClick={resetRecording}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Record Again
                </button>
              )}
            </div>
          </div>
          
          {/* Right Column - Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Results</h2>
            
            {results ? (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-100 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-800">{results.wpm}</div>
                    <div className="text-sm text-blue-600">Words Per Minute</div>
                  </div>
                  <div className="bg-red-100 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-800">{results.errorCount}</div>
                    <div className="text-sm text-red-600">Total Errors</div>
                  </div>
                </div>
                
                {/* Detailed Stats */}
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Detailed Analysis</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Correct Words: <span className="font-semibold text-green-600">{results.correctWords}</span></div>
                    <div>Omitted Words: <span className="font-semibold text-yellow-600">{results.omittedWords}</span></div>
                    <div>Added Words: <span className="font-semibold text-red-600">{results.addedWords}</span></div>
                    <div>Duration: <span className="font-semibold text-gray-600">{formatTime(results.duration)}</span></div>
                  </div>
                </div>
                
                {/* Transcribed Text */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Your Reading</h3>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-gray-800 leading-relaxed">
                      {transcribedText || 'No transcription available'}
                    </p>
                  </div>
                </div>
                
                {/* Word-by-Word Comparison */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Word Comparison</h3>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex flex-wrap gap-1">
                      {originalPassage.split(/\s+/).map((word, index) => {
                        // Get the clean word (without punctuation) for comparison
                        const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '')
                        const cleanTranscribedWords = transcribedText.toLowerCase().replace(/[.,!?;:]/g, '').split(/\s+/)
                        
                        let wordClass = 'bg-gray-200 text-gray-800' // Default
                        
                        if (index < cleanTranscribedWords.length) {
                          if (cleanWord === cleanTranscribedWords[index]) {
                            wordClass = 'bg-green-200 text-green-800' // Correct
                          } else {
                            wordClass = 'bg-red-200 text-red-800' // Incorrect
                          }
                        } else {
                          wordClass = 'bg-yellow-200 text-yellow-800' // Omitted
                        }
                        
                        return (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded text-sm font-medium ${wordClass}`}
                          >
                            {word}
                          </span>
                        )
                      })}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="inline-block w-3 h-3 bg-green-200 rounded mr-1"></span> Correct
                      <span className="inline-block w-3 h-3 bg-red-200 rounded mx-1"></span> Incorrect
                      <span className="inline-block w-3 h-3 bg-yellow-200 rounded mx-1"></span> Omitted
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <div className="text-6xl mb-4">📖</div>
                <p className="text-lg">Start recording to see your results here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
