from django.urls import path
from .views import EngagementActionView, CommentListCreateView

urlpatterns = [
    path('action/', EngagementActionView.as_view(), name='engagement-action'),
    path('comments/', CommentListCreateView.as_view(), name='comment-list-create'),
]
