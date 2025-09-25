import requests
from bs4 import BeautifulSoup
import tempfile
from rag_engine.extractors.audio import transcribe_audio

def extract_text_from_html(url: str) -> str:
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, "html.parser")

        for element in soup(["script", "style", "noscript"]):
            element.extract()

        text = soup.get_text(separator="\n")
        return "\n".join(line.strip() for line in text.splitlines() if line.strip())

    except Exception as e:
        raise RuntimeError(f"Erreur lors de l'extraction HTML depuis {url}: {e}")