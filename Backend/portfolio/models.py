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
    deck = models.ForeignKey(
        Deck,
        on_delete=models.CASCADE,
        related_name='project_cards',
        null=True,  # optional: allow nulls if you want a soft transition
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title

class PagesModel(models.Model):
    CATEGORY_CHOICES = [
        ('page_one', 'Page 1'),
        ('page_two', 'Page 2'),
    ]

    owner = models.SlugField(max_length=50)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    content = models.JSONField()  
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['owner', 'category']

    def __str__(self):
        return f"{self.owner} - {self.category}"
