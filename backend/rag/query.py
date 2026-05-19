from fastembed import TextEmbedding
import psycopg2
import requests
import json

EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5"
OLLAMA_URL = "http://host.docker.internal:11434/api/generate"
LLM_MODEL = "llama3.1:8b"

DB_CONFIG = {
    "dbname": "ragdb",
    "user": "raguser",
    "password": "ragpass",
    "host": "db",
    "port": 5432,
}

embedder = TextEmbedding(model_name=EMBEDDING_MODEL)

PROMPT_TEMPLATE = """Eres un asistente técnico de Intesc Electrónicos & Embebidos.
Responde ÚNICAMENTE con información presente en el contexto proporcionado.
Si no encuentras la información, responde exactamente: "No encontré información sobre esto en los documentos disponibles."
No inventes datos, cifras ni procedimientos.

CONTEXTO:
{contexto}

PREGUNTA: {pregunta}

RESPUESTA:"""

def get_conn():
    return psycopg2.connect(**DB_CONFIG)

def buscar_fragmentos(pregunta: str, top_k: int = 4) -> list[dict]:
    embedding = list(embedder.embed([pregunta]))[0].tolist()

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT contenido, titulo, archivo, pagina, proyecto,
               1 - (embedding <=> %s::vector) AS score
        FROM fragmentos
        ORDER BY embedding <=> %s::vector
        LIMIT %s
    """, (json.dumps(embedding), json.dumps(embedding), top_k))

    resultados = []
    for row in cur.fetchall():
        resultados.append({
            "contenido": row[0],
            "titulo": row[1],
            "archivo": row[2],
            "pagina": row[3],
            "proyecto": row[4],
            "score": round(float(row[5]), 4),
        })

    cur.close()
    conn.close()
    return resultados

def consultar_stream(pregunta: str):
    fragmentos = buscar_fragmentos(pregunta)

    if not fragmentos:
        yield "No encontré información sobre esto en los documentos disponibles."
        return

    contexto = "\n\n".join([
        f"[Fuente: {f['archivo']} — pág. {f['pagina']}]\n{f['contenido']}"
        for f in fragmentos
    ])

    prompt = PROMPT_TEMPLATE.format(
        contexto=contexto,
        pregunta=pregunta,
    )

    # Stream desde Ollama
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": LLM_MODEL,
            "prompt": prompt,
            "stream": True,
        },
        stream=True,
        timeout=120,
    )

    for line in response.iter_lines():
        if line:
            data = json.loads(line)
            token = data.get("response", "")
            if token:
                yield token
            if data.get("done"):
                # Enviar fuentes al final
                fuentes = "\n\n---\n**Fuentes:**\n"
                for f in fragmentos:
                    fuentes += f"- {f['archivo']} — pág. {f['pagina']} (score: {f['score']})\n"
                yield fuentes
                break