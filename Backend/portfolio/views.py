from django.shortcuts import render
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny 
from .models import Deck, ProjectCard, SlugEntry, PagesModel, BackgroundData
from administration.models import ImageUpload
from administration.serializers import DeckSerializer, ProjectCardSerializer, SlugEntrySerializer, PagesModelSerializer, PageNamesSerializer, GradientColorsSerializer, BackgroundDataSerializer, ImageUploadSerializer, PageDetailsSerializer
import sys
from django.shortcuts import get_object_or_404
from django.db.models.functions import Coalesce
from rest_framework import filters

from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view,
    OpenApiParameter,
    OpenApiExample,
    OpenApiResponse
)
# Create your views here.

@extend_schema(
    summary="Get gradient background colors by slug",
    description="Retrieves gradient background configuration for a given user slug.",
    parameters=[
        OpenApiParameter(name='slug', location=OpenApiParameter.PATH, description='Owner slug', required=True, type=str),
    ],
    responses={200: GradientColorsSerializer}
)
class GradientColorView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug=None):
        background = get_object_or_404(BackgroundData, owner=slug)
        serializer = GradientColorsSerializer(background)
        return Response(serializer.data)

@extend_schema(
    summary="Get background page names",
    description="Returns page name configuration (page1 and page2) associated with a user's background data.",
    parameters=[
        OpenApiParameter(name="slug", location=OpenApiParameter.PATH, description="Owner slug", required=True, type=str),
    ],
    responses={200: PageNamesSerializer}
)
class PageNamesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug=None):
        names = get_object_or_404(BackgroundData, owner=slug)
        serializer = PageNamesSerializer(names)
        return Response(serializer.data)

@extend_schema(
    summary="Get landing page details",
    description="Returns page navigation text color, deck nav color, and elliptical height and width offsets",
    parameters=[
        OpenApiParameter(name="slug", location=OpenApiParameter.PATH, description="Owner slug", required=True, type=str),
    ],
    responses={200: PageDetailsSerializer}
)
class PageDetailsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug=None):
        details = get_object_or_404(BackgroundData, owner=slug)
        serializer = PageDetailsSerializer(details)
        return Response(serializer.data)

@extend_schema(
    summary="List decks for a given owner",
    description="Returns all decks for the given owner slug.",
    parameters=[
        OpenApiParameter(name="slug", location=OpenApiParameter.PATH, description="Owner slug", required=True, type=str),
    ],
    responses={200: DeckSerializer(many=True)}
)
class DeckListView(ListAPIView):
    serializer_class = DeckSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['id', 'created_at', 'edited_at', 'sort_ts']

    def get_queryset(self):
        slug = self.kwargs.get('slug')
        qs = Deck.objects.all()
        if slug:
            qs = qs.filter(owner=slug)
        return qs.annotate(sort_ts=Coalesce('edited_at', 'created_at'))


@extend_schema(
    summary="Get project cards by slug and deck ID",
    description="Returns a list of project cards for a given owner slug and deck ID passed in the `X-deck-id` header.",
    parameters=[
        OpenApiParameter(name='slug', location=OpenApiParameter.PATH, description='Owner slug', required=True, type=str),
        OpenApiParameter(name='X-deck-id', location=OpenApiParameter.HEADER, description='Deck ID used to filter project cards', required=True, type=int),
    ],
    responses={
        200: ProjectCardSerializer(many=True),
        404: OpenApiResponse(description="Not Found"),
        400: OpenApiResponse(description="Bad request or missing header"),
    }
)
class ProjectCardListView(ListAPIView):
    serializer_class = ProjectCardSerializer
    permission_classes = [AllowAny]

    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['id', 'created_at', 'edited_at', 'sort_ts']

    def get_queryset(self):
        owner = self.kwargs.get('slug', 'shmooz')
        deck_id = self.request.headers.get('X-deck-id')
        qs = ProjectCard.objects.none()
        if owner and deck_id:
            qs = ProjectCard.objects.filter(owner=owner, deck_id=deck_id)
        return qs.annotate(sort_ts=Coalesce('edited_at', 'created_at'))  

@extend_schema(
    summary="List all available slugs",
    description="Returns all slugs registered in the system.",
    responses={200: SlugEntrySerializer(many=True)}
)
class SlugListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        slugs = SlugEntry.objects.all()
        serializer = SlugEntrySerializer(slugs, many=True)
        return Response(serializer.data)

@extend_schema(
    summary="Get a page by slug and category",
    description="Returns a page (page_one or page_two) for a given slug and category.",
    parameters=[
        OpenApiParameter(name="slug", location=OpenApiParameter.PATH, description="Owner slug", required=True, type=str),
        OpenApiParameter(name="category", location=OpenApiParameter.PATH, description="Page category: 'page_one' or 'page_two'", required=True, type=str),
    ],
    responses={
        200: PagesModelSerializer,
        404: OpenApiResponse(description="Page not found"),
        400: OpenApiResponse(description="Missing or invalid category/slug")
    }
)
class PageFetchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request,  slug=None, *args, **kwargs):
        category = self.kwargs.get('category')  
        if not category or not slug:
            return Response({"detail": "Missing category or slug"}, status=400)
        page = get_object_or_404(PagesModel, owner=slug, category=category)
        return Response(PagesModelSerializer(page).data)

@extend_schema(
    summary="Get a page linked to a project card",
    description="Fetches the page associated with a given project card ID.",
    parameters=[
        OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="ProjectCard ID", required=True, type=int),
    ],
    responses={
        200: PagesModelSerializer,
        404: OpenApiResponse(description="No page found for this project card")
    }
)
class ProjectPageFetchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, id):
        card = get_object_or_404(ProjectCard, id=id)
        try:
            page = PagesModel.objects.get(project_card=card)
        except PagesModel.DoesNotExist:
            return Response({"detail": "Page for this project card does not exist."}, status=404)

        return Response(PagesModelSerializer(page).data)

@extend_schema(
    summary="List all uploaded images",
    description="Returns a list of all uploaded images with their ID and public URL.",
    responses={200: ImageUploadSerializer(many=True)}
)
class ImageListView(ListAPIView):
    permission_classes = [AllowAny]

    queryset = ImageUpload.objects.all()
    serializer_class = ImageUploadSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['id', 'uploaded_at']