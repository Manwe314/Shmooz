from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import ImageUpload
from .serializers import ImageUploadSerializer


class ImageUploadValidationTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_valid_image_upload(self):
        """Test that valid images are accepted"""
        # Create a small test image (1x1 pixel PNG)
        image_content = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'

        uploaded_file = SimpleUploadedFile(
            "test.png",
            image_content,
            content_type="image/png"
        )

        data = {
            'title': 'Test Image',
            'image': uploaded_file
        }

        response = self.client.post('/api/upload-image/', data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ImageUpload.objects.count(), 1)

    def test_oversized_image_rejection(self):
        """Test that oversized images are rejected"""
        # Create a large fake file (6MB)
        large_content = b'x' * (6 * 1024 * 1024)

        uploaded_file = SimpleUploadedFile(
            "large.png",
            large_content,
            content_type="image/png"
        )

        data = {
            'title': 'Large Image',
            'image': uploaded_file
        }

        response = self.client.post('/api/upload-image/', data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('too large', str(response.data))
        self.assertEqual(ImageUpload.objects.count(), 0)

    def test_serializer_validation_directly(self):
        """Test the serializer validation directly"""
        # Test oversized file
        large_content = b'x' * (6 * 1024 * 1024)
        large_file = SimpleUploadedFile("large.jpg", large_content, content_type="image/jpeg")

        serializer = ImageUploadSerializer(data={
            'title': 'Large Image',
            'image': large_file
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('image', serializer.errors)
        self.assertIn('too large', str(serializer.errors['image'][0]))
