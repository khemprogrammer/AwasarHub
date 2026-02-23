from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    city = models.CharField(max_length=120, blank=True)
    country = models.CharField(max_length=120, blank=True)
    headline = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    interests = models.JSONField(default=list, blank=True)
    streak_count = models.PositiveIntegerField(default=0)
    preferences = models.JSONField(default=dict, blank=True)

    def location_tuple(self):
        if self.latitude is not None and self.longitude is not None:
            return (self.latitude, self.longitude)
        return None


class Connection(models.Model):
    follower = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    following = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')
