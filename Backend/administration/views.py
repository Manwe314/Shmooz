from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ImageUpload
from .serializers import ImageUploadSerializer, DeckSerializer, ProjectCardSerializer
from rest_framework.parsers import MultiPartParser, FormParser

# Create your views here.

class AdminApiView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({"detail": "Not authorized."}, status=403)
        
        return Response({"message": "arayi da pichenia sheyvarebuls mirchevnia!"})

class ImageUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def post(self, request, slug=None):
        serializer = ImageUploadSerializer(data=request.data)
        if serializer.is_valid():
            image_instance = serializer.save(commit=False)

            image_instance.upload_slug = slug or 'COMPANY'

            image_instance.save()
            return Response({"status": "success", "data": ImageUploadSerializer(image_instance).data}, status=201)
        return Response(serializer.errors, status=400)
    
class DeckCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, slug=None):
        
        serializer = DeckSerializer(data=request.data, context={"request": request, "slug": slug})
        if serializer.is_valid():
            deck = serializer.save()
            return Response(DeckSerializer(deck).data, status=201)
        return Response(serializer.errors, status=400)
    
class ProjectCardCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, slug=None):
        
        serializer = ProjectCardSerializer(data=request.data, context={"request": request, "slug": slug})
        if serializer.is_valid():
            ProjectCard = serializer.save()
            return Response(ProjectCardSerializer(ProjectCard).data, status=201)
        return Response(serializer.errors, status=400)