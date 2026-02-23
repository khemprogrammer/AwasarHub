from rest_framework import serializers
from .models import Opportunity
from accounts.serializers import UserSerializer


class OpportunitySerializer(serializers.ModelSerializer):
    posted_by_details = UserSerializer(source='posted_by', read_only=True)

    class Meta:
        model = Opportunity
        fields = "__all__"
