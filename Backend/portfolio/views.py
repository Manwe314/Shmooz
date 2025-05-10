from django.shortcuts import render
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny 
from .models import Deck, ProjectCard
from administration.serializers import DeckSerializer, ProjectCardSerializer
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

    def dispatch(self, request, *args, **kwargs):
        print("🚀 dispatch() was hit!", file=sys.stdout, flush=True)
        return super().dispatch(request, *args, **kwargs)

    def get_queryset(self):
        owner = self.kwargs.get('slug', 'COMPANY')
        deck_title = self.request.headers.get('X-deck-title')
        print(f"{owner} wants {deck_title} decks cards!", file=sys.stdout, flush=True)
        if owner and deck_title:
            print(ProjectCard.objects.filter(owner=owner, deck_title=deck_title), file=sys.stdout, flush=True)
            return ProjectCard.objects.filter(owner=owner, deck_title=deck_title)
        print('whoops cant fint what you want', flush=True)
        return ProjectCard.objects.none()  
