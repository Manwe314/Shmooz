from drf_spectacular.plumbing import build_basic_type
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import (
    OpenApiExample,
    OpenApiResponse,
    OpenApiTypes,
    PolymorphicProxySerializer,
    extend_schema_field,
)
from rest_framework import serializers


class BaseContentSchema(serializers.Serializer):
    id = serializers.CharField()
    type = serializers.ChoiceField(choices=["image", "text", "link"])
    rowStart = serializers.IntegerField()
    colStart = serializers.IntegerField()
    rowSpan = serializers.IntegerField(required=False)
    colSpan = serializers.IntegerField(required=False)
    margin = serializers.CharField(required=False)
    padding = serializers.CharField(required=False)


class ImageContentSchema(BaseContentSchema):
    type = serializers.ChoiceField(choices=["image"])
    url = serializers.URLField()
    tag = serializers.CharField(required=False)
    alt = serializers.CharField(required=False)
    borderRadius = serializers.CharField(required=False)
    objectFit = serializers.ChoiceField(
        choices=["cover", "contain", "fill", "none", "scale-down"], required=False
    )
    objectPosition = serializers.CharField(required=False)
    overflow = serializers.ChoiceField(
        choices=["visible", "hidden", "scroll"], required=False
    )
    width = serializers.CharField(required=False)
    height = serializers.CharField(required=False)


class TextContentSchema(BaseContentSchema):
    type = serializers.ChoiceField(choices=["text"])
    text = serializers.CharField()
    color = serializers.CharField(required=False)
    tag = serializers.ChoiceField(
        choices=["p", "h1", "h2", "span", "div"], required=False
    )
    horizontalAlign = serializers.ChoiceField(
        choices=["left", "center", "right"], required=False
    )
    verticalAlign = serializers.ChoiceField(
        choices=["top", "center", "bottom"], required=False
    )
    textAlign = serializers.ChoiceField(
        choices=["left", "center", "right"], required=False
    )
    fontSize = serializers.CharField(required=False)
    fontWeight = serializers.CharField(required=False)
    fontFamily = serializers.CharField(required=False)


class LinkContentSchema(BaseContentSchema):
    type = serializers.ChoiceField(choices=["link"])
    url = serializers.URLField()
    text = serializers.CharField()
    iconUrl = serializers.URLField(required=False)
    color = serializers.CharField(required=False)
    horizontalAlign = serializers.ChoiceField(
        choices=["left", "center", "right"], required=False
    )
    verticalAlign = serializers.ChoiceField(
        choices=["top", "center", "bottom"], required=False
    )
    fontSize = serializers.CharField(required=False)
    fontWeight = serializers.CharField(required=False)
    fontFamily = serializers.CharField(required=False)
    iconPosition = serializers.ChoiceField(choices=["left", "right"], required=False)


BlockContentSchema = PolymorphicProxySerializer(
    component_name="BlockContent",
    serializers=[ImageContentSchema, TextContentSchema, LinkContentSchema],
    resource_type_field_name="type",
)


class BlockSchema(serializers.Serializer):
    id = serializers.CharField()
    backgroundColor = serializers.CharField()
    borderColor = serializers.CharField()
    gridTemplateColumns = serializers.CharField()
    gridTemplateRows = serializers.CharField()
    tag = serializers.CharField(required=False)
    content = serializers.ListField(
        child=BlockContentSchema, help_text="List of image/text/link elements"
    )


class PageSchema(serializers.Serializer):
    content = serializers.ListField(
        child=BlockSchema(), help_text="List of blocks for the page layout"
    )
