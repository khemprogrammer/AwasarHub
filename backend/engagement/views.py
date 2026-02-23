from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import EngagementLog, Comment
from .serializers import CommentSerializer, EngagementLogSerializer

class EngagementActionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        content_type = request.data.get('content_type')
        content_id = request.data.get('content_id')
        action = request.data.get('action')

        if not all([content_type, content_id, action]):
            return Response({'error': 'Missing fields'}, status=status.HTTP_400_BAD_REQUEST)

        if action not in ['like', 'repost', 'share']:
             return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

        if action == 'like':
            existing = EngagementLog.objects.filter(
                user=request.user, 
                content_type=content_type, 
                content_id=content_id, 
                action='like'
            ).first()
            if existing:
                existing.delete()
                return Response({'status': 'unliked'})
            else:
                EngagementLog.objects.create(
                    user=request.user, 
                    content_type=content_type, 
                    content_id=content_id, 
                    action='like'
                )
                return Response({'status': 'liked'})
        else:
            EngagementLog.objects.create(
                user=request.user,
                content_type=content_type,
                content_id=content_id,
                action=action
            )
            return Response({'status': 'logged'})

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        content_type = self.request.query_params.get('content_type')
        content_id = self.request.query_params.get('content_id')
        if content_type and content_id:
            return Comment.objects.filter(content_type=content_type, content_id=content_id).order_by('-created_at')
        return Comment.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
