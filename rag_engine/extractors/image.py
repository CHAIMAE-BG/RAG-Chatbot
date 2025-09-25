from PIL import Image
import pytesseract
from io import BytesIO
import torch
from transformers import BlipProcessor, BlipForConditionalGeneration

# Charger une seule fois
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

def extract_text_from_image(file_bytes):
    image = Image.open(BytesIO(file_bytes)).convert("RGB")

    # OCR
    # ocr_text = pytesseract.image_to_string(image)
    ocr_text = pytesseract.image_to_string(image, lang="fra+eng")


    # Description via BLIP
    inputs = processor(image, return_tensors="pt")
    out = model.generate(**inputs)
    description = processor.decode(out[0], skip_special_tokens=True)

    # Résumé enrichi
    return f"🖼️ Description visuelle : {description}\n📜 Texte OCR : {ocr_text.strip()}"

