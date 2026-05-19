from django.db import models

class Document(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    project = models.CharField(max_length=255)
    file_name = models.CharField(max_length=255)
    minio_key = models.CharField(max_length=500)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    indexed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} — {self.project}"

    class Meta:
        verbose_name = "Documento"
        verbose_name_plural = "Documentos"