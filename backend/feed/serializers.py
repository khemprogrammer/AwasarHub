from rest_framework import serializers
from .models import FeedContent


class FeedContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedContent
        fields = "__all__"
