from rag_engine.url_extractors.url_web import extract_text_from_html
from rag_engine.url_extractors.url_youtube import extract_text_from_youtube

def extract_text_from_url_or_youtube(url: str) -> str:
    if "youtube.com" in url or "youtu.be" in url:
        return extract_text_from_youtube(url)
    else:
        return extract_text_from_html(url)






