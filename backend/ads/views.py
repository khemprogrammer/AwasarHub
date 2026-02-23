from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Advertisement
from .serializers import AdvertisementSerializer


class AdvertisementViewSet(viewsets.ModelViewSet):
    queryset = Advertisement.objects.all().order_by("-created_at")
    serializer_class = AdvertisementSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(advertiser=self.request.user)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def for_user(self, request):
        user = request.user
        city = user.city
        qs = Advertisement.objects.filter(enabled=True)
        if city:
            qs = qs.filter(city__iexact=city)
        data = self.serializer_class(qs[:10], many=True).data
        return Response({"ads": data})
