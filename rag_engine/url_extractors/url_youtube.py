import os
import subprocess
import whisper

TRANSCRIPT_DIR = "transcript"
AUDIO_FILE = "audio.mp3"


def get_video_id(url: str) -> str:
    if "watch?v=" in url:
        return url.split("watch?v=")[1].split("&")[0]
    elif "youtu.be/" in url:
        return url.split("youtu.be/")[1]
    raise ValueError("URL YouTube invalide.")

def download_audio(url: str, output=AUDIO_FILE):
    command = [
        "yt-dlp", "-f", "bestaudio",
        "--extract-audio", "--audio-format", "mp3",
        "-o", output, url
    ]
    subprocess.run(command, check=True)

def transcribe_audio(audio_file: str) -> str:
    model = whisper.load_model("base")
    result = model.transcribe(audio_file, fp16=False)
    return result["text"].strip()

def extract_text_from_youtube(url: str) -> str:
    video_id = get_video_id(url)
    os.makedirs(TRANSCRIPT_DIR, exist_ok=True)
    transcript_path = os.path.join(TRANSCRIPT_DIR, f"{video_id}.txt")

    # Si le transcript existe déjà, on le lit
    if os.path.exists(transcript_path):
        with open(transcript_path, "r", encoding="utf-8") as f:
            return f.read()

    # Sinon, on télécharge et transcrit
    download_audio(url)
    text = transcribe_audio(AUDIO_FILE)

    # On sauvegarde pour éviter de refaire à chaque fois
    with open(transcript_path, "w", encoding="utf-8") as f:
        f.write(text)

    return text
