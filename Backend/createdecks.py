from django.core.files import File
from portfolio.models import Deck
from administration.models import ImageUpload

# === Step 1: Upload Images ===

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

# img1 = upload_image('one_deck', 'test1.png', 'kuxi')
# img2 = upload_image('two_deck', 'test2.png', 'kuxi')
# img3 = upload_image('three_deck', 'test3.png', 'kuxi')
# img4 = upload_image('four_deck', 'test4.png', 'kuxi')
# img5 = upload_image('fixe_deck', 'board.png', 'kuxi')
# img6 = upload_image('six_deck', 'code.png', 'shmooz')
img6 = upload_image('seven_deck', 'top.png', 'shmooz')

# === Step 2: Create Decks using uploaded images ===

Deck.objects.create(
    title="troll deck",
    displayed_name="troll Projects",
    owner="shmooz",
    image=img6
)

# Deck.objects.create(
#     title="boardGames deck",
#     displayed_name="board games",
#     owner="kuxi",
#     image=img5
# )

# Deck.objects.create(
#     title="test1 deck",
#     displayed_name="Lorem Projects",
#     owner="kuxi",
#     image=img1
# )

# Deck.objects.create(
#     title="test2 deck",
#     displayed_name="Ipsum Games",
#     owner="kuxi",
#     image=img2
# )

# Deck.objects.create(
#     title="test3 deck",
#     displayed_name="Ave Quests",
#     owner="kuxi",
#     image=img3
# )

# Deck.objects.create(
#     title="test4 deck",
#     displayed_name="DaShmooze",
#     owner="kuxi",
#     image=img4
# )

print("✅ Created 4 decks linked to their uploaded images.")
