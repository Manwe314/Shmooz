from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ImageUpload
from .serializers import ImageUploadSerializer, DeckSerializer, ProjectCardSerializer, SlugEntrySerializer, PagesModelSerializer, BackgroundDataSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.generics import get_object_or_404
from rest_framework import status
from portfolio.models import Deck, ProjectCard, SlugEntry, PagesModel, BackgroundData
from django.utils import timezone 
from docs.schema import PageSchema
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.utils.decorators import method_decorator

from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view,
    OpenApiParameter,
    OpenApiExample,
    OpenApiResponse
)
# Create your views here.

REFRESH_COOKIE = 'refresh_token'
COOKIE_KW = dict(
    httponly=True,
    secure=True,        # True in production (HTTPS)
    samesite='Strict',  # 'Lax' or 'None' if you do cross-site; 'None' requires Secure
    path='/api/token/'  # or '/'
)

def _check_pages_conflicts(old_slug: str, new_slug: str):
    if old_slug == new_slug:
        return

    old_cats = set(
        PagesModel.objects.filter(owner=old_slug).values_list('category', flat=True)
    )
    if not old_cats:
        return

    # categories already present for the new owner
    new_cats = set(
        PagesModel.objects.filter(owner=new_slug).values_list('category', flat=True)
    )

    conflicts = sorted(old_cats.intersection(new_cats))
    if conflicts:
        cats_txt = ", ".join(conflicts)
        raise ValidationError(
            {
                "owner": (
                    f"Cannot rename slug '{old_slug}' to '{new_slug}' because "
                    f"PagesModel entries for categories [{cats_txt}] already exist for '{new_slug}'. "
                    "Resolve/merge these pages first."
                )
            }
        )


def _propagate_owner_change(old_slug: str, new_slug: str) -> dict:
    now = timezone.now()
    results = {}

    results["BackgroundData"] = BackgroundData.objects.filter(owner=old_slug).update(
        owner=new_slug,
        edited_at=now,
    )
    results["Deck"] = Deck.objects.filter(owner=old_slug).update(
        owner=new_slug,
        edited_at=now,
    )
    results["ProjectCard"] = ProjectCard.objects.filter(owner=old_slug).update(
        owner=new_slug,
        edited_at=now,
    )
    results["PagesModel"] = PagesModel.objects.filter(owner=old_slug).update(
        owner=new_slug,
        edited_at=now,
    )

    return results


@extend_schema(summary="Get CSRF cookie")
class CSRFCookieView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        return Response({'detail': 'CSRF cookie set'})

@extend_schema(
    summary="Login (sets refresh token cookie, returns access in body)",
    responses={200: OpenApiResponse(description="OK")}
)
class CookieTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)  # has access + refresh
        data = response.data
        refresh = data.pop('refresh', None)
        res = Response(data, status=response.status_code)
        if refresh:
            res.set_cookie(REFRESH_COOKIE, refresh, **COOKIE_KW)
        return res

@extend_schema(
    summary="Refresh (reads refresh token from HttpOnly cookie and rotates it)",
    responses={200: OpenApiResponse(description="OK")}
)
class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        request.data['refresh'] = request.COOKIES.get(REFRESH_COOKIE)
        return super().post(request, *args, **kwargs)

@extend_schema(
    summary="Logout (blacklist refresh and clear cookie)",
    responses={204: OpenApiResponse(description="No content")}
)
class LogoutView(APIView):
    def post(self, request):
        res = Response(status=204)
        res.delete_cookie(REFRESH_COOKIE, path=COOKIE_KW['path'])
        return res

@extend_schema(
    summary="Check admin access",
    description="Returns a message if the user is authenticated and staff. Otherwise, returns a 403 error.",
    responses={
        200: OpenApiResponse(description="Authenticated staff user"),
        403: OpenApiResponse(description="User not authorized"),
    }
)
class AdminApiView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({"detail": "Not authorized."}, status=403)
        
        return Response({"message": "arayi da pichenia sheyvarebuls mirchevnia!"})

