import tempfile
import ffmpeg
from rag_engine.extractors.audio import transcribe_audio  # <-- importe ta fonction ici

def extract_audio_ffmpeg(video_path):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_audio:
        audio_path = tmp_audio.name
    (
        ffmpeg
        .input(video_path)
        .output(audio_path, format='mp3')
        .overwrite_output()
        .run(quiet=True)
    )
    # Lis le contenu audio en bytes pour passer à transcribe_audio
    with open(audio_path, "rb") as f:
        audio_bytes = f.read()
    return audio_bytes

def transcribe_video(file_bytes):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp_video:
        tmp_video.write(file_bytes)
        tmp_video_path = tmp_video.name

    audio_bytes = extract_audio_ffmpeg(tmp_video_path)
    transcription = transcribe_audio(audio_bytes)
    return transcription
