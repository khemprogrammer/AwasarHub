from django.contrib import admin
from .models import EngagementLog


@admin.register(EngagementLog)
class EngagementLogAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "content_id", "action", "created_at")
    search_fields = ("user__username", "content_id", "action")
