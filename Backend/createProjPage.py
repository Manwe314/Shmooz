from portfolio.models import PagesModel, ProjectCard
from django.utils import timezone

PROJECT_CARD_ID = 2

try:
    project_card = ProjectCard.objects.get(id=PROJECT_CARD_ID)
except ProjectCard.DoesNotExist:
    print(f"❌ ProjectCard with ID {PROJECT_CARD_ID} does not exist.")
    exit(1)

# Define your content schema (same format used in frontend)
page_content = [
    {
        "id": "block-001",
        "backgroundColor": "rgba(43,17,28,0.25)",
        "borderColor": "#02096b",
        "gridTemplateColumns": "4fr 6fr",
        "gridTemplateRows": "40vh 20vh",
        "tag": "borderTarget",
        "content": [
            {
                "id": "txt-001",
                "type": "text",
                "text": "Welcome to PROJECTS",
                "rowStart": 1,
                "colStart": 1,
                "tag": "h1",
                "textAlign": "center",
                "verticalAlign": "center",
                "horizontalAlign": "right",
                "color": "#f0f0DD",
                "padding": "10px"
            },
            {
                "id": "img-001",
                "type": "image",
                "tag": "imageTarget",
                "url": "/media/1.png",
                "alt": "Cover Image",
                "rowStart": 1,
                "colStart": 2,
                "rowSpan": 2,
                "borderRadius": "600px",
                "object-fit": "contain",
                "height": "100%",
            },
            {
                "id": "link-001",
                "type": "link",
                "rowStart": 2,
                "colStart": 1,
                "text": "visit our swagger",
                "url": "http://localhost:8000/api/docs/",
                "color": "#f0f0DD",
                "iconUrl": "/media/code.png",
                "padding": "10px",
                "verticalAlign": "top",
                "horizontalAlign": "center"
            },
        ]
    }
]

# Delete existing page if it exists
existing_page = PagesModel.objects.filter(project_card=project_card).first()
if existing_page:
    print(f"🗑️ Deleting existing page (ID: {existing_page.id}) for ProjectCard ID {PROJECT_CARD_ID}")
    existing_page.delete()

# Create new page
page = PagesModel.objects.create(
    owner=project_card.owner,
    content=page_content,
    category=f"project_{PROJECT_CARD_ID}",
    project_card=project_card,
    created_at=timezone.now()
)

print(f"✅ Created PagesModel with ID {page.id} linked to ProjectCard ID {PROJECT_CARD_ID}.")
