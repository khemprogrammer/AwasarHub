from django.contrib import admin
from .models import Opportunity


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ("id", "org", "title", "category", "city", "created_at")
    search_fields = ("org", "title", "category", "city", "tags")
