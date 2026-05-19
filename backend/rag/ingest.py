from fastembed import TextEmbedding
from langchain.text_splitter import RecursiveCharacterTextSplitter
from pypdf import PdfReader
import psycopg2
import json

EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5"
DB_CONFIG = {
    "dbname": "ragdb",
    "user": "raguser",
    "password": "ragpass",
    "host": "db",
    "port": 5432,
}

embedder = TextEmbedding(model_name=EMBEDDING_MODEL)

def get_conn():
    return psycopg2.connect(**DB_CONFIG)

def setup_tabla():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    cur.execute("""
        CREATE TABLE IF NOT EXISTS fragmentos (
            id SERIAL PRIMARY KEY,
            documento_id INTEGER,
            titulo TEXT,
            autor TEXT,
            proyecto TEXT,
            archivo TEXT,
            pagina INTEGER,
            contenido TEXT,
            embedding vector(384)
        );
    """)
    conn.commit()
    cur.close()
    conn.close()

def extraer_texto_pdf(ruta_pdf: str) -> list[dict]:
    reader = PdfReader(ruta_pdf)
    paginas = []
    for i, page in enumerate(reader.pages):
        texto = page.extract_text()
        if texto and texto.strip():
            paginas.append({"pagina": i + 1, "texto": texto})
    return paginas

def ingestar_pdf(ruta_pdf: str, metadatos: dict):
    setup_tabla()

    paginas = extraer_texto_pdf(ruta_pdf)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=600,
        chunk_overlap=80,
    )

    fragmentos = []
    for pagina in paginas:
        chunks = splitter.split_text(pagina["texto"])
        for chunk in chunks:
            fragmentos.append({
                "pagina": pagina["pagina"],
                "contenido": chunk,
            })

    if not fragmentos:
        raise ValueError("No se pudo extraer texto del PDF")

    textos = [f["contenido"] for f in fragmentos]
    embeddings = list(embedder.embed(textos))

    conn = get_conn()
    cur = conn.cursor()

    for i, frag in enumerate(fragmentos):
        cur.execute("""
            INSERT INTO fragmentos
                (documento_id, titulo, autor, proyecto, archivo, pagina, contenido, embedding)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            metadatos.get("documento_id"),
            metadatos.get("titulo"),
            metadatos.get("autor"),
            metadatos.get("proyecto"),
            metadatos.get("archivo"),
            frag["pagina"],
            frag["contenido"],
            json.dumps(embeddings[i].tolist()),
        ))

    conn.commit()
    cur.close()
    conn.close()

    print(f" {len(fragmentos)} fragmentos indexados")