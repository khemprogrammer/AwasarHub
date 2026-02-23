from django.contrib import admin
from .models import Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("id", "company", "title", "city", "created_at")
    search_fields = ("company", "title", "city", "tags")
