from pathlib import Path
import subprocess
import ollama
from langdetect import detect

class MindMapGenerator:
    def __init__(self, model: str = "mistral", markmap_js_path: str = "render_markmap_html.cjs"):
        self.model = model
        self.markmap_js_path = markmap_js_path

    def create_mindmap(self, text: str, output_md: str = "mindmap.md") -> str:
        """Génère une carte mentale Markdown à partir d'un texte donné."""
        md_content = self._generate_markmap_markdown(text)
        cleaned_md = self.clean_markdown(md_content)
        md_file = Path(output_md)
        md_file.write_text(cleaned_md.strip(), encoding="utf-8")
        print(f"[INFO] Markdown mind map saved to: {md_file}")
        return str(md_file)

    def _generate_markmap_markdown(self, text: str) -> str:
        """Détecte la langue et construit un prompt adapté pour Ollama."""

        lang = detect(text)

        if lang == "fr":
            prompt = f"""
Tu es un expert en mind mapping. Tu vas lire un texte en français, qu’il soit structuré ou non, et en générer une carte mentale visuelle et hiérarchique au format Markdown.

Objectif :
- Si le texte est un paragraphe unifié, identifie un thème central et génère au moins 3 idées principales, chacune avec des sous-idées.
- Si le texte contient déjà des titres, utilise-les pour structurer la carte.
- Représente les concepts sous forme de brainstorming organisé comme dans une carte mentale.
- Utilise uniquement des en-têtes Markdown : # (thème central), ## (branches principales), ### (sous-idées).

Ne reformule pas et ne donne pas d'interprétation personnelle.

Exemple :
# Thème central
## Idée 1
### Détail 1.1
### Détail 1.2
## Idée 2
### ...
Voici le texte :
{text}
"""
        else:
            prompt = f"""
You are a mind map expert. You will be given a text (structured or a single paragraph). Your task is to extract the central theme and generate a brainstorming-style hierarchical mind map in Markdown.

Goal:
- If it's a single paragraph, extract the main theme and generate 3+ main ideas with sub-ideas.
- If it has titles, use them to structure the map.
- Use Markdown headings only: #, ##, ###. Do not return anything else.

Example:
# Main Topic
## Idea 1
### Detail 1.1
### Detail 1.2
## Idea 2
### ...
Here is the text:
{text}
"""

        response = ollama.chat(model=self.model, messages=[{"role": "user", "content": prompt}])
        return response["message"]["content"]

    def clean_markdown(self, markdown_text: str) -> str:
        """Nettoie le markdown pour Markmap (enlève les lignes inutiles)."""
        return "\n".join(
            line.lstrip()
            for line in markdown_text.splitlines()
            if line.strip().startswith("#")
        )

    def render_html(self, md_file: str, output_html: str = "mindmap.html"):
        """Génère le HTML interactif via Markmap CLI."""
        md_path = Path(md_file)
        if not md_path.exists():
            raise FileNotFoundError(f"{md_file} not found.")

        subprocess.run(["node", self.markmap_js_path, str(md_path), output_html], check=True)
        print(f"[INFO] Mind map HTML saved to: {output_html}")


