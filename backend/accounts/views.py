from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import RegisterSerializer, UserSerializer
from jobs.models import Job
from opportunities.models import Opportunity
from jobs.serializers import JobSerializer
from opportunities.serializers import OpportunitySerializer
from engagement.models import EngagementLog, Comment
from .models import Connection, User
from django.shortcuts import get_object_or_404
from django.db.models import Q


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserPostsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        jobs = Job.objects.filter(posted_by=user)
        opportunities = Opportunity.objects.filter(posted_by=user)
        
        job_data = JobSerializer(jobs, many=True).data
        opp_data = OpportunitySerializer(opportunities, many=True).data
        
        for j in job_data:
            j['type'] = 'job'
            j['likes'] = EngagementLog.objects.filter(content_type='job', content_id=j['id'], action='like').count()
            j['comments'] = Comment.objects.filter(content_type='job', content_id=j['id']).count()
            j['reposts'] = EngagementLog.objects.filter(content_type='job', content_id=j['id'], action='repost').count()
            j['shares'] = EngagementLog.objects.filter(content_type='job', content_id=j['id'], action='share').count()
            j['liked_by_user'] = EngagementLog.objects.filter(content_type='job', content_id=j['id'], action='like', user=request.user).exists()

        for o in opp_data:
            o['type'] = 'opportunity'
            o['likes'] = EngagementLog.objects.filter(content_type='opportunity', content_id=o['id'], action='like').count()
            o['comments'] = Comment.objects.filter(content_type='opportunity', content_id=o['id']).count()
            o['reposts'] = EngagementLog.objects.filter(content_type='opportunity', content_id=o['id'], action='repost').count()
            o['shares'] = EngagementLog.objects.filter(content_type='opportunity', content_id=o['id'], action='share').count()
            o['liked_by_user'] = EngagementLog.objects.filter(content_type='opportunity', content_id=o['id'], action='like', user=request.user).exists()

        all_posts = sorted(job_data + opp_data, key=lambda x: x['created_at'], reverse=True)
        return Response(all_posts)


class FollowUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, username):
        user_to_follow = get_object_or_404(User, username=username)
        if request.user == user_to_follow:
            return Response({"error": "You cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)
        
        Connection.objects.get_or_create(follower=request.user, following=user_to_follow)
        return Response({"status": "following", "username": username})

    def delete(self, request, username):
        user_to_unfollow = get_object_or_404(User, username=username)
        Connection.objects.filter(follower=request.user, following=user_to_unfollow).delete()
        return Response({"status": "unfollowed", "username": username})


class UserConnectionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        followers = Connection.objects.filter(following=request.user).select_related('follower')
        following = Connection.objects.filter(follower=request.user).select_related('following')
        
        return Response({
            "followers": UserSerializer([c.follower for c in followers], many=True).data,
            "following": UserSerializer([c.following for c in following], many=True).data
        })


class PublicUserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        serializer = UserSerializer(user)
        data = serializer.data
        
        # Add connection status
        data['is_following'] = Connection.objects.filter(follower=request.user, following=user).exists()
        data['followers_count'] = user.followers.count()
        data['following_count'] = user.following.count()
        
        return Response(data)


class PublicUserPostsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        jobs = Job.objects.filter(posted_by=user)
        opportunities = Opportunity.objects.filter(posted_by=user)
        
        job_data = JobSerializer(jobs, many=True).data
        opp_data = OpportunitySerializer(opportunities, many=True).data
        
        for j in job_data:
            j['type'] = 'job'
            j['likes'] = EngagementLog.objects.filter(content_type='job', content_id=j['id'], action='like').count()
            j['comments'] = Comment.objects.filter(content_type='job', content_id=j['id']).count()
            j['reposts'] = EngagementLog.objects.filter(content_type='job', content_id=j['id'], action='repost').count()
            j['shares'] = EngagementLog.objects.filter(content_type='job', content_id=j['id'], action='share').count()
            j['liked_by_user'] = EngagementLog.objects.filter(content_type='job', content_id=j['id'], action='like', user=request.user).exists()

        for o in opp_data:
            o['type'] = 'opportunity'
            o['likes'] = EngagementLog.objects.filter(content_type='opportunity', content_id=o['id'], action='like').count()
            o['comments'] = Comment.objects.filter(content_type='opportunity', content_id=o['id']).count()
            o['reposts'] = EngagementLog.objects.filter(content_type='opportunity', content_id=o['id'], action='repost').count()
            o['shares'] = EngagementLog.objects.filter(content_type='opportunity', content_id=o['id'], action='share').count()
            o['liked_by_user'] = EngagementLog.objects.filter(content_type='opportunity', content_id=o['id'], action='like', user=request.user).exists()

        all_posts = sorted(job_data + opp_data, key=lambda x: x['created_at'], reverse=True)
        return Response(all_posts)


class UserSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response([])
        
        users = User.objects.filter(
            Q(username__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        ).distinct()[:10]  # Limit to 10 results
        
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
