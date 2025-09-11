import './globals.css'

export const metadata = {
  title: 'Dyslexia Screening Tool',
  description: 'Offline dyslexia screening tool with audio recording and transcription',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}

