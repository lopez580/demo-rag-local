from django.db import models
from django.contrib.auth.models import User


class Proyecto(models.Model):
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="proyectos")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Proyecto"
        verbose_name_plural = "Proyectos"


class Document(models.Model):
    title = models.CharField(max_length=255)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="documentos")
    project = models.ForeignKey(Proyecto, on_delete=models.SET_NULL, null=True, related_name="documentos")
    file_name = models.CharField(max_length=255)
    minio_key = models.CharField(max_length=500)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    indexed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} — {self.project}"

    class Meta:
        verbose_name = "Documento"
        verbose_name_plural = "Documentos"
        permissions = [
            ("can_upload", "Puede subir documentos"),
            ("can_query", "Puede hacer consultas"),
            ("can_delete", "Puede eliminar documentos"),
        ]