import pandas as pd
from io import BytesIO

def extract_text_from_excel(file_bytes):
    excel = pd.ExcelFile(BytesIO(file_bytes))
    result = []

    for sheet in excel.sheet_names:
        df = excel.parse(sheet)
        text_table = df.to_markdown(index=False)
        result.append(f"📄 Feuille : {sheet}\n{text_table}")

    return "\n\n".join(result)
