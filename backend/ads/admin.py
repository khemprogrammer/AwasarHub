from django.contrib import admin
from .models import Advertisement


@admin.register(Advertisement)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "city", "category", "bid_cpm", "bid_cpc", "enabled", "created_at")
    search_fields = ("title", "city", "category", "tags")
