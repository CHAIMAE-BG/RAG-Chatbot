import fitz
from rag_engine.extractors.image import extract_text_from_image  # <-- import depuis image.py

def extract_text_from_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_content = []

    for page_index, page in enumerate(doc):
        page_text = page.get_text("text")
        full_content.append(f"\n📄 Page {page_index + 1} - Texte :\n{page_text.strip()}")

        # Extraire les images de la page
        images = page.get_images(full=True)
        for img_index, img in enumerate(images):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]

            # Réutilise la fonction d’analyse d’image
            image_analysis = extract_text_from_image(image_bytes)
            full_content.append(f"\n🖼️ Page {page_index + 1} - Image {img_index + 1} :\n{image_analysis}")

    return "\n\n".join(full_content)
