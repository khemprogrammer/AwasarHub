from rest_framework import serializers
from .models import AIBriefing


class AIBriefingSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIBriefing
        fields = "__all__"
