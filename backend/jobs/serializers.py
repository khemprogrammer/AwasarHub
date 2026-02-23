from rest_framework import serializers
from .models import Job
from accounts.serializers import UserSerializer


class JobSerializer(serializers.ModelSerializer):
    posted_by_details = UserSerializer(source='posted_by', read_only=True)

    class Meta:
        model = Job
        fields = "__all__"
        read_only_fields = ["posted_by", "created_at"]
