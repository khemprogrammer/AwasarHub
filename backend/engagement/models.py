from django.db import models
from django.conf import settings


class EngagementLog(models.Model):
    ACTIONS = [
        ("view", "view"),
        ("click", "click"),
        ("apply", "apply"),
        ("skip", "skip"),
        ("like", "like"),
        ("repost", "repost"),
        ("share", "share"),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content_id = models.IntegerField()
    content_type = models.CharField(max_length=32, blank=True)
    action = models.CharField(max_length=16, choices=ACTIONS)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_id}-{self.content_id}-{self.action}"


class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content_id = models.IntegerField()
    content_type = models.CharField(max_length=32)  # e.g., 'job', 'opportunity'
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.content_type}:{self.content_id}"
