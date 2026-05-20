from wagtail import hooks
from wagtail.snippets.models import register_snippet
from wagtail.snippets.views.snippets import SnippetViewSet
from .models import Document

class DocumentViewSet(SnippetViewSet):
    model = Document
    menu_label = "Documentos RAG"
    icon = "doc-full"
    menu_name = "documentos-rag"
    list_display = ["title", "project", "author", "uploaded_at", "indexed"]
    search_fields = ["title", "project", "author"]

register_snippet(DocumentViewSet)