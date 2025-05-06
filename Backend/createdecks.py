from django.core.files import File
from portfolio.models import Deck
from administration.models import ImageUpload


with open('/app/media/uploads/COMPANY/code.png', 'rb') as f1:
    img1 = ImageUpload(
        title='coding_deck',
        image=File(f1, name='code.png')
    )
    img1.upload_slug = 'COMPANY'  
    img1.save()

with open('/app/media/uploads/kuxi/board.png', 'rb') as f2:
    img2 = ImageUpload(
        title='board_deck',
        image=File(f2, name='board.png')
    )
    img2.upload_slug = 'kuxi'
    img2.save()

# Create decks

Deck.objects.create(
    title="coding deck",
    displayed_name="Coding Projects",
    owner="COMPANY",
    image=img1
)

Deck.objects.create(
    title="boardGames deck",
    displayed_name="Board Games",
    owner="kuxi",
    image=img2
)

print("✅ Created 2 images and 2 decks in correct folders.")


