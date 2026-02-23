from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    followers_count = serializers.IntegerField(source='followers.count', read_only=True)
    following_count = serializers.IntegerField(source='following.count', read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "city",
            "country",
            "headline",
            "bio",
            "latitude",
            "longitude",
            "interests",
            "streak_count",
            "preferences",
            "date_joined",
            "followers_count",
            "following_count",
        ]
        read_only_fields = ["id", "streak_count", "date_joined", "followers_count", "following_count"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        user = User(username=validated_data["username"], email=validated_data.get("email"))
        user.set_password(validated_data["password"])
        user.save()
        return user
