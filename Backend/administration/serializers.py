from rest_framework import serializers
from .models import ImageUpload
from portfolio.models import Deck, ProjectCard
from rest_framework.exceptions import ValidationError
from portfolio.models import SlugEntry

class SlugEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = SlugEntry
        fields = ['id', 'slug']

class ImageUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageUpload
        fields = ['id', 'title', 'image', 'uploaded_at']

class DeckSerializer(serializers.ModelSerializer):
    image_id = serializers.IntegerField(write_only=True, required=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Deck
        fields = [
            'id', 'title', 'displayed_name', 'owner',
            'image', 'image_id', 'image_url', 'created_at'
        ]
        read_only_fields = ['id', 'image', 'created_at']

    def create(self, validated_data):
        image_id = validated_data.pop('image_id')
        try:
            image = ImageUpload.objects.get(id=image_id)
        except ImageUpload.DoesNotExist:
            raise ValidationError("Invalid image_id")
        deck = Deck.objects.create(image=image, **validated_data)
        return deck

    def get_image_url(self, obj):
        if obj.image and obj.image.image:
            return obj.image.image.url
        return None
    

class ProjectCardSerializer(serializers.ModelSerializer):
    image_id = serializers.IntegerField(write_only=True, required=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProjectCard
        fields = [
            'id', 'title', 'text', 'text_color',
            'label_letter', 'label_color', 'inline_color',
            'deckTitle', 'owner', 'image', 'image_id', 'image_url', 'created_at'
        ]
        read_only_fields = ['id', 'image', 'created_at']

    def create(self, validated_data):
        image_id = validated_data.pop('image_id')
        try:
            image = ImageUpload.objects.get(id=image_id)
        except ImageUpload.DoesNotExist:
            raise ValidationError("Invalid image_id")
        card = ProjectCard.objects.create(image=image, **validated_data)
        return card

    def get_image_url(self, obj):
        if obj.image and obj.image.image:
            return obj.image.image.url
        return None