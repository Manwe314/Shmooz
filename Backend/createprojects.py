# seed_project_cards.py

from django.core.files import File
from administration.models import ImageUpload
from portfolio.models import ProjectCard

# === ProjectCard 1 ===
with open('/app/media/1.png', 'rb') as f1:
    image1 = ImageUpload(
        title='Project 1 Image',
        image=File(f1, name='project1.png')
    )
    image1.upload_slug = 'kuxi'
    image1.save()

    ProjectCard.objects.create(
        title='Project One',
        text='Switch To Reality',
        text_color='FEF1DF',
        label_letter='S',
        label_color='2B111C',
        inline_color='FEF1DF',
        deckTitle='test1 deck',
        owner='kuxi',
        image=image1
    )

    ProjectCard.objects.create(
        title='Project Two',
        text='Shmooz To Reality',
        text_color='FEF1DF',
        label_letter='S',
        label_color='2B111C',
        inline_color='FEF1DF',
        deckTitle='boardGames deck',
        owner='kuxi',
        image=image1
    )

# === ProjectCard 2 ===



print("✅ Seeded 2 ProjectCards with images.")
