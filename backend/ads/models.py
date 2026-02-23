from django.db import models
from django.conf import settings


class Advertisement(models.Model):
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True)
    category = models.CharField(max_length=120, blank=True)
    city = models.CharField(max_length=120, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)
    link_url = models.URLField(blank=True)
    bid_cpm = models.FloatField(default=0.0)
    bid_cpc = models.FloatField(default=0.0)
    enabled = models.BooleanField(default=True)
    advertiser = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
