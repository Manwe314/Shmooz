from django.core.files import File
from portfolio.models import Deck
from administration.models import ImageUpload

# === Step 1: Upload New Images & Hover Images ===

def upload_image(title, filename, slug):
    with open(f'/app/media/{filename}', 'rb') as f:
        img = ImageUpload(
            title=title,
            image=File(f, name=filename)
        )
        img.upload_slug = slug
        img.save()
        print(f"✅ Uploaded image: {filename} as '{title}' with ID {img.id}")
        return img

# Upload replacement images
new_img = upload_image('new_img', 'top.png', 'kuxi')

# Upload hover images
hover = upload_image('hover', 'deck.png', 'kuxi')

# === Step 2: Update Decks ===

def update_deck(title, new_img, hover_img):
    try:
        deck = Deck.objects.get(title=title)
        deck.image = new_img
        deck.hover_img = hover_img
        deck.save()
        print(f"✅ Updated deck '{title}' with new image ID {new_img.id} and hover image ID {hover_img.id}")
    except Deck.DoesNotExist:
        print(f"❌ Deck with title '{title}' not found.")

update_deck("test1 deck", new_img, hover)
update_deck("test2 deck", new_img, hover)
update_deck("test3 deck", new_img, hover)
update_deck("test4 deck", new_img, hover)
update_deck("boardGames deck", new_img, hover)

print("✅ All decks updated with new images and hover images.")
