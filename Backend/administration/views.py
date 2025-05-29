from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ImageUpload
from .serializers import ImageUploadSerializer, DeckSerializer, ProjectCardSerializer, SlugEntrySerializer, PagesModelSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.generics import get_object_or_404
from rest_framework import status
from portfolio.models import Deck, ProjectCard, SlugEntry
from django.utils import timezone 

# Create your views here.

class AdminApiView(APIView):
    #permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({"detail": "Not authorized."}, status=403)
        
        return Response({"message": "arayi da pichenia sheyvarebuls mirchevnia!"})

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
    
class DeckCreateView(APIView):
    #permission_classes = [IsAuthenticated]

    def post(self, request, slug=None):
        
        serializer = DeckSerializer(data=request.data, context={"request": request, "slug": slug})
        if serializer.is_valid():
            deck = serializer.save()
            return Response(DeckSerializer(deck).data, status=201)
        return Response(serializer.errors, status=400)
    
class ProjectCardCreateView(APIView):
    #permission_classes = [IsAuthenticated]

    def post(self, request, slug=None):
        
        serializer = ProjectCardSerializer(data=request.data, context={"request": request, "slug": slug})
        if serializer.is_valid():
            ProjectCard = serializer.save()
            return Response(ProjectCardSerializer(ProjectCard).data, status=201)
        return Response(serializer.errors, status=400)
    
class SlugCreateView(APIView):
    #permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SlugEntrySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
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
    
class PageUploadView(APIView):
    #permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PagesModelSerializer(data=request.data)
        if serializer.is_valid():
            page = serializer.save()
            return Response(PagesModelSerializer(page).data, status=201)
        return Response(serializer.errors, status=400)
