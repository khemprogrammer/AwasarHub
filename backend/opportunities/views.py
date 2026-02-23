from rest_framework import viewsets, permissions
from .models import Opportunity
from .serializers import OpportunitySerializer


class OpportunityViewSet(viewsets.ModelViewSet):
    queryset = Opportunity.objects.all().order_by("-created_at")
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)
