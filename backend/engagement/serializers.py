from rest_framework import serializers
from .models import EngagementLog, Comment
from accounts.serializers import UserSerializer

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'content_id', 'content_type', 'text', 'created_at']
        read_only_fields = ['user', 'created_at']

class EngagementLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EngagementLog
        fields = ['id', 'user', 'content_id', 'content_type', 'action', 'created_at']
        read_only_fields = ['user', 'created_at']
