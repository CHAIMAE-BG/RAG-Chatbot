import yt_dlp
import whisper
import tempfile
import os

def extract_text_from_youtube(url):
    with tempfile.TemporaryDirectory() as tmpdir:
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': f'{tmpdir}/%(id)s.%(ext)s',
            'quiet': True
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            audio_path = os.path.join(tmpdir, f"{info['id']}.{info['ext']}")

        model = whisper.load_model("base")
        result = model.transcribe(audio_path)
        return result["text"]