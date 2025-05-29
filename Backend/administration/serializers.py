from rest_framework import serializers
from .models import ImageUpload
from portfolio.models import Deck, ProjectCard, PagesModel
from rest_framework.exceptions import ValidationError
from portfolio.models import SlugEntry
import re


GRID_TEMPLATE_RE = re.compile(
    r'^(repeat\(\d+,\s*(?:[a-zA-Z0-9().%\s-]+)\)|[a-zA-Z0-9().%\s-]+)+$'
)

VALID_UNITS = [
    'px', 'em', '%', 'fr', 'vh', 'vw', 'rem', 'auto', 'min-content', 'max-content',
]

CSS_COLOR_RE = re.compile(
    r'^#(?:[0-9a-fA-F]{3}){1,2}$'                     
    r'|^rgba?\(\s*(?:\d{1,3}\s*,\s*){2,3}(?:\d{1,3}|\d*\.\d+)\s*\)$',  
    re.IGNORECASE
)

def validate_css_color(value):
    if not isinstance(value, str):
        raise ValidationError("Color must be a string.")

    if not CSS_COLOR_RE.match(value):
        raise ValidationError(f"'{value}' is not a valid CSS color.")

    return value

def validate_grid_template(value):
    if not isinstance(value, str):
        raise ValidationError("Grid template must be a string.")

    if not GRID_TEMPLATE_RE.match(value):
        raise ValidationError(f"'{value}' is not a valid CSS grid template expression.")

    
    tokens = value.replace(',', '').split()
    for token in tokens:
        if (
            not any(unit in token for unit in VALID_UNITS) and
            not token.startswith('repeat(') and
            not token.startswith('minmax(') and
            not token.isnumeric()
        ):
            raise ValidationError(f"Unrecognized grid value: '{token}'")

    return value

def validate_image_item(value):
    if 'url' not in value:
        raise ValidationError(f"{value['id']} does not have a url for the image")
    return value

def validate_text_item(value):
    if 'text' not in value:
        raise ValidationError(f"{value['id']} does not have text data")
    if 'color' in value:
        color = value.get('color')
        validate_css_color(color)

    if 'tag' in value:
        if value['tag'] not in ['p', 'h1', 'h2', 'span', 'div']:
            raise ValidationError(f"{value['id']} does not have correct tag")
    if 'textAlign' in value:
        if value['textAlign'] not in ['left', 'center', 'right']:
            raise ValidationError(f"{value['id']} does not have correct text align value")
    return value

def validate_link_item(value):
    if 'url' not in value or 'text' not in value:
        raise ValidationError(f"{value['id']} does not contain both url and text")
    return value
    




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
    deck_id = serializers.IntegerField(write_only=True, required=True)  # NEW
    deck = serializers.PrimaryKeyRelatedField(read_only=True) 

    class Meta:
        model = ProjectCard
        fields = [
            'id', 'title', 'text', 'text_color',
            'label_letter', 'label_color', 'inline_color',
            'owner', 'image', 'image_id', 'image_url',
            'deck_id', 'deck', 'created_at', 'edited_at'
        ]
        read_only_fields = ['id', 'image', 'created_at', 'edited_at']

    def create(self, validated_data):
        image_id = validated_data.pop('image_id')
        deck_id = validated_data.pop('deck_id')
        try:
            image = ImageUpload.objects.get(id=image_id)
        except ImageUpload.DoesNotExist:
            raise ValidationError("Invalid image_id")
        try:
            deck = Deck.objects.get(id=deck_id)
        except Deck.DoesNotExist:
            raise ValidationError("Invalid deck_id")
        card = ProjectCard.objects.create(image=image, deck=deck, **validated_data)
        return card

    def get_image_url(self, obj):
        if obj.image and obj.image.image:
            return obj.image.image.url
        return None

class PagesModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = PagesModel
        fields = ['id', 'owner', 'category', 'content', 'created_at', 'edited_at']
        read_only_fields = ['id', 'created_at', 'edited_at']

    def validate_content(self, content):
        if not isinstance(content, list):
            raise ValidationError("Content must be a list of blocks.")

        for block in content:
            if not isinstance(block, dict):
                raise ValidationError("Each block must be a dictionary.")

            if 'id' not in block or 'content' not in block:
                raise ValidationError("Each block must have 'id' and 'content'.")
            
            if 'gridTemplateColumns' not in block or 'gridTemplateRows' not in block:
                raise ValidationError("Each Block must have column and row templates")
            
            col = block.get('gridTemplateColumns')
            row = block.get('gridTemplateRows')
            validate_grid_template(col)
            validate_grid_template(row)

            if not isinstance(block['content'], list):
                raise ValidationError("Block 'content' must be a list.")

            for item in block['content']:
                if 'type' not in item or 'id' not in item:
                    raise ValidationError("Each content item must have 'id' and 'type'.")
                
                if 'rowStart' not in item or 'colStart' not in item:
                    raise ValidationError(f"{item[id]} does not have starting position")

                if item['type'] not in ['image', 'text', 'link']:
                    raise ValidationError(f"Unsupported content type: {item['type']}")
                
                if item['type'] == 'image':
                    validate_image_item(item)
                if item['type'] == 'text':
                    validate_text_item(item)
                if item['type'] == 'link':
                    validate_link_item(item)

        return content

    def create(self, validated_data):
        return PagesModel.objects.create(**validated_data)