import requests
from bs4 import BeautifulSoup

def extract_text_from_website(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, "html.parser")
    for tag in soup(["script", "style", "header", "footer", "nav"]):
        tag.decompose()
    text = soup.get_text(separator="\n")
    return "\n".join(line.strip() for line in text.splitlines() if line.strip())