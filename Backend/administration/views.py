from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ImageUpload
from .serializers import ImageUploadSerializer, DeckSerializer, ProjectCardSerializer, SlugEntrySerializer, PagesModelSerializer, BackgroundDataSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.generics import get_object_or_404
from rest_framework import status
from portfolio.models import Deck, ProjectCard, SlugEntry, PagesModel
from django.utils import timezone 

from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view,
    OpenApiParameter,
    OpenApiExample,
    OpenApiResponse
)

# Create your views here.

@extend_schema(
    summary="Check admin access",
    description="Returns a message if the user is authenticated and staff. Otherwise, returns a 403 error.",
    responses={
        200: OpenApiResponse(description="Authenticated staff user"),
        403: OpenApiResponse(description="User not authorized"),
    }
)
class AdminApiView(APIView):
    #permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({"detail": "Not authorized."}, status=403)
        
        return Response({"message": "arayi da pichenia sheyvarebuls mirchevnia!"})

@extend_schema(
    summary="Upload an image",
    description="Uploads an image file and associates it with a given slug.",
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
    #permission_classes = [IsAuthenticated]

    def post(self, request, slug=None):
        serializer = ImageUploadSerializer(data=request.data)
        if serializer.is_valid():
            image_instance = serializer.save(commit=False)

            image_instance.upload_slug = slug or 'COMPANY'

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
    #permission_classes = [IsAuthenticated]

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
    #permission_classes = [IsAuthenticated]

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
    #permission_classes = [IsAuthenticated]

    def post(self, request, slug=None):
        
        serializer = ProjectCardSerializer(data=request.data, context={"request": request, "slug": slug})
        if serializer.is_valid():
            ProjectCard = serializer.save()
            return Response(ProjectCardSerializer(ProjectCard).data, status=201)
        return Response(serializer.errors, status=400)

@extend_schema(
    summary="Upload a page",
    description="Creates a page document (JSON-based layout) and optionally links it to a project card.",
    request=PagesModelSerializer,
    responses={
        201: PagesModelSerializer,
        400: OpenApiResponse(description="Validation error in layout or project_card_id"),
    },
    examples=[
        OpenApiExample(
            "Example Page Creation",
            value={
                "owner": "kuxi",
                "category": "project_0",
                "project_card_id": 0,
                "content": [
                    {
                        "id": "block-001",
                        "backgroundColor": "rgba(43,17,28,0.25)",
                        "borderColor": "#02096b",
                        "gridTemplateColumns": "4fr 10px 6fr",
                        "gridTemplateRows": "4fr 10px auto",
                        "tag": "borderTarget",
                        "content": [
                            {
                                "id": "txt-001",
                                "type": "text",
                                "text": "Welcome to PROJECTS",
                                "rowStart": 1,
                                "colStart": 1,
                                "tag": "h1",
                                "textAlign": "right",
                                "verticalAlign": "top",
                                "horizontalAlign": "left",
                                "color": "#f0f0DD"
                            },
                            {
                                "id": "img-001",
                                "type": "image",
                                "tag": "imageTarget",
                                "url": "/media/1.png",
                                "alt": "Cover Image",
                                "rowStart": 1,
                                "colStart": 3,
                                "rowSpan": 2,
                                "borderRadius": "30px"
                            },
                            {
                                "id": "link-001",
                                "type": "link",
                                "rowStart": 3,
                                "colStart": 1,
                                "text": "visit our swagger",
                                "url": "http://localhost:8000/api/docs/",
                                "color": "#f0f0DD",
                                "iconUrl": "/media/code.png"
                            },
                        ]
                    }
                ]
            }
        )
    ]
)
class PageUploadView(APIView):
    #permission_classes = [IsAuthenticated]

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
    #permission_classes = [IsAuthenticated]

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
    #permission_classes = [IsAuthenticated]

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
    #permission_classes = [IsAuthenticated]

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
    #permission_classes = [IsAuthenticated]

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
    
