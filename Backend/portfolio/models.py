from django.db import models
from administration.models import ImageUpload
from django.utils import timezone
from django.contrib.postgres.fields import ArrayField

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
    hover_img = models.ForeignKey(
        'administration.ImageUpload',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='hover_decks'
    )

    card_amount = models.IntegerField(null=True, blank=True)
    x_offsets = ArrayField(models.FloatField(), blank=True, default=list)
    y_offsets = ArrayField(models.FloatField(), blank=True, default=list)
    rotations = ArrayField(models.FloatField(), blank=True, default=list)
    alphas = ArrayField(models.FloatField(), blank=True, default=list)
    brightness = ArrayField(models.FloatField(), blank=True, default=list)
    hover_x_offsets = ArrayField(models.FloatField(), blank=True, default=list)
    hover_y_offsets = ArrayField(models.FloatField(), blank=True, default=list)
    hover_rotations = ArrayField(models.FloatField(), blank=True, default=list)
    hover_brightness = ArrayField(models.FloatField(), blank=True, default=list)
    text_color = models.CharField(max_length=50)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    edited_at = models.DateTimeField(null=True, blank=True, db_index=True)


    class Meta:
        ordering = ['id']
        indexes = [
            models.Index(fields=['-edited_at']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return self.title
    
class SlugEntry(models.Model):
    slug = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.slug
    
class BackgroundData(models.Model):
    owner = models.CharField(max_length=50)
    
    color1 = models.CharField(max_length=50)
    color2 = models.CharField(max_length=50)
    color3 = models.CharField(max_length=50)

    position1 = models.CharField(max_length=50)
    position2 = models.CharField(max_length=50)
    position3 = models.CharField(max_length=50)

    page1 = models.CharField(max_length=50)
    page2 = models.CharField(max_length=50)

    navColor = models.CharField(max_length=50, default="#000000")
    arrowColor = models.CharField(max_length=50, default="#FFFFFF")
    ellipseWidth = models.IntegerField(default=0)
    ellipseHeight = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.owner


    
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
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    edited_at = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        ordering = ['id']  # ✅ default to id
        indexes = [
            models.Index(fields=['-edited_at']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return self.title

class PagesModel(models.Model):
    CATEGORY_CHOICES = [
        ('page_one', 'Page 1'),
        ('page_two', 'Page 2'),
    ]

    owner = models.SlugField(max_length=50)
    category = models.CharField(max_length=50)
    
    content = models.JSONField()  
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)

    project_card = models.OneToOneField(
        'portfolio.ProjectCard',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='page'
    )

    class Meta:
        unique_together = ['owner', 'category']

    def __str__(self):
        if self.project_card:
            return f"Page for ProjectCard ID {self.project_card.id}"
        return f"{self.owner} - {self.category}"
