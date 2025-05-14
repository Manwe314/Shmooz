from django.db import models
from administration.models import ImageUpload
from django.utils import timezone

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
    edited_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title
    
class SlugEntry(models.Model):
    slug = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.slug

    
class ProjectCard(models.Model):
    title = models.CharField(max_length=50)
    image = models.ForeignKey(
        'administration.ImageUpload',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='project_cards'
    )
    text = models.CharField(max_length=50)
    text_color = models.CharField(max_length=50)
    label_letter = models.CharField(max_length=2)
    label_color = models.CharField(max_length=50)
    inline_color = models.CharField(max_length=50)
    owner = models.CharField(max_length=50)
    deckTitle = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)
