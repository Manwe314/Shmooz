from django.core.files import File
from portfolio.models import Deck
from administration.models import ImageUpload


with open('/app/media/test1.png', 'rb') as f1:
    img1 = ImageUpload(
        title='one_deck',
        image=File(f1, name='test1.png')
    )
    img1.upload_slug = 'kuxi'  
    img1.save()

with open('/app/media/test2.png', 'rb') as f2:
    img2 = ImageUpload(
        title='two_deck',
        image=File(f2, name='test2.png')
    )
    img2.upload_slug = 'kuxi'  
    img2.save()

with open('/app/media/test3.png', 'rb') as f3:
    img3 = ImageUpload(
        title='three_deck',
        image=File(f3, name='test3.png')
    )
    img3.upload_slug = 'kuxi'  
    img3.save()

with open('/app/media/test4.png', 'rb') as f4:
    img4 = ImageUpload(
        title='four_deck',
        image=File(f4, name='test4.png')
    )
    img4.upload_slug = 'kuxi'  
    img4.save()


# Create decks

Deck.objects.create(
    title="test1 deck",
    displayed_name="Lorem Projects",
    owner="kuxi",
    image=img1
)

Deck.objects.create(
    title="test2 deck",
    displayed_name="Ipsum Games",
    owner="kuxi",
    image=img2
)

Deck.objects.create(
    title="test3 deck",
    displayed_name="Ave Quests",
    owner="kuxi",
    image=img3
)

Deck.objects.create(
    title="test4 deck",
    displayed_name="DaShmooze",
    owner="kuxi",
    image=img4
)

print("✅ Created 4 images and 4 decks in correct folders.")


