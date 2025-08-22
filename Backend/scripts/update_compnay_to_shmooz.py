import os

import django

# --- Setup Django environment ---
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "shmooz.settings")
django.setup()

from portfolio.models import BackgroundData, Deck, PagesModel, ProjectCard

# --- Update BackgroundData ---
bg_updated = BackgroundData.objects.filter(owner="COMPANY").update(owner="shmooz")
print(f"✅ Updated {bg_updated} BackgroundData entries.")

# --- Update Deck ---
deck_updated = Deck.objects.filter(owner="COMPANY").update(owner="shmooz")
print(f"✅ Updated {deck_updated} Deck entries.")

# --- Update ProjectCard ---
pc_updated = ProjectCard.objects.filter(owner="COMPANY").update(owner="shmooz")
print(f"✅ Updated {pc_updated} ProjectCard entries.")

# --- Update PagesModel ---
page_updated = PagesModel.objects.filter(owner="COMPANY").update(owner="shmooz")
print(f"✅ Updated {page_updated} PagesModel entries.")

print("🎯 Update complete!")
