from django.core.files import File

from administration.models import ImageUpload
from portfolio.models import Deck

# === Step 1: Upload New Images & Hover Images ===


def upload_image(title, filename, slug=None):
    """Upload image directly to uploads/ folder (slug parameter kept for compatibility but ignored)"""
    with open(f"/app/media/{filename}", "rb") as f:
        img = ImageUpload(title=title, image=File(f, name=filename))
        img.save()
        print(f"✅ Uploaded image: {filename} as '{title}' with ID {img.id}")
        return img


# Upload replacement images
# new_img = upload_image('new_img', 'top.webp', 'kuxi')

#  Upload hover images
# hover = upload_image('hover', 'deck.webp', 'kuxi')

# === Step 2: Update Decks ===


def update_deck(title, color):
    try:
        deck = Deck.objects.get(title=title)
        deck.text_color = color
        deck.save()
        print(f"✅ Updated deck '{title}' with new color {color}")
    except Deck.DoesNotExist:
        print(f"❌ Deck with title '{title}' not found.")


update_deck("test1 deck", "#fff8e7")
update_deck("test2 deck", "#fff8e7")
update_deck("test3 deck", "#fff8e7")
update_deck("test4 deck", "#fff8e7")
update_deck("boardGames deck", "#B87333")

print("✅ All decks updated with new images and hover images.")
