import chromadb

db = chromadb.PersistentClient(path="./chroma_db")
collection = db.get_or_create_collection(name="documents")
