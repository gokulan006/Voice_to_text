import sys
sys.stdout.reconfigure(encoding="utf-8")
import os
import torch
from faster_whisper import WhisperModel

try:

    # Get the uploaded audio file path from Node.js
    audio_path = sys.argv[1]
    print(f"Processing audio file: {audio_path}")

     # Check if file exists
    if not os.path.exists(audio_path):
        print(f"Error: File not found - {audio_path}")
        sys.exit(1)
        
    # Load Whisper model (only once, GPU if available)
    model = WhisperModel("medium", device="cuda" if torch.cuda.is_available() else "cpu")

    # Transcribe the audio
    segments, _ = model.transcribe(audio_path)

    # Join and print transcription for Node.js
    transcription = " ".join(segment.text for segment in segments)
    print(transcription)

except Exception as e:
    print(f"Error during transcription: {str(e)}")
    sys.exit(1)  # Exit with error code 1 to indicate failure