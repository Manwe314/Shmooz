from django.db import models

# Create your models here.


def upload_dynamicly(instance, filename):
    """Legacy function for existing migrations - now uploads to uploads/ folder"""
    return f"uploads/{filename}"


def upload_to_uploads(instance, filename):
    """Upload all images directly to uploads/ folder"""
    return f"uploads/{filename}"


class ImageUpload(models.Model):
    title = models.CharField(max_length=50)
    image = models.ImageField(upload_to=upload_to_uploads)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.title
