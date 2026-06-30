from django.urls import path
from . import views

urlpatterns = [
    path("upload/", views.upload_document, name="upload_document"),
    path("query/", views.query_document, name="query_document"),
    path("documentos/", views.list_documents, name="list_documents"),
    path("proyectos/", views.list_proyectos, name="list_proyectos"),
    path("proyectos/crear/", views.crear_proyecto, name="crear_proyecto"),
    path("documentos/<int:documento_id>/url/", views.serve_document, name="serve_document"),
]