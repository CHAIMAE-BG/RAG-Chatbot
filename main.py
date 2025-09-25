from fastapi import FastAPI, UploadFile, File, Body, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_engine.rag_pipeline import get_rag_answer, get_open_answer
from rag_engine.embedder import embed_text
from rag_engine.document_indexer import collection
from rag_engine.extractors import extract_text_by_extension
from rag_engine.url_loader import extract_text_from_url_or_youtube
from rag_engine.mindmap_extractor import generate_mindmap_from_text
from langchain.text_splitter import TokenTextSplitter
from slugify import slugify
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:5173"],  # Adaptable selon ton frontend
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Upload fichier ===
@app.post("/upload")
async def upload(background_tasks: BackgroundTasks, file: UploadFile = File(...)):

    content = await file.read()
    ext = file.filename.split(".")[-1].lower()

    try:
        text = extract_text_by_extension(content, ext)
    except ValueError:
        return {"error": f"Extension {ext} non supportée."}

    chunks = chunk_text(text)
    store_chunks(chunks, file.filename)

    # Génération de mindmap en tâche de fond
    background_tasks.add_task(generate_mindmap_from_text, text, file.filename)

    return {
        "message": f"{len(chunks)} morceaux enregistrés depuis {file.filename}",
        "filename": file.filename
    }

# === Upload depuis URL ou YouTube ===
@app.post("/url")
async def process_url(url: str = Body(..., embed=True)):
    try:
        source_name = slugify(url)
        text = extract_text_from_url_or_youtube(url)

        chunks = chunk_text(text)
        store_chunks(chunks, source_name)

        return {
            "message": f"{len(chunks)} morceaux extraits depuis l'URL",
            "document_name": source_name
        }
    except Exception as e:
        return {"error": str(e)}

def chunk_text(text):
    encoding_name = "cl100k_base"
    splitter = TokenTextSplitter(
        encoding_name=encoding_name,
        chunk_size=500,
        chunk_overlap=100,
    )
    return splitter.split_text(text)

def store_chunks(chunks, file_name):
    for idx, chunk in enumerate(chunks):
        embedding = embed_text([chunk])
        collection.upsert(
            ids=[f"{file_name}_{idx}"],
            documents=[chunk],
            embeddings=embedding,
            metadatas=[{"source": file_name, "chunk_index": idx}],
        )

class ChatRequest(BaseModel):
    message: str
    model: str = "mistral"
    use_rag: bool = False
    document_name: str | None = None

class ChatResponse(BaseModel):
    response: str

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if request.use_rag:
        result = get_rag_answer(request.message, request.model, request.document_name)
    else:
        result = get_open_answer(request.message, request.model)

    return ChatResponse(response=result)


