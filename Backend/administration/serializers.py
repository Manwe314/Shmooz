import re

from django.conf import settings
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from portfolio.models import BackgroundData, Deck, PagesModel, ProjectCard, SlugEntry

from .models import ImageUpload

GRID_TEMPLATE_RE = re.compile(
    r"^(repeat\(\d+,\s*(?:[a-zA-Z0-9().%\s-]+)\)|[a-zA-Z0-9().%\s-]+)+$"
)

VALID_UNITS = [
    "px",
    "em",
    "%",
    "fr",
    "vh",
    "vw",
    "rem",
    "auto",
    "min-content",
    "max-content",
]

CSS_COLOR_RE = re.compile(
    r"^#(?:[0-9a-fA-F]{3}){1,2}$"
    r"|^rgba?\(\s*(?:\d{1,3}\s*,\s*){2,3}(?:\d{1,3}|\d*\.\d+)\s*\)$",
    re.IGNORECASE,
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

    tokens = value.replace(",", "").split()
    for token in tokens:
        if (
            not any(unit in token for unit in VALID_UNITS)
            and not token.startswith("repeat(")
            and not token.startswith("minmax(")
            and not token.isnumeric()
        ):
            raise ValidationError(f"Unrecognized grid value: '{token}'")

    return value


def validate_image_item(value):
    if "url" not in value:
        raise ValidationError(f"{value['id']} does not have a url for the image")
    return value


def validate_text_item(value):
    if "text" not in value:
        raise ValidationError(f"{value['id']} does not have text data")
    if "color" in value:
        color = value.get("color")
        validate_css_color(color)

    if "tag" in value:
        if value["tag"] not in ["p", "h1", "h2", "span", "div"]:
            raise ValidationError(f"{value['id']} does not have correct tag")
    if "textAlign" in value:
        if value["textAlign"] not in ["left", "center", "right"]:
            raise ValidationError(
                f"{value['id']} does not have correct text align value"
            )
    return value


def validate_link_item(value):
    if "url" not in value or "text" not in value:
        raise ValidationError(f"{value['id']} does not contain both url and text")
    return value


class SlugEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = SlugEntry
        fields = ["id", "slug", "created_at", "edited_at"]


class ImageUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageUpload
        fields = ["id", "title", "image", "uploaded_at"]

    def validate_image(self, value):
        """Validate image file size and type"""
        max_size = getattr(settings, 'MAX_IMAGE_SIZE', 5 * 1024 * 1024)  # 5MB default

        if value.size > max_size:
            max_size_mb = max_size / (1024 * 1024)
            current_size_mb = value.size / (1024 * 1024)
            raise ValidationError(
                f"Image file too large. Maximum size is {max_size_mb:.1f}MB, "
                f"but uploaded file is {current_size_mb:.1f}MB."
            )

        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if hasattr(value, 'content_type') and value.content_type not in allowed_types:
            raise ValidationError(
                f"Unsupported image format. Allowed formats: JPEG, PNG, GIF, WebP."
            )

        return value


class PageNamesSerializer(serializers.ModelSerializer):
    class Meta:
        model = BackgroundData
        fields = ["id", "owner", "page1", "page2", "created_at", "edited_at"]


class GradientColorsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BackgroundData
        fields = [
            "id",
            "owner",
            "color1",
            "color2",
            "color3",
            "position1",
            "position2",
            "position3",
            "created_at",
            "edited_at",
        ]


class PageDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BackgroundData
        fields = [
            "id",
            "owner",
            "navColor",
            "arrowColor",
            "ellipseWidth",
            "ellipseHeight",
            "created_at",
            "edited_at",
        ]


class BackgroundDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = BackgroundData
        fields = [
            "id",
            "owner",
            "color1",
            "color2",
            "color3",
            "position1",
            "position2",
            "position3",
            "page1",
            "page2",
            "navColor",
            "arrowColor",
            "ellipseWidth",
            "ellipseHeight",
            "created_at",
            "edited_at",
        ]


class DeckSerializer(serializers.ModelSerializer):
    image_id = serializers.IntegerField(write_only=True, required=True)
    hover_img_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )

    image_url = serializers.SerializerMethodField()
    hover_img_url = serializers.SerializerMethodField()

    class Meta:
        model = Deck
        fields = [
            "id",
            "title",
            "displayed_name",
            "owner",
            "image",
            "image_id",
            "image_url",
            "hover_img",
            "hover_img_id",
            "hover_img_url",
            "card_amount",
            "x_offsets",
            "y_offsets",
            "rotations",
            "alphas",
            "brightness",
            "hover_x_offsets",
            "hover_y_offsets",
            "hover_rotations",
            "hover_brightness",
            "created_at",
            "edited_at",
            "text_color",
            "hover_color",
        ]
        read_only_fields = ["id", "image_url", "hover_img_url", "created_at"]

    def create(self, validated_data):
        image_id = validated_data.pop("image_id")
        hover_img_id = validated_data.pop("hover_img_id", None)

        try:
            image = ImageUpload.objects.get(id=image_id)
        except ImageUpload.DoesNotExist:
            raise serializers.ValidationError("Invalid image_id")

        hover_img = None
        if hover_img_id:
            try:
                hover_img = ImageUpload.objects.get(id=hover_img_id)
            except ImageUpload.DoesNotExist:
                raise serializers.ValidationError("Invalid hover_img_id")

        return Deck.objects.create(image=image, hover_img=hover_img, **validated_data)

    def validate(self, data):
        card_amount = data.get("card_amount")

        arrays = {
            "x_offsets": data.get("x_offsets"),
            "y_offsets": data.get("y_offsets"),
            "rotations": data.get("rotations"),
            "alphas": data.get("alphas"),
            "brightness": data.get("brightness"),
        }

        if card_amount is None:
            if arrays is None:
                raise serializers.ValidationError(
                    {f"Must define card_amount with optional modifiers"}
                )
            return data

        for field_name, arr in arrays.items():
            if arr is not None and len(arr) < card_amount:
                raise serializers.ValidationError(
                    {field_name: f"Must have at least {card_amount} entries."}
                )

        return data

    def update(self, instance, validated_data):
        image_id = validated_data.pop("image_id", None)
        hover_img_id = validated_data.pop("hover_img_id", None)

        if image_id:
            try:
                instance.image = ImageUpload.objects.get(id=image_id)
            except ImageUpload.DoesNotExist:
                raise serializers.ValidationError("Invalid image_id")

        if hover_img_id is not None:
            if hover_img_id:
                try:
                    instance.hover_img = ImageUpload.objects.get(id=hover_img_id)
                except ImageUpload.DoesNotExist:
                    raise serializers.ValidationError("Invalid hover_img_id")
            else:
                instance.hover_img = None

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    @extend_schema_field(OpenApiTypes.URI)
    def _get_image_url(self, image_obj):
        if image_obj and image_obj.image:
            return image_obj.image.url
        return None

    @extend_schema_field(OpenApiTypes.URI)
    def get_image_url(self, obj):
        return self._get_image_url(obj.image)

    @extend_schema_field(OpenApiTypes.URI)
    def get_hover_img_url(self, obj):
        return self._get_image_url(obj.hover_img)


