import json
import tempfile
import os
import io
from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from .models import Document, Proyecto
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
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_document(request):
    try:
        file = request.FILES.get("file")

        if not file:
            return JsonResponse({"error": "No se envió ningún archivo"}, status=400)

        title = request.POST.get("title", file.name)
        project_name = request.POST.get("project", "General")

        # Obtener o crear proyecto
        proyecto, _ = Proyecto.objects.get_or_create(
            nombre=project_name,
            defaults={"created_by": request.user}
        )

        # Leer contenido
        file_content = file.read()

        # Guardar en MinIO
        client = get_minio_client()
        minio_key = f"{project_name}/{file.name}"

        try:
            client.head_bucket(Bucket=settings.MINIO_BUCKET)
        except:
            client.create_bucket(Bucket=settings.MINIO_BUCKET)

        client.upload_fileobj(io.BytesIO(file_content), settings.MINIO_BUCKET, minio_key)

        # Guardar metadatos
        doc = Document.objects.create(
            title=title,
            author=request.user,
            project=proyecto,
            file_name=file.name,
            minio_key=minio_key,
        )

        # Indexar
        tmp_fd, tmp_path = tempfile.mkstemp(suffix=".pdf")
        try:
            with os.fdopen(tmp_fd, 'wb') as tmp:
                tmp.write(file_content)

            ingestar_pdf(tmp_path, {
                "documento_id": doc.id,
                "titulo": title,
                "autor": request.user.username,
                "proyecto": project_name,
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
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def query_document(request):
    try:
        data = request.data
        pregunta = data.get("pregunta", "").strip()
        documento_ids = data.get("documento_ids", [])

        if not pregunta:
            return JsonResponse({"error": "No se envió ninguna pregunta"}, status=400)

        documento_ids = [int(id) for id in documento_ids if id]

        def stream():
            for token in consultar_stream(pregunta, documento_ids=documento_ids):
                yield token

        return StreamingHttpResponse(stream(), content_type="text/plain; charset=utf-8")

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_documents(request):
    proyecto_nombre = request.GET.get("proyecto", None)
    
    docs = Document.objects.filter(indexed=True).select_related("author", "project")
    
    if proyecto_nombre:
        docs = docs.filter(project__nombre=proyecto_nombre)

    result = []
    for doc in docs:
        result.append({
            "id": doc.id,
            "title": doc.title,
            "author": doc.author.username if doc.author else "Desconocido",
            "project": doc.project.nombre if doc.project else "General",
            "file_name": doc.file_name,
            "uploaded_at": doc.uploaded_at.isoformat(),
        })

    return JsonResponse({"documentos": result})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_proyectos(request):
    proyectos = Proyecto.objects.all().values("id", "nombre", "created_at")
    return JsonResponse({"proyectos": list(proyectos)}, json_dumps_params={"default": str})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def crear_proyecto(request):
    try:
        nombre = request.data.get("nombre", "").strip()
        descripcion = request.data.get("descripcion", "")

        if not nombre:
            return JsonResponse({"error": "El nombre es requerido"}, status=400)

        proyecto, created = Proyecto.objects.get_or_create(
            nombre=nombre,
            defaults={"created_by": request.user, "descripcion": descripcion}
        )

        return JsonResponse({
            "ok": True,
            "id": proyecto.id,
            "nombre": proyecto.nombre,
            "created": created
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def serve_document(request, documento_id):
    try:
        doc = Document.objects.get(id=documento_id)
        client = get_minio_client()
        url = client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": settings.MINIO_BUCKET,
                "Key": doc.minio_key,
                "ResponseContentType": "application/pdf",
                "ResponseContentDisposition": "inline",
            },
            ExpiresIn=3600,
        )
        url = url.replace("http://minio:9000", "http://localhost:9000")
        return JsonResponse({"url": url})
    except Document.DoesNotExist:
        return JsonResponse({"error": "Documento no encontrado"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    