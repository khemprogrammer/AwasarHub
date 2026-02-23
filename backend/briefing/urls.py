from rest_framework.routers import DefaultRouter
from .views import AIBriefingViewSet

router = DefaultRouter()
router.register(r"", AIBriefingViewSet, basename="briefing")

urlpatterns = router.urls
