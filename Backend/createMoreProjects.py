# seed_project_cards_extra.py

from django.core.files import File
from administration.models import ImageUpload
from portfolio.models import ProjectCard, Deck

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
image1 = upload_image("Project Extra Image", "1.png", "kuxi")

# === Get decks ===
deck_titles = ["coding deck", "test2 deck", "test3 deck", "test4 deck"]
deck_map = {}
for title in deck_titles:
    try:
        deck = Deck.objects.get(title=title, owner="kuxi")
        deck_map[title] = deck
        print(f"✅ Found deck '{title}' with ID {deck.id}")
    except Deck.DoesNotExist:
        print(f"❌ Deck '{title}' not found. Skipping.")
        continue

# === Define card counts ===
cards_to_create = {
    "coding deck": 1,
    "test2 deck": 4,
    "test3 deck": 6,
    "test4 deck": 7,
}

# === Generate ProjectCards ===
label_letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I"]

for deck_name, count in cards_to_create.items():
    deck = deck_map.get(deck_name)
    if not deck:
        continue

    for i in range(1, count + 1):
        ProjectCard.objects.create(
            title=f"Project {deck_name} {i}",
            text=f"Content for project {i} in {deck_name}",
            text_color="FEF1DF",
            label_letter=label_letters[(i - 1) % len(label_letters)],
            label_color="2B111C",
            inline_color="FEF1DF",
            owner="kuxi",
            image=image1,
            deck=deck
        )
        print(f"✅ Created ProjectCard {i} in deck '{deck_name}'")

print("✅ Seeded extra ProjectCards successfully!")
