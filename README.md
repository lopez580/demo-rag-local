# Demo RAG Local 

Demo funcional de un sistema RAG (Retrieval Augmented Generation) local para gestión inteligente de documentación técnica.

## ¿Qué hace?

Permite subir documentos PDF, indexarlos automáticamente y hacer preguntas en lenguaje natural sobre su contenido. Las respuestas se generan en tiempo real (streaming) citando siempre la fuente exacta del documento.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js (App Router, TypeScript) |
| Backend | Django + Wagtail |
| Embeddings | FastEmbed (BAAI/bge-small-en-v1.5) |
| LLM | Ollama (Llama 3.1 8B) — local |
| Base de datos | PostgreSQL + pgvector |
| Almacenamiento | MinIO |

## Requisitos

- Docker Desktop
- Ollama instalado en el host con el modelo `llama3.1:8b`

## Levantar el proyecto

```bash
# 1. Clonar el repositorio
git clone <repo>
cd demo-rag

# 2. Levantar servicios
docker compose up --build

# 3. Correr migraciones (primera vez)
docker compose exec backend python manage.py migrate

# 4. Crear superusuario
docker compose exec backend python manage.py createsuperuser

# 5. Levantar frontend
cd frontend
npm install
npm run dev
```

## Servicios disponibles

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Wagtail Admin | http://localhost:8000/admin |
| pgAdmin | http://localhost:5050 |
| MinIO consola | http://localhost:9001 |

## Flujo principal

1. El usuario sube un PDF desde el frontend
2. El backend extrae el texto y lo divide en fragmentos
3. FastEmbed genera embeddings de cada fragmento
4. Los embeddings se guardan en pgvector
5. El usuario hace una pregunta en el chat
6. El sistema busca los fragmentos más relevantes
7. Ollama genera una respuesta en streaming citando las fuentes

## Notas

- Ollama corre en el host, no en Docker
- Los modelos de Ollama se guardan en `D:\ollama\models`
- Esta es una demo — no usar en producción sin configurar autenticación y variables de entorno seguras