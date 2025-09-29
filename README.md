# RAG-Chatbot
This project is a Retrieval-Augmented Generation (RAG) system that combines document processing, vector search, and large language models (LLMs) to build an intelligent chatbot capable of answering questions based on files, links, or free queries.

It was developed as part of my final year engineering project .

🚀 Features

🔹 Multi-source input

Free questions

File upload (PDF, DOCX, PPTX, CSV, images, audio, video)

Web links and YouTube videos

🔹 Document processing

OCR for images (Tesseract)

Speech-to-text for audio/video (Whisper)

Web scraping (BeautifulSoup, newspaper3k)

🔹 Vector storage & search

Chunking and embeddings (LangChain, Cohere/SentenceTransformers)

Storage in ChromaDB for fast semantic search

🔹 LLM integration

Mistral model executed locally with Ollama

Contextual response generation with RAG pipeline

🔹 Visualization

Automatic mindmap generation from uploaded files

⚙️ Tech Stack

Frontend: React, Vite

Backend: FastAPI, LangChain, python

Database: Supabase (users & history), ChromaDB (vector store)

LLM: Mistral via Ollama

Processing: Whisper (audio), Tesseract (OCR), BeautifulSoup, PyMuPDF, python-docx, python-pptx, pandas

Visualization: Markmap (mindmap rendering)



▶️ Installation & Usage

1. Clone the repository
   git clone https://github.com/your-username/rag-chatbot.git
2. Backend setup
   
pip install -r requirements.txt

uvicorn main:app --reload

3. Frontend setup:
   
npm run dev
