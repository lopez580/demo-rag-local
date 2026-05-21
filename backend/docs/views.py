import json
import tempfile
import os
from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Document
from rag.ingest import ingestar_pdf
from rag.query import consultar_stream
import boto3
from django.conf import settings

def get_minio_client():
    return boto3.client(
        "s3",
        endpoint_url=f"http://{settings.MINIO_ENDPOINT}",
        aws_access_key_id=settings.MINIO_ACCESS_KEY,
        aws_secret_access_key=settings.MINIO_SECRET_KEY,
    )

@csrf_exempt
@require_http_methods(["POST"])
def upload_document(request):
    try:
        file = request.FILES.get("file")

        if not file:
            return JsonResponse({"error": "No se envió ningún archivo"}, status=400)

        title = request.POST.get("title", file.name)
        author = request.POST.get("author", "Desconocido")
        project = request.POST.get("project", "General")

        # Leer contenido del archivo en memoria antes de cualquier otra operación
        file_content = file.read()

        # Guardar en MinIO
        import io
        client = get_minio_client()
        minio_key = f"{project}/{file.name}"

        try:
            client.head_bucket(Bucket=settings.MINIO_BUCKET)
        except:
            client.create_bucket(Bucket=settings.MINIO_BUCKET)

        client.upload_fileobj(io.BytesIO(file_content), settings.MINIO_BUCKET, minio_key)

        # Guardar metadatos en PostgreSQL
        doc = Document.objects.create(
            title=title,
            author=author,
            project=project,
            file_name=file.name,
            minio_key=minio_key,
        )

        # Guardar temporalmente e indexar
        tmp_fd, tmp_path = tempfile.mkstemp(suffix=".pdf")
        try:
            with os.fdopen(tmp_fd, 'wb') as tmp:
                tmp.write(file_content)

            ingestar_pdf(tmp_path, {
                "documento_id": doc.id,
                "titulo": title,
                "autor": author,
                "proyecto": project,
                "archivo": file.name,
            })
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

        doc.indexed = True
        doc.save()

        return JsonResponse({
            "ok": True,
            "documento_id": doc.id,
            "mensaje": f"'{title}' indexado correctamente"
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def query_document(request):
    try:
        data = json.loads(request.body)
        pregunta = data.get("pregunta", "").strip()

        if not pregunta:
            return JsonResponse({"error": "No se envió ninguna pregunta"}, status=400)

        def stream():
            for token in consultar_stream(pregunta):
                yield token

        return StreamingHttpResponse(stream(), content_type="text/plain; charset=utf-8")

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@require_http_methods(["GET"])
def list_documents(request):
    docs = Document.objects.filter(indexed=True).values(
        "id", "title", "author", "project", "file_name", "uploaded_at"
    )
    return JsonResponse({"documentos": list(docs)}, json_dumps_params={"default": str})