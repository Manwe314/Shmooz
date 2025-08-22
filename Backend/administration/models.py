from django.db import models

# Create your models here.


def upload_dynamicly(instance, filename):
    slug = getattr(instance, "upload_slug", "shmooz")
    return f"uploads/{slug}/{filename}"


class ImageUpload(models.Model):
    title = models.CharField(max_length=50)
    image = models.ImageField(upload_to=upload_dynamicly)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    upload_slug = None

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.title
