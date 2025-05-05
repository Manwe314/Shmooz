from rest_framework import serializers
from .models import ImageUpload
from portfolio.models import Deck

class ImageUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageUpload
        fields = ['id', 'title', 'image', 'uploaded_at']

class DeckSerializer(serializers.ModelSerializer):
    image_file = serializers.ImageField(write_only=True, required=True)
    slug = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Deck
        fields = ['id', 'title', 'displayed_name', 'owner', 'image', 'image_file', 'created_at']
        read_only_fields = ['id', 'image', 'created_at']

    def create(self, validated_data):
        image_file = validated_data.pop('image_file')
        slug = validated_data.pop('slug', 'default')

        image = ImageUpload(
            title=validated_data['title'],
            image=image_file
        )
        image.upload_slug = slug
        image.save()

        deck = Deck.objects.create(image=image, **validated_data)
        return deck