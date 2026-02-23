from django.db import models
from django.conf import settings


class AIBriefing(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    date = models.DateField()
    script_text = models.TextField(blank=True)
    video_url = models.URLField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "date")

    def __str__(self):
        return f"{self.user_id}-{self.date}"
