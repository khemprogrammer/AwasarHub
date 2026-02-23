from rest_framework.routers import DefaultRouter
from .views import FeedViewSet

router = DefaultRouter()
router.register(r"", FeedViewSet, basename="feed")

urlpatterns = router.urls
