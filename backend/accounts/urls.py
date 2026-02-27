from django.urls import path
from .views import RegisterView, MeView, TokenObtainPairView, TokenRefreshView, UserPostsView, FollowUserView, UserConnectionsView, PublicUserProfileView, PublicUserPostsView, PublicUserConnectionsView, UserSearchView, AvatarUploadView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("posts/", UserPostsView.as_view(), name="user-posts"),
    path("profile/<str:username>/", PublicUserProfileView.as_view(), name="public-profile"),
    path("profile/<str:username>/posts/", PublicUserPostsView.as_view(), name="public-profile-posts"),
    path("profile/<str:username>/connections/", PublicUserConnectionsView.as_view(), name="public-profile-connections"),
    path("follow/<str:username>/", FollowUserView.as_view(), name="follow-user"),
    path("connections/", UserConnectionsView.as_view(), name="user-connections"),
    path("search/", UserSearchView.as_view(), name="user-search"),
    path("avatar/upload/", AvatarUploadView.as_view(), name="avatar-upload"),
]