@extend_schema(
    summary="Upload an image",
    description="Uploads an image file and associates it with a given slug.",
    operation_id='upload_image_no_slug',
    parameters=[
        OpenApiParameter(name="slug", location=OpenApiParameter.PATH, description="Slug for image categorization", required=False, type=str),
    ],
    request=ImageUploadSerializer,
    responses={
        201: ImageUploadSerializer,
        400: OpenApiResponse(description="Invalid image or payload"),
    }
)
class ImageUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def post(self, request, slug=None):
        serializer = ImageUploadSerializer(data=request.data)
        if serializer.is_valid():
            image_instance = serializer.save(commit=False)

            image_instance.upload_slug = slug or 'shmooz'

            image_instance.save()
            return Response({"status": "success", "data": ImageUploadSerializer(image_instance).data}, status=201)
        return Response(serializer.errors, status=400)

@extend_schema(
    summary="Upload background data",
    description="Saves background gradient color data for a given slug.",
    parameters=[
        OpenApiParameter(name="slug", location=OpenApiParameter.PATH, description="Slug representing the owner", required=False, type=str),
    ],
    request=BackgroundDataSerializer,
    responses={
        201: BackgroundDataSerializer,
        400: OpenApiResponse(description="Validation error"),
    }
)
class BackgroundDataUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug=None):
        serializer = BackgroundDataSerializer(data=request.data)
        if serializer.is_valid():
            background = serializer.save()
            return Response(BackgroundDataSerializer(background).data, status=201)
        return Response(serializer.errors, status=400)

@extend_schema(
    summary="Create a new Deck",
    description="Creates a deck associated with the given slug and an uploaded image ID.",
    parameters=[
        OpenApiParameter(name='slug', location=OpenApiParameter.PATH, description='Owner slug', required=True, type=str),
    ],
    request=DeckSerializer,
    responses={
        201: DeckSerializer,
        400: OpenApiResponse(description="Validation errors"),
    },
    examples=[
        OpenApiExample(
            'Create Deck Example',
            summary='Typical deck creation payload',
            value={
                "title": "Landing",
                "displayed_name": "Landing Page",
                "owner": "testco",
                "image_id": 1
            }
        )
    ]
)
class DeckCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug=None):
        
        serializer = DeckSerializer(data=request.data, context={"request": request, "slug": slug})
        if serializer.is_valid():
            deck = serializer.save()
            return Response(DeckSerializer(deck).data, status=201)
        return Response(serializer.errors, status=400)

@extend_schema(
    summary="Create a project card",
    description="Creates a new project card associated with a deck and image.",
    parameters=[
        OpenApiParameter(name="slug", location=OpenApiParameter.PATH, description="Owner slug", required=True, type=str),
    ],
    request=ProjectCardSerializer,
    responses={
        201: ProjectCardSerializer,
        400: OpenApiResponse(description="Invalid image_id or deck_id"),
    },
    examples=[
        OpenApiExample(
            "Example Project Card Creation",
            value={
                "title": "Landing Page",
                "text": "Welcome to our site",
                "text_color": "#ffffff",
                "label_letter": "L",
                "label_color": "#000000",
                "inline_color": "#cccccc",
                "owner": "testco",
                "image_id": 2,
                "deck_id": 1
            },
            request_only=True
        )
    ]
)
class ProjectCardCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug=None):
        
        serializer = ProjectCardSerializer(data=request.data, context={"request": request, "slug": slug})
        if serializer.is_valid():
            ProjectCard = serializer.save()
            return Response(ProjectCardSerializer(ProjectCard).data, status=201)
        return Response(serializer.errors, status=400)

@extend_schema(
    summary="Upload a page layout",
    description="Creates a new page layout with a list of blocks and block contents.",
    request=PageSchema,
    responses={
        201: PagesModelSerializer,
        400: OpenApiResponse(description="Validation error"),
    }
)
class PageUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PagesModelSerializer(data=request.data)
        if serializer.is_valid():
            page = serializer.save()
            return Response(PagesModelSerializer(page).data, status=201)
        return Response(serializer.errors, status=400)

