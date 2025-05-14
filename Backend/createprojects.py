# seed_project_cards.py

from django.core.files import File
from administration.models import ImageUpload
from portfolio.models import ProjectCard

def upload_image(title, filename, slug):
    with open(f'/app/media/{filename}', 'rb') as f:
        img = ImageUpload(
            title=title,
            image=File(f, name=filename)
        )
        img.upload_slug = slug
        img.save()
        print(f"✅ Uploaded image '{filename}' with ID {img.id}")
        return img

# === Upload image once ===
image1 = upload_image("Project 1 Image", "1.png", "kuxi")

# === Create ProjectCards using uploaded image ===
cards = [
    {
        "title": "Project two",
        "text": "Shmooz To Reality",
        "label_letter": "S",
        "deckTitle": "boardGames deck"
    },
    {
        "title": "Project three",
        "text": "trolizmi",
        "label_letter": "T",
        "deckTitle": "test1 deck"
    },
    {
        "title": "Project four",
        "text": "MC Fire",
        "label_letter": "Sh",
        "deckTitle": "boardGames deck"
    },
    {
        "title": "Project five",
        "text": "ADAM?",
        "label_letter": "A",
        "deckTitle": "test1 deck"
    },
    {
        "title": "Project six",
        "text": "kodak",
        "label_letter": "KK",
        "deckTitle": "boardGames deck"
    },
    {
        "title": "Project seven",
        "text": "toomuch?",
        "label_letter": "L",
        "deckTitle": "boardGames deck"
    },
    {
        "title": "Project eight",
        "text": "WAP",
        "label_letter": "W",
        "deckTitle": "boardGames deck"
    },
]

for card_data in cards:
    ProjectCard.objects.create(
        title=card_data["title"],
        text=card_data["text"],
        text_color="FEF1DF",
        label_letter=card_data["label_letter"],
        label_color="2B111C",
        inline_color="FEF1DF",
        deckTitle=card_data["deckTitle"],
        owner="kuxi",
        image=image1
    )
    print(f"✅ Created ProjectCard: {card_data['title']}")

print("✅ Seeded 6 ProjectCards using shared image.")
