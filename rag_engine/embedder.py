from sentence_transformers import SentenceTransformer

#embed_model = SentenceTransformer("all-MiniLM-L6-v2")
#embed_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
embed_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2", device='cpu')

def embed_text(texts):
    return embed_model.encode(texts).tolist()
