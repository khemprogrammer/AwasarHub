from datetime import date
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import AIBriefing
from .serializers import AIBriefingSerializer


class AIBriefingViewSet(viewsets.ModelViewSet):
    queryset = AIBriefing.objects.all().order_by("-date")
    serializer_class = AIBriefingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def daily(self, request):
        u = request.user
        today = date.today()
        briefing, created = AIBriefing.objects.get_or_create(user=u, date=today, defaults={
            "script_text": "Your briefing is being prepared.",
            "video_url": "",
            "metadata": {"interests": u.interests},
        })
        return Response(self.serializer_class(briefing).data)
