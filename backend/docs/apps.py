from django.apps import AppConfig

class DocsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "docs"
    label = "docs"

    def ready(self):
        import docs.wagtail_hooks