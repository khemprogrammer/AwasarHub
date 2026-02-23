from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/feed/", include("feed.urls")),
    path("api/jobs/", include("jobs.urls")),
    path("api/opportunities/", include("opportunities.urls")),
    path("api/ads/", include("ads.urls")),
    path("api/engagement/", include("engagement.urls")),
    path("api/briefing/", include("briefing.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
