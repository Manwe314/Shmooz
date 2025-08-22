from portfolio.models import SlugEntry

# First entry
slug1 = SlugEntry.objects.create(slug="kuxi")
print(f"✅ Created SlugEntry 1 with ID: {slug1.id} and slug: {slug1.slug}")

# Second entry
slug2 = SlugEntry.objects.create(slug="shmooz")
print(f"✅ Created SlugEntry 2 with ID: {slug2.id} and slug: {slug2.slug}")
