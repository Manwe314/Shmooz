"""
URL configuration for shmooz project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.conf import settings
from django.conf.urls.static import static
from administration.views import AdminApiView, ImageUploadView, DeckCreateView
from portfolio.views import GradientColorView, DeckListView



urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/', AdminApiView.as_view(), name='Admin_actions'),

    path('api/auth/create_deck/', DeckCreateView.as_view(), name='create_deck'),
    path('api/auth/create_deck/<str:slug>', DeckCreateView.as_view(), name='create_deck'),

    path('upload-image/', ImageUploadView.as_view()),
    path('upload-image/<str:slug>', ImageUploadView.as_view()),

    path('api/gradient-colors/', GradientColorView.as_view(), name='Gradient_color_root'),
    path('api/gradient-colors/<str:slug>', GradientColorView.as_view(), name='Gradient_color_sluged'),

    path('api/deck/', DeckListView.as_view(), name='get_deck_root'),
    path('api/deck/<slug:slug>', DeckListView.as_view(), name='get_deck_sluged'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)