# seed_project_cards_updated.py

from django.core.files import File

from administration.models import ImageUpload
from portfolio.models import Deck, ProjectCard


def upload_image(title, filename, slug):
    with open(f"/app/media/{filename}", "rb") as f:
        img = ImageUpload(title=title, image=File(f, name=filename))
        img.upload_slug = slug
        img.save()
        print(f"✅ Uploaded image '{filename}' with ID {img.id}")
        return img


# === Upload image once ===
image1 = upload_image("Project 1 Image", "1.png", "kuxi")

# === Get decks ===
deck_map = {
    "boardGames deck": Deck.objects.get(title="boardGames deck", owner="kuxi"),
    "test1 deck": Deck.objects.get(title="test1 deck", owner="kuxi"),
}

# === Create ProjectCards using uploaded image ===
cards = [
    {
        "title": "Project two",
        "text": "Shmooz To Reality",
        "label_letter": "S",
        "deck_name": "boardGames deck",
    },
    {
        "title": "Project three",
        "text": "trolizmi",
        "label_letter": "T",
        "deck_name": "test1 deck",
    },
    {
        "title": "Project four",
        "text": "MC Fire",
        "label_letter": "Sh",
        "deck_name": "boardGames deck",
    },
    {
        "title": "Project five",
        "text": "ADAM?",
        "label_letter": "A",
        "deck_name": "test1 deck",
    },
    {
        "title": "Project six",
        "text": "kodak",
        "label_letter": "KK",
        "deck_name": "boardGames deck",
    },
    {
        "title": "Project seven",
        "text": "toomuch?",
        "label_letter": "L",
        "deck_name": "boardGames deck",
    },
    {
        "title": "Project eight",
        "text": "WAP",
        "label_letter": "W",
        "deck_name": "boardGames deck",
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
        owner="kuxi",
        image=image1,
        deck=deck_map[card_data["deck_name"]],
    )
    print(f"✅ Created ProjectCard: {card_data['title']}")

print("✅ Seeded 7 ProjectCards using deck FK.")
