from rag_engine.extractors.pdf import extract_text_from_pdf
from rag_engine.extractors.docx import extract_text_from_docx
from rag_engine.extractors.txt import extract_text_from_txt
from rag_engine.extractors.csv import extract_text_from_csv
from rag_engine.extractors.xlsx import extract_text_from_xlsx
from rag_engine.extractors.pptx import extract_text_from_pptx
from rag_engine.extractors.audio import transcribe_audio
from rag_engine.extractors.video import transcribe_video
from rag_engine.extractors.image import extract_text_from_image


def extract_text_by_extension(file_bytes: bytes, extension: str) -> str:
    extension = extension.lower()
    if extension == "pdf":
        return extract_text_from_pdf(file_bytes)
    elif extension == "docx":
        return extract_text_from_docx(file_bytes)
    elif extension == "txt":
        return extract_text_from_txt(file_bytes)
    elif extension == "csv":
        return extract_text_from_csv(file_bytes)
    elif extension == "xlsx":
        return extract_text_from_xlsx(file_bytes)
    elif extension == "pptx":
        return extract_text_from_pptx(file_bytes)
    elif extension in ["mp3", "wav", "m4a"]:
        return transcribe_audio(file_bytes)
    elif extension in ["png", "jpg", "jpeg"]:
        return extract_text_from_image(file_bytes)
    elif extension in "mp4":
        return transcribe_video(file_bytes)
    else:
        raise ValueError(f"Extension de fichier non supportée : {extension}")