class ProjectCardSerializer(serializers.ModelSerializer):
    image_id = serializers.IntegerField(write_only=True, required=True)
    image_url = serializers.SerializerMethodField()
    deck_id = serializers.IntegerField(write_only=True, required=True)
    deck = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = ProjectCard
        fields = [
            "id",
            "title",
            "text",
            "text_color",
            "label_letter",
            "label_color",
            "inline_color",
            "owner",
            "image",
            "image_id",
            "image_url",
            "deck_id",
            "deck",
            "created_at",
            "edited_at",
        ]
        read_only_fields = ["id", "image", "created_at", "edited_at"]

    def create(self, validated_data):
        image_id = validated_data.pop("image_id")
        deck_id = validated_data.pop("deck_id")
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

    @extend_schema_field(OpenApiTypes.URI)
    def get_image_url(self, obj):
        if obj.image and obj.image.image:
            return obj.image.image.url
        return None


class PagesModelSerializer(serializers.ModelSerializer):
    project_card_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = PagesModel
        fields = [
            "id",
            "owner",
            "category",
            "content",
            "project_card_id",
            "created_at",
            "edited_at",
        ]
        read_only_fields = ["id", "created_at", "edited_at"]

    def validate_content(self, content):
        if not isinstance(content, list):
            raise ValidationError("Content must be a list of blocks.")

        for block in content:
            if not isinstance(block, dict):
                raise ValidationError("Each block must be a dictionary.")

            if "id" not in block or "content" not in block:
                raise ValidationError("Each block must have 'id' and 'content'.")

            if "gridTemplateColumns" not in block or "gridTemplateRows" not in block:
                raise ValidationError("Each Block must have column and row templates")

            col = block.get("gridTemplateColumns")
            row = block.get("gridTemplateRows")
            validate_grid_template(col)
            validate_grid_template(row)

            if not isinstance(block["content"], list):
                raise ValidationError("Block 'content' must be a list.")

            for item in block["content"]:
                if "type" not in item or "id" not in item:
                    raise ValidationError(
                        "Each content item must have 'id' and 'type'."
                    )

                if "rowStart" not in item or "colStart" not in item:
                    raise ValidationError(f"{item[id]} does not have starting position")

                if item["type"] not in ["image", "text", "link"]:
                    raise ValidationError(f"Unsupported content type: {item['type']}")

                if item["type"] == "image":
                    validate_image_item(item)
                if item["type"] == "text":
                    validate_text_item(item)
                if item["type"] == "link":
                    validate_link_item(item)

        return content

    def create(self, validated_data):
        project_card_id = validated_data.pop("project_card_id", None)
        if project_card_id:
            from portfolio.models import ProjectCard

            try:
                project_card = ProjectCard.objects.get(id=project_card_id)
            except ProjectCard.DoesNotExist:
                raise serializers.ValidationError("Invalid project_card_id.")

            if PagesModel.objects.filter(project_card=project_card).exists():
                raise serializers.ValidationError(
                    "A page for this project card already exists."
                )

            validated_data["project_card"] = project_card

        return PagesModel.objects.create(**validated_data)
