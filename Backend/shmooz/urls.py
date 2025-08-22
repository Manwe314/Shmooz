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

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from administration.views import (
    AdminApiView,
    BackgroundDataUpdateDeleteView,
    BackgroundDataUploadView,
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    CSRFCookieView,
    DeckCreateView,
    DeckUpdateDeleteView,
    ImageUploadView,
    LogoutView,
    PagesModelUpdateDeleteView,
    PageUploadView,
    ProjectCardCreateView,
    ProjectCardUpdateDeleteView,
    SlugCreateView,
    SlugEntryUpdateDeleteView,
)
from portfolio.sitemaps import (
    PageOneSitemap,
    PageTwoSitemap,
    ProjectPageSitemap,
    SlugRootSitemap,
)
from portfolio.views import (
    DeckListView,
    GradientColorView,
    ImageListView,
    PageDetailsView,
    PageFetchView,
    PageNamesView,
    ProjectCardListView,
    ProjectPageFetchView,
    SlugListView,
)

urlpatterns = [
    path("api/token/", CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/logout/", LogoutView.as_view(), name="logout"),
    path("api/auth/", AdminApiView.as_view(), name="Admin_actions"),
    path("api/auth/csrf/", CSRFCookieView.as_view(), name="csrf_cookie"),
    path(
        "api/auth/create_deck/<str:slug>",
        DeckCreateView.as_view(),
        name="create_deck_slug",
    ),
    path(
        "api/auth/create_project_card/<str:slug>",
        ProjectCardCreateView.as_view(),
        name="create_project_card_slug",
    ),
    path(
        "api/auth/alter_deck/<int:pk>",
        DeckUpdateDeleteView.as_view(),
        name="deck_update_delete",
    ),
    path(
        "api/auth/alter_project_card/<int:pk>",
        ProjectCardUpdateDeleteView.as_view(),
        name="project_card_update_delete",
    ),
    path(
        "api/auth/alter_page/<int:pk>",
        PagesModelUpdateDeleteView.as_view(),
        name="page_update_delete",
    ),
    path(
        "api/auth/alter_slug/<int:pk>",
        SlugEntryUpdateDeleteView.as_view(),
        name="slug_update_delete",
    ),
    path(
        "api/auth/alter_background/<int:pk>",
        BackgroundDataUpdateDeleteView.as_view(),
        name="background_update_delete",
    ),
    path(
        "api/auth/create_background/",
        BackgroundDataUploadView.as_view(),
        name="background_data_upload",
    ),
    path("api/auth/create_slug/", SlugCreateView.as_view(), name="slug_create"),
    path("api/auth/upload_page/", PageUploadView.as_view(), name="upload_page"),
    path("api/upload-image/<str:slug>", ImageUploadView.as_view()),
    path("api/upload-image/", ImageUploadView.as_view()),
    path("api/slugs/", SlugListView.as_view(), name="slug_list"),
    path(
        "api/gradient-colors/<str:slug>",
        GradientColorView.as_view(),
        name="Gradient_color_sluged",
    ),
    path(
        "api/page-names/<str:slug>", PageNamesView.as_view(), name="page_names_sluged"
    ),
    path(
        "api/page-details/<str:slug>",
        PageDetailsView.as_view(),
        name="page_details_slugged",
    ),
    path(
        "api/page1/<slug:slug>",
        PageFetchView.as_view(),
        {"category": "page_one"},
        name="page1_handler",
    ),
    path(
        "api/page2/<slug:slug>",
        PageFetchView.as_view(),
        {"category": "page_two"},
        name="page2_handler",
    ),
    path(
        "api/project_page/<int:id>",
        ProjectPageFetchView.as_view(),
        name="project_page_handler",
    ),
    path("api/deck/<slug:slug>", DeckListView.as_view(), name="get_deck_sluged"),
    path(
        "api/projects/<slug:slug>",
        ProjectCardListView.as_view(),
        name="get_projects_sluged",
    ),
    path("api/images/", ImageListView.as_view(), name="image_list"),
    path("sitemap.xml", sitemap, {"sitemaps": sitemap}, name="django-sitemap"),
]

urlpatterns += [
    path(
        "api/schema/",
        SpectacularAPIView.as_view(permission_classes=[AllowAny]),
        name="schema",
    ),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(
            url_name="schema", permission_classes=[AllowAny]
        ),
        name="swagger-ui",
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
