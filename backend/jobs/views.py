from rest_framework import viewsets, permissions
from .models import Job
from .serializers import JobSerializer


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all().order_by("-created_at")
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)
