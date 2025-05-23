from django.shortcuts import render
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny 
from .models import Deck, ProjectCard, SlugEntry
from administration.serializers import DeckSerializer, ProjectCardSerializer, SlugEntrySerializer
import sys
# Create your views here.


class GradientColorView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug=None):
        print(f"the slug: {slug}", flush=True)
        if slug == 'kuxi':
            return Response({
                "color1":"D81B1E",
                "position1": "11",
                "color2": "330321",
                "position2": "38",
                "color3": "050319",
                "position3": "80",
            })
        elif slug == None:
            return Response({
                "color1":"712243",
                "position1": "0",
                "color2": "181532",
                "position2": "46",
                "color3": "050319",
                "position3": "71",
            })

class PageNamesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug=None):
        if slug == 'kuxi':
            return Response({"page1": "About-me", "page2": "CV"})
        else:
            return Response({"page1": "About-us", "page2": "Contact Us"})


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
