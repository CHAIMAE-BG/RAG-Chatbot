import whisper
import tempfile

def transcribe_audio(file_bytes):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name
    model = whisper.load_model("base")
    result = model.transcribe(tmp_path)
    return result["text"]