# create_decks.py (place at root or /app/ inside the container)

from django.core.files import File
from portfolio.models import Deck
from administration.models import ImageUpload

# Upload images
with open('/app/media/uploads/COMPANY/code.png', 'rb') as f1:
    img1 = ImageUpload.objects.create(title='Manual 1', image=File(f1, name='code.png'))

with open('/app/media/uploads/kuxi/board.png', 'rb') as f2:
    img2 = ImageUpload.objects.create(title='Manual 2', image=File(f2, name='board.png'))

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

print("✅ Created 2 images and 2 decks.")

