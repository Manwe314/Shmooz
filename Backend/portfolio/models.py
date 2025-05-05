from django.db import models
from administration.models import ImageUpload

# Create your models here.

class Deck(models.Model):
    title = models.CharField(max_length=50)
    displayed_name = models.CharField(max_length=50)
    owner = models.CharField(max_length=50)

    image = models.ForeignKey(
        'administration.ImageUpload',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='decks'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title