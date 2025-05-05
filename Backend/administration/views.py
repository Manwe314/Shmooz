from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# Create your views here.

class AdminApiView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({"detail": "Not authorized."}, status=403)
        
        return Response({"message": "arayi da pichenia sheyvarebuls mirchevnia!"})
