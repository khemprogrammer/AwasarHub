from django.db import models


class FeedContent(models.Model):
    CONTENT_TYPES = [
        ("NEWS", "News"),
        ("JOB", "Job"),
        ("OPPORTUNITY", "Opportunity"),
        ("VIDEO", "Video"),
    ]
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES, default="NEWS")
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True)
    source_url = models.URLField(blank=True)
    tags = models.JSONField(default=list, blank=True)
    city = models.CharField(max_length=120, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    video_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.content_type}: {self.title}"
