from rag_engine.embedder import embed_text
from rag_engine.document_indexer import collection
from openai import OpenAI
import cohere

# Initialise le client Cohere
co = cohere.ClientV2("skA4meLOdsOqbU1F8uL37VMBiPOAUriS7GmFjOj6")

def get_rag_answer(question: str, model_name: str, document_name: str | None = None) -> str:
    

    """
    Génère une réponse en utilisant RAG avec ChromaDB + rerank + Ollama
    """

    query_embedding = embed_text([question])
    

    # ✅ Filtrer uniquement les chunks du document si fourni
    if document_name:
        results = collection.query(
            query_embeddings=query_embedding,
            n_results=5,
            where={"source": document_name}
        )
    else:
        results = collection.query(
            query_embeddings=query_embedding,
            n_results=5
        )

    docs = results["documents"][0] if results["documents"] else []

    if not docs:
        return "Aucun contenu pertinent trouvé."

    # 🔁 Rerank avec Cohere
    reranked = co.rerank(
        model="rerank-v3.5",
        query=question,
        documents=docs,
        top_n=3
    )
    top_chunks = [docs[r.index] for r in reranked.results]

    # 🔮 Génération avec Ollama (compatible OpenAI API)
    client = OpenAI(base_url="http://localhost:11434/v1", api_key=model_name)
    messages = [
        {"role": "system", "content": "Tu es un assistant intelligent qui répond uniquement avec les documents fournis."},
        {"role": "user", "content": question + "\n\n" + "\n".join(top_chunks)}
    ]
    response = client.chat.completions.create(
        model=model_name,
        messages=messages,
        max_tokens=500
    )

    return response.choices[0].message.content


def get_open_answer(prompt: str, model_name: str) -> str:
    """
    Génère une réponse libre sans contexte document
    """
    client = OpenAI(base_url="http://localhost:11434/v1", api_key=model_name)
    messages = [
        {"role": "system", "content": "Tu es un assistant utile et concis."},
        {"role": "user", "content": prompt}
    ]
    response = client.chat.completions.create(
        model=model_name,
        messages=messages,
        max_tokens=500
    )

    return response.choices[0].message.content
