from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny 
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