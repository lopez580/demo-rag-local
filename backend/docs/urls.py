from django.urls import path
from . import views

urlpatterns = [
    path("upload/", views.upload_document, name="upload_document"),
    path("query/", views.query_document, name="query_document"),
    path("documentos/", views.list_documents, name="list_documents"),
]