from django.db import models
from django.conf import settings


class Opportunity(models.Model):
    org = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100, blank=True)  # scholarship, grant, internship
    city = models.CharField(max_length=120, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)
    link_url = models.URLField(blank=True)
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.org} - {self.title}"
