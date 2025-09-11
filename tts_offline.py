#!/usr/bin/env python3
"""
Offline Text-to-Speech using pyttsx3 (no API key, free).

Notes:
- Windows: uses SAPI5 voices (works out of the box)
- macOS: uses NSSpeechSynthesizer (works out of the box)
- Linux: requires eSpeak/Espeak NG installed (e.g., sudo apt install espeak)

Usage:
  python tts_offline.py --text "Hello there" --out hello.wav
  python tts_offline.py --text "Hello there"           # play directly
  python tts_offline.py --rate 180 --voice 0 --text "Hi"
"""

import argparse
import sys
from typing import Optional

try:
    import pyttsx3  # pip install pyttsx3
except Exception as import_error:
    print("Error: pyttsx3 is not installed.\nInstall with: pip install pyttsx3", file=sys.stderr)
    raise


def list_voices(engine: pyttsx3.Engine):
    voices = engine.getProperty('voices')
    for i, v in enumerate(voices):
        print(f"[{i}] id={v.id} name={getattr(v, 'name', '')} lang={getattr(v, 'languages', '')}")


def synthesize(text: str, out_path: Optional[str], rate: Optional[int], volume: Optional[float], voice_index: Optional[int]):
    engine = pyttsx3.init()
    if rate is not None:
        engine.setProperty('rate', rate)
    if volume is not None:
        engine.setProperty('volume', max(0.0, min(1.0, volume)))
    if voice_index is not None:
        voices = engine.getProperty('voices')
        if 0 <= voice_index < len(voices):
            engine.setProperty('voice', voices[voice_index].id)

    if out_path:
        engine.save_to_file(text, out_path)
        engine.runAndWait()
        print(f"✅ Audio saved to: {out_path}")
    else:
        engine.say(text)
        engine.runAndWait()
        print("✅ Spoke to default output device")


def main():
    parser = argparse.ArgumentParser(description="Offline TTS with pyttsx3 (no API key)")
    parser.add_argument('--text', type=str, required=True, help='Text to synthesize')
    parser.add_argument('--out', type=str, help='Output WAV/AIFF file (plays live if omitted)')
    parser.add_argument('--rate', type=int, help='Speech rate (words per minute)')
    parser.add_argument('--volume', type=float, help='Volume 0.0–1.0')
    parser.add_argument('--voice', type=int, help='Voice index (use --list-voices to inspect)')
    parser.add_argument('--list-voices', action='store_true', help='List available voices and exit')
    args = parser.parse_args()

    engine = pyttsx3.init()
    if args.list_voices:
        list_voices(engine)
        return

    synthesize(text=args.text, out_path=args.out, rate=args.rate, volume=args.volume, voice_index=args.voice)


if __name__ == '__main__':
    main()