@extend_schema(
    summary="Create a slug",
    description="Registers a new slug in the system for identifying resources.",
    request=SlugEntrySerializer,
    responses={
        201: SlugEntrySerializer,
        400: OpenApiResponse(description="Validation error"),
    }
)
class SlugCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SlugEntrySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@extend_schema(
    summary="Update or delete a deck",
    description="PUT: Partially updates a deck.\n\nDELETE: Removes the specified deck.",
    parameters=[
        OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Deck ID", required=True, type=int),
    ],
    request=DeckSerializer,
    responses={
        200: DeckSerializer,
        204: OpenApiResponse(description="Successfully deleted"),
        400: OpenApiResponse(description="Validation error"),
        404: OpenApiResponse(description="Deck not found"),
    }
)
class DeckUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        deck = get_object_or_404(Deck, pk=pk)
        serializer = DeckSerializer(deck, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated_deck = serializer.save()
            updated_deck.edited_at = timezone.now()
            updated_deck.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        deck = get_object_or_404(Deck, pk=pk)
        deck.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@extend_schema(
    summary="Update or delete a project card",
    description="PUT: Updates a project card's fields.\n\nDELETE: Deletes the specified project card.",
    parameters=[
        OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="ProjectCard ID", required=True, type=int),
    ],
    request=ProjectCardSerializer,
    responses={
        200: ProjectCardSerializer,
        204: OpenApiResponse(description="Successfully deleted"),
        400: OpenApiResponse(description="Validation error"),
        404: OpenApiResponse(description="ProjectCard not found"),
    }
)
class ProjectCardUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        card = get_object_or_404(ProjectCard, pk=pk)
        serializer = ProjectCardSerializer(card, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated_card = serializer.save()
            updated_card.edited_at = timezone.now()
            updated_card.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        card = get_object_or_404(ProjectCard, pk=pk)
        card.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@extend_schema(
    summary="Update or delete a page",
    description="PUT: Updates a page (JSON layout, project card link).\n\nDELETE: Deletes the page.",
    parameters=[
        OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Page ID", required=True, type=int),
    ],
    request=PagesModelSerializer,
    responses={
        200: PagesModelSerializer,
        204: OpenApiResponse(description="Successfully deleted"),
        400: OpenApiResponse(description="Validation error"),
        404: OpenApiResponse(description="Page not found"),
    }
)
class PagesModelUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        page = get_object_or_404(PagesModel, pk=pk)
        serializer = PagesModelSerializer(page, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated_page = serializer.save()
            updated_page.edited_at = timezone.now()
            updated_page.save()
            return Response(PagesModelSerializer(updated_page).data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        page = get_object_or_404(PagesModel, pk=pk)
        page.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
@extend_schema(
    summary="Update or delete a slug entry",
    description="PUT: Updates a slug entry's fields.\n\nDELETE: Deletes the specified slug entry.",
    parameters=[
        OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="SlugEntry ID", required=True, type=int),
    ],
    request=SlugEntrySerializer,
    responses={
        200: SlugEntrySerializer,
        204: OpenApiResponse(description="Successfully deleted"),
        400: OpenApiResponse(description="Validation error"),
        404: OpenApiResponse(description="SlugEntry not found"),
    }
)
class SlugEntryUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        slug_entry = get_object_or_404(SlugEntry, pk=pk)
        old_slug = slug_entry.slug

        serializer = SlugEntrySerializer(
            slug_entry, data=request.data, partial=True, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        new_slug = serializer.validated_data.get('slug', old_slug)

        _check_pages_conflicts(old_slug, new_slug)

        with transaction.atomic():
            updated_entry = serializer.save()
            updated_entry.edited_at = timezone.now()
            updated_entry.save(update_fields=["edited_at"])

            cascade_result = {}
            if old_slug != new_slug:
                cascade_result = _propagate_owner_change(old_slug, new_slug)

        response_payload = {
            "slug_entry": SlugEntrySerializer(updated_entry).data,
            "cascade": cascade_result,
        }
        return Response(response_payload)

    def delete(self, request, pk):
        slug_entry = get_object_or_404(SlugEntry, pk=pk)
        slug_entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema(
    summary="Update or delete background data",
    description="PUT: Updates background gradient and page-related fields.\n\nDELETE: Deletes the specified background data record.",
    parameters=[
        OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="BackgroundData ID", required=True, type=int),
    ],
    request=BackgroundDataSerializer,
    responses={
        200: BackgroundDataSerializer,
        204: OpenApiResponse(description="Successfully deleted"),
        400: OpenApiResponse(description="Validation error"),
        404: OpenApiResponse(description="BackgroundData not found"),
    }
)
class BackgroundDataUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        background = get_object_or_404(BackgroundData, pk=pk)
        serializer = BackgroundDataSerializer(background, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated = serializer.save()
            updated.edited_at = timezone.now()
            updated.save()
            return Response(BackgroundDataSerializer(updated).data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        background = get_object_or_404(BackgroundData, pk=pk)
        background.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)