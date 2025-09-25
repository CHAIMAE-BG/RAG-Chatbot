import openpyxl
import io

def extract_text_from_xlsx(file_bytes: bytes) -> str:
    workbook = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True)
    text = ""

    for sheet in workbook.worksheets:
        text += f"\n--- Feuille: {sheet.title} ---\n"
        for row in sheet.iter_rows(values_only=True):
            line = "\t".join([str(cell) if cell is not None else "" for cell in row])
            text += line + "\n"

    return text
