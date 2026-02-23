from django.contrib import admin
from .models import FeedContent


@admin.register(FeedContent)
class FeedContentAdmin(admin.ModelAdmin):
    list_display = ("id", "content_type", "title", "city", "created_at")
    search_fields = ("title", "city", "tags")
