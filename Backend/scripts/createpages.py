# seed_one_page.py

from django.utils import timezone

from portfolio.models import PagesModel

# Define your content schema (same format used in frontend)
page_content = [
    {
        "id": "block-001",
        "backgroundColor": "rgba(43,17,28,0.15)",
        "borderColor": "#F0F0DD",
        "gridTemplateColumns": "4fr 6fr",
        "gridTemplateRows": "auto auto",
        "content": [
            {
                "id": "txt-001",
                "type": "text",
                "text": "Welcome to Kuxi World!",
                "rowStart": 1,
                "colStart": 2,
                "tag": "h1",
                "textAlign": "center",
                "color": "#333",
            },
            {
                "id": "img-001",
                "type": "image",
                "url": "/media/1.png",
                "alt": "Cover Image",
                "rowStart": 1,
                "colStart": 1,
                "rowSpan": 2,
                "borderRadius": "8px",
            },
            {
                "id": "link-001",
                "type": "link",
                "rowStart": 2,
                "colStart": 2,
                "text": "visit our swagger",
                "url": "http://localhost:8000/api/docs/",
            },
        ],
    }
]

# Save it to the DB
page = PagesModel.objects.create(
    owner="kuxi", category="page_one", content=page_content, created_at=timezone.now()
)

print(
    f"✅ Seeded PagesModel with ID {page.id}, owner='{page.owner}', category='{page.category}'"
)
