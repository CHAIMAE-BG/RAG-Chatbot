import csv
import io

def extract_text_from_csv(file_bytes: bytes) -> str:
    try:
        decoded = file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        decoded = file_bytes.decode("latin-1", errors="ignore")

    reader = csv.reader(io.StringIO(decoded))
    lines = ["\t".join(row) for row in reader]
    return "\n".join(lines)
