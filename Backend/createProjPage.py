# seed_one_page.py

from portfolio.models import PagesModel, ProjectCard
from django.utils import timezone

PROJECT_CARD_ID = 3

try:
    project_card = ProjectCard.objects.get(id=PROJECT_CARD_ID)
except ProjectCard.DoesNotExist:
    print(f"❌ ProjectCard with ID {PROJECT_CARD_ID} does not exist.")
    exit(1)

# Define your content schema (same format used in frontend)
page_content = [
    {
        "id": "block-001",
        "backgroundColor": "rgba(43,17,28,0.15)",
        "borderColor": "#F0F0DD",
        "gridTemplateColumns": "4fr 10px 6fr",
        "gridTemplateRows": "auto auto auto",
        "content": [
            {
                "id": "txt-001",
                "type": "text",
                "text": "Welcome to PROJECTS",
                "rowStart": 1,
                "colStart": 3,
                "tag": "h1",
                "textAlign": "center",
                "color": "#f0f0DD"
            },
            {
                "id": "img-001",
                "type": "image",
                "url": "/media/1.png",
                "alt": "Cover Image",
                "rowStart": 1,
                "colStart": 1,
                "rowSpan": 2,
                "borderRadius": "8px"
            },
            {
                "id": "link-001",
                "type": "link",
                "rowStart": 2,
                "colStart": 3,
                "text": "visit our swagger",
                "url": "http://localhost:8000/api/docs/"
            },
            {
                "id": "img-002",
                "type": "image",
                "url": "/media/board.png",
                "alt": "Cover Image",
                "rowStart": 3,
                "colStart": 1,
                "colSpan": 3,
                "borderRadius": "8px"
            }
        ]
    }
]

# Save it to the DB
if PagesModel.objects.filter(project_card=project_card).exists():
    print(f"⚠️ A page already exists for ProjectCard ID {PROJECT_CARD_ID}. Skipping creation.")
else:
    # 4️⃣ Create the PagesModel entry
    page = PagesModel.objects.create(
        owner=project_card.owner,
        content=page_content,
        project_card=project_card,
        created_at=timezone.now()
    )

print(f"✅ Created PagesModel with ID {page.id} linked to ProjectCard ID {PROJECT_CARD_ID}.")