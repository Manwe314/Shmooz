from django.shortcuts import render
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny 
from .models import Deck, ProjectCard, SlugEntry, PagesModel, BackgroundData
from administration.serializers import DeckSerializer, ProjectCardSerializer, SlugEntrySerializer, PagesModelSerializer, PageNamesSerializer, GradientColorsSerializer, BackgroundDataSerializer
import sys
from django.shortcuts import get_object_or_404
# Create your views here.


class GradientColorView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug=None):
        background = get_object_or_404(BackgroundData, owner=slug)
        serializer = GradientColorsSerializer(background)
        return Response(serializer.data)

class PageNamesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug=None):
        names = get_object_or_404(BackgroundData, owner=slug)
        serializer = PageNamesSerializer(names)
        return Response(serializer.data)
        
        
class DeckListView(ListAPIView):
    serializer_class = DeckSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        slug = self.kwargs.get('slug')
        if slug:
            return Deck.objects.filter(owner=slug)
        return Deck.objects.all()



class ProjectCardListView(ListAPIView):
    serializer_class = ProjectCardSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        owner = self.kwargs.get('slug', 'COMPANY')
        deck_id = self.request.headers.get('X-deck-id')

        if owner and deck_id:
            return ProjectCard.objects.filter(owner=owner, deck_id=deck_id)
        return ProjectCard.objects.none()  

class SlugListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        slugs = SlugEntry.objects.all()
        serializer = SlugEntrySerializer(slugs, many=True)
        return Response(serializer.data)

class PageFetchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request,  slug=None, *args, **kwargs):
        category = self.kwargs.get('category')  
        if not category or not slug:
            return Response({"detail": "Missing category or slug"}, status=400)
        page = get_object_or_404(PagesModel, owner=slug, category=category)
        return Response(PagesModelSerializer(page).data)
    
class ProjectPageFetchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, id):
        card = get_object_or_404(ProjectCard, id=id)
        try:
            page = PagesModel.objects.get(project_card=card)
        except PagesModel.DoesNotExist:
            return Response({"detail": "Page for this project card does not exist."}, status=404)

        return Response(PagesModelSerializer(page).data)