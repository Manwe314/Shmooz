#!/usr/bin/env python3
"""
Script to create default objects for the 'test' slug.
Creates:
- SlugEntry for 'test'
- 2 decks with placeholder data
- 2 project cards for each deck (4 total)
- Project pages for each project card with text content and swagger link

HOW TO ADD IMAGES:
1. Place your image files in the Backend/media/ directory (or subdirectories)
2. Uncomment the relevant TODO lines in this script
3. Replace the placeholder paths with your actual image file paths (relative to Backend/)
4. Re-run the script to upload and assign images automatically

The script includes TODO comments for:
- Deck images and hover images (with automatic upload)
- Project card images (with automatic upload)
- Project page images (as image blocks in content using uploaded images)
"""

import os
import sys
import django

# Add the parent directory to Python path so Django can find the shmooz module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# --- Setup Django environment ---
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "shmooz.settings")
django.setup()

from django.utils import timezone
from django.core.files import File
from portfolio.models import SlugEntry, Deck, ProjectCard, PagesModel, BackgroundData
from administration.models import ImageUpload
import os


def upload_image_from_path(title, file_path, slug="test"):
    """
    Upload an image from a file path.

    Args:
        title (str): Title for the image
        file_path (str): Relative path to the image file from Backend/ directory
        slug (str): Slug for organizing uploads (default: "test")

    Returns:
        ImageUpload: The created image object, or None if file doesn't exist
    """
    # Convert relative path to absolute path
    if not os.path.isabs(file_path):
        # Get the Backend directory (parent of scripts directory)
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        full_path = os.path.join(backend_dir, file_path)
    else:
        full_path = file_path

    if not os.path.exists(full_path):
        print(f"❌ Image file not found: {full_path}")
        return None

    try:
        with open(full_path, "rb") as f:
            # Get just the filename for the upload
            filename = os.path.basename(full_path)
            img = ImageUpload(title=title, image=File(f, name=filename))
            img.upload_slug = slug
            img.save()
            print(f"✅ Uploaded image: {filename} as '{title}' (ID: {img.id})")
            return img
    except Exception as e:
        print(f"❌ Failed to upload image {file_path}: {str(e)}")
        return None


def create_slug_entry():
    """Create or get the test slug entry."""
    slug_entry, created = SlugEntry.objects.get_or_create(slug="test")
    if created:
        print(f"✅ Created SlugEntry: {slug_entry.slug} (ID: {slug_entry.id})")
    else:
        print(f"✅ SlugEntry already exists: {slug_entry.slug} (ID: {slug_entry.id})")
    return slug_entry


def create_background_data():
    """Create background data for test if it doesn't exist."""
    bg_data, created = BackgroundData.objects.get_or_create(
        owner="test",
        defaults={
            "color1": "#4A90E2",
            "color2": "#2C3E50",
            "color3": "#1A252F",
            "position1": "15%",
            "position2": "45%",
            "position3": "75%",
            "page1": "About-us",
            "page2": "Services",
            "navColor": "#2C3E50",
            "arrowColor": "#4A90E2",
            "ellipseWidth": 100,
            "ellipseHeight": 50,
        }
    )
    if created:
        print(f"✅ Created BackgroundData for test (ID: {bg_data.id})")
    else:
        print(f"✅ BackgroundData already exists for test (ID: {bg_data.id})")
    return bg_data


def create_decks():
    """Create 2 decks for test."""
    # TODO: Uncomment and modify these lines to add images to decks
    # Replace the paths with your actual image file paths (relative to Backend/ directory)
    # web_deck_image = upload_image_from_path("Web Deck Image", "media/your-web-deck-image.jpg")
    # mobile_deck_image = upload_image_from_path("Mobile Deck Image", "media/your-mobile-deck-image.jpg")
    # web_hover_image = upload_image_from_path("Web Deck Hover", "media/your-web-hover-image.jpg")
    # mobile_hover_image = upload_image_from_path("Mobile Deck Hover", "media/your-mobile-hover-image.jpg")

    decks_data = [
        {
            "title": "web_projects_deck",
            "displayed_name": "Web Projects",
            "text_color": "#FFFFFF",
            "hover_color": "#4A90E2",
            "card_amount": 2,
            # "image": web_deck_image,  # TODO: Uncomment to add deck image
            # "hover_img": web_hover_image,  # TODO: Uncomment to add hover image
            "x_offsets": [0.0, 10.0],
            "y_offsets": [0.0, 5.0],
            "rotations": [0.0, -2.5],
            "alphas": [1.0, 0.9],
            "brightness": [1.0, 0.95],
            "hover_x_offsets": [5.0, 15.0],
            "hover_y_offsets": [2.0, 7.0],
            "hover_rotations": [1.0, -1.5],
            "hover_brightness": [1.1, 1.05],
        },
        {
            "title": "mobile_apps_deck",
            "displayed_name": "Mobile Apps",
            "text_color": "#F8F9FA",
            "hover_color": "#28A745",
            "card_amount": 2,
            # "image": mobile_deck_image,  # TODO: Uncomment to add deck image
            # "hover_img": mobile_hover_image,  # TODO: Uncomment to add hover image
            "x_offsets": [0.0, -8.0],
            "y_offsets": [0.0, 3.0],
            "rotations": [0.0, 1.8],
            "alphas": [1.0, 0.85],
            "brightness": [1.0, 0.9],
            "hover_x_offsets": [-3.0, -11.0],
            "hover_y_offsets": [1.0, 4.0],
            "hover_rotations": [-0.5, 2.3],
            "hover_brightness": [1.05, 0.95],
        }
    ]
    
    created_decks = []
    for deck_data in decks_data:
        deck, created = Deck.objects.get_or_create(
            title=deck_data["title"],
            owner="test",
            defaults=deck_data
        )
        if created:
            print(f"✅ Created Deck: {deck.displayed_name} (ID: {deck.id})")
        else:
            print(f"✅ Deck already exists: {deck.displayed_name} (ID: {deck.id})")
        created_decks.append(deck)
    
    return created_decks


def create_project_cards(decks):
    """Create 2 project cards for each deck."""
    # TODO: Uncomment and modify these lines to add images to project cards
    # Replace the paths with your actual image file paths (relative to Backend/ directory)
    # ecommerce_image = upload_image_from_path("E-Commerce Image", "media/ecommerce-project.jpg")
    # portfolio_image = upload_image_from_path("Portfolio Image", "media/portfolio-project.jpg")
    # taskmanager_image = upload_image_from_path("Task Manager Image", "media/taskmanager-project.jpg")
    # weather_image = upload_image_from_path("Weather App Image", "media/weather-project.jpg")

    cards_data = [
        # Web Projects Deck Cards
        {
            "title": "E-Commerce Platform",
            "text": "Modern shopping experience",
            "label_letter": "E",
            "deck": decks[0],  # web_projects_deck
            # "image": ecommerce_image,  # TODO: Uncomment to add project card image
        },
        {
            "title": "Portfolio Website",
            "text": "Creative showcase platform",
            "label_letter": "P",
            "deck": decks[0],  # web_projects_deck
            # "image": portfolio_image,  # TODO: Uncomment to add project card image
        },
        # Mobile Apps Deck Cards
        {
            "title": "Task Manager App",
            "text": "Productivity on the go",
            "label_letter": "T",
            "deck": decks[1],  # mobile_apps_deck
            # "image": taskmanager_image,  # TODO: Uncomment to add project card image
        },
        {
            "title": "Weather Forecast",
            "text": "Real-time weather updates",
            "label_letter": "W",
            "deck": decks[1],  # mobile_apps_deck
            # "image": weather_image,  # TODO: Uncomment to add project card image
        },
    ]
    
    created_cards = []
    for card_data in cards_data:
        card, created = ProjectCard.objects.get_or_create(
            title=card_data["title"],
            owner="test",
            deck=card_data["deck"],
            defaults={
                "text": card_data["text"],
                "text_color": "#FFFFFF",
                "label_letter": card_data["label_letter"],
                "label_color": "#2C3E50",
                "inline_color": "#4A90E2",
                # "image": card_data.get("image"),  # TODO: Uncomment to add project card image
            }
        )
        if created:
            print(f"✅ Created ProjectCard: {card.title} (ID: {card.id})")
        else:
            print(f"✅ ProjectCard already exists: {card.title} (ID: {card.id})")
        created_cards.append(card)
    
    return created_cards


def create_project_pages(project_cards):
    """Create project pages for each project card."""
    # TODO: Uncomment and modify these lines to add images to project pages
    # Upload images for use in page content (replace paths with your actual image files)
    # page_image_1 = upload_image_from_path("E-Commerce Page Image", "media/ecommerce-page.jpg")
    # page_image_2 = upload_image_from_path("Portfolio Page Image", "media/portfolio-page.jpg")
    # page_image_3 = upload_image_from_path("Task Manager Page Image", "media/taskmanager-page.jpg")
    # page_image_4 = upload_image_from_path("Weather Page Image", "media/weather-page.jpg")

    # Example image block you can add to any page content (after uncommenting image uploads above):
    # {
    #     "id": "img-001",
    #     "type": "image",
    #     "url": page_image_1.image.url if page_image_1 else "/media/placeholder.jpg",
    #     "alt": "Project Image",
    #     "rowStart": 1,
    #     "colStart": 2,
    #     "borderRadius": "8px",
    #     "object-fit": "cover",
    #     "height": "200px",
    # },

    pages_content_templates = [
        # E-Commerce Platform page
        [
            {
                "id": "block-001",
                "backgroundColor": "rgba(74, 144, 226, 0.1)",
                "borderColor": "#4A90E2",
                "gridTemplateColumns": "1fr 1fr",
                "gridTemplateRows": "auto auto auto",
                "content": [
                    {
                        "id": "txt-001",
                        "type": "text",
                        "text": "E-Commerce Platform",
                        "rowStart": 1,
                        "colStart": 1,
                        "colSpan": 2,
                        "tag": "h1",
                        "textAlign": "center",
                        "color": "#2C3E50",
                        "fontSize": "2.5rem",
                        "fontWeight": "bold",
                        "padding": "20px",
                    },
                    {
                        "id": "txt-002",
                        "type": "text",
                        "text": "A comprehensive e-commerce solution built with modern web technologies. Features include user authentication, product catalog, shopping cart, payment processing, and admin dashboard. Designed for scalability and optimal user experience.",
                        "rowStart": 2,
                        "colStart": 1,
                        "colSpan": 2,
                        "tag": "p",
                        "textAlign": "left",
                        "color": "#34495E",
                        "fontSize": "1.1rem",
                        "padding": "15px",
                        "lineHeight": "1.6",
                    },
                    {
                        "id": "link-001",
                        "type": "link",
                        "rowStart": 3,
                        "colStart": 1,
                        "colSpan": 2,
                        "text": "View API Documentation",
                        "url": "http://localhost:8000/api/docs/",
                        "color": "#FFFFFF",
                        "backgroundColor": "#4A90E2",
                        "padding": "12px 24px",
                        "borderRadius": "6px",
                        "textAlign": "center",
                        "fontWeight": "500",
                        "textDecoration": "none",
                    },
                ],
            }
        ],
        # Portfolio Website page
        [
            {
                "id": "block-002",
                "backgroundColor": "rgba(40, 167, 69, 0.1)",
                "borderColor": "#28A745",
                "gridTemplateColumns": "1fr 1fr",
                "gridTemplateRows": "auto auto auto",
                "content": [
                    {
                        "id": "txt-003",
                        "type": "text",
                        "text": "Portfolio Website",
                        "rowStart": 1,
                        "colStart": 1,
                        "colSpan": 2,
                        "tag": "h1",
                        "textAlign": "center",
                        "color": "#2C3E50",
                        "fontSize": "2.5rem",
                        "fontWeight": "bold",
                        "padding": "20px",
                    },
                    {
                        "id": "txt-004",
                        "type": "text",
                        "text": "A creative showcase platform for artists, designers, and developers. Features dynamic galleries, project filtering, contact forms, and responsive design. Built to highlight creative work with smooth animations and intuitive navigation.",
                        "rowStart": 2,
                        "colStart": 1,
                        "colSpan": 2,
                        "tag": "p",
                        "textAlign": "left",
                        "color": "#34495E",
                        "fontSize": "1.1rem",
                        "padding": "15px",
                        "lineHeight": "1.6",
                    },
                    {
                        "id": "link-002",
                        "type": "link",
                        "rowStart": 3,
                        "colStart": 1,
                        "colSpan": 2,
                        "text": "Explore API Endpoints",
                        "url": "http://localhost:8000/api/docs/",
                        "color": "#FFFFFF",
                        "backgroundColor": "#28A745",
                        "padding": "12px 24px",
                        "borderRadius": "6px",
                        "textAlign": "center",
                        "fontWeight": "500",
                        "textDecoration": "none",
                    },
                ],
            }
        ],
        # Task Manager App page
        [
            {
                "id": "block-003",
                "backgroundColor": "rgba(220, 53, 69, 0.1)",
                "borderColor": "#DC3545",
                "gridTemplateColumns": "1fr 1fr",
                "gridTemplateRows": "auto auto auto",
                "content": [
                    {
                        "id": "txt-005",
                        "type": "text",
                        "text": "Task Manager App",
                        "rowStart": 1,
                        "colStart": 1,
                        "colSpan": 2,
                        "tag": "h1",
                        "textAlign": "center",
                        "color": "#2C3E50",
                        "fontSize": "2.5rem",
                        "fontWeight": "bold",
                        "padding": "20px",
                    },
                    {
                        "id": "txt-006",
                        "type": "text",
                        "text": "A powerful mobile productivity app for managing tasks and projects. Features include task creation, priority setting, deadline tracking, team collaboration, and progress analytics. Designed for both personal and professional use.",
                        "rowStart": 2,
                        "colStart": 1,
                        "colSpan": 2,
                        "tag": "p",
                        "textAlign": "left",
                        "color": "#34495E",
                        "fontSize": "1.1rem",
                        "padding": "15px",
                        "lineHeight": "1.6",
                    },
                    {
                        "id": "link-003",
                        "type": "link",
                        "rowStart": 3,
                        "colStart": 1,
                        "colSpan": 2,
                        "text": "Check API Documentation",
                        "url": "http://localhost:8000/api/docs/",
                        "color": "#FFFFFF",
                        "backgroundColor": "#DC3545",
                        "padding": "12px 24px",
                        "borderRadius": "6px",
                        "textAlign": "center",
                        "fontWeight": "500",
                        "textDecoration": "none",
                    },
                ],
            }
        ],
        # Weather Forecast page
        [
            {
                "id": "block-004",
                "backgroundColor": "rgba(255, 193, 7, 0.1)",
                "borderColor": "#FFC107",
                "gridTemplateColumns": "1fr 1fr",
                "gridTemplateRows": "auto auto auto",
                "content": [
                    {
                        "id": "txt-007",
                        "type": "text",
                        "text": "Weather Forecast App",
                        "rowStart": 1,
                        "colStart": 1,
                        "colSpan": 2,
                        "tag": "h1",
                        "textAlign": "center",
                        "color": "#2C3E50",
                        "fontSize": "2.5rem",
                        "fontWeight": "bold",
                        "padding": "20px",
                    },
                    {
                        "id": "txt-008",
                        "type": "text",
                        "text": "A comprehensive weather application providing real-time forecasts, weather alerts, and detailed meteorological data. Features location-based weather, 7-day forecasts, weather maps, and customizable notifications for weather changes.",
                        "rowStart": 2,
                        "colStart": 1,
                        "colSpan": 2,
                        "tag": "p",
                        "textAlign": "left",
                        "color": "#34495E",
                        "fontSize": "1.1rem",
                        "padding": "15px",
                        "lineHeight": "1.6",
                    },
                    {
                        "id": "link-004",
                        "type": "link",
                        "rowStart": 3,
                        "colStart": 1,
                        "colSpan": 2,
                        "text": "View Swagger Documentation",
                        "url": "http://localhost:8000/api/docs/",
                        "color": "#2C3E50",
                        "backgroundColor": "#FFC107",
                        "padding": "12px 24px",
                        "borderRadius": "6px",
                        "textAlign": "center",
                        "fontWeight": "500",
                        "textDecoration": "none",
                    },
                ],
            }
        ],
    ]
    
    created_pages = []
    for i, project_card in enumerate(project_cards):
        # Check if page already exists
        existing_page = PagesModel.objects.filter(project_card=project_card).first()
        if existing_page:
            print(f"✅ Page already exists for ProjectCard: {project_card.title} (Page ID: {existing_page.id})")
            created_pages.append(existing_page)
            continue
        
        page = PagesModel.objects.create(
            owner="test",
            content=pages_content_templates[i],
            category=f"project_{project_card.id}",
            project_card=project_card,
            created_at=timezone.now(),
        )
        print(f"✅ Created Page for ProjectCard: {project_card.title} (Page ID: {page.id})")
        created_pages.append(page)
    
    return created_pages


def main():
    """Main function to create all default objects for test."""
    print("🚀 Starting creation of default objects for 'test' slug...")
    print("=" * 60)
    
    # Create slug entry
    slug_entry = create_slug_entry()
    
    # Create background data
    background_data = create_background_data()
    
    # Create decks
    decks = create_decks()
    
    # Create project cards
    project_cards = create_project_cards(decks)
    
    # Create project pages
    pages = create_project_pages(project_cards)
    
    print("=" * 60)
    print("✅ Successfully created all default objects for 'test'!")
    print(f"   - SlugEntry: {slug_entry.slug}")
    print(f"   - BackgroundData: {background_data.owner}")
    print(f"   - Decks: {len(decks)} created")
    print(f"   - ProjectCards: {len(project_cards)} created")
    print(f"   - Pages: {len(pages)} created")
    print("=" * 60)


if __name__ == "__main__":
    main()


"""
EXAMPLE: How to add images to this script

1. Place your image files in Backend/media/ (or any subdirectory)
   Example structure:
   Backend/
   ├── media/
   │   ├── deck-web.jpg
   │   ├── deck-mobile.jpg
   │   ├── project-ecommerce.jpg
   │   └── project-portfolio.jpg

2. Uncomment and modify the image upload lines in the functions above:

   In create_decks():
   web_deck_image = upload_image_from_path("Web Deck Image", "media/deck-web.jpg")
   mobile_deck_image = upload_image_from_path("Mobile Deck Image", "media/deck-mobile.jpg")

   And uncomment the image assignments in the deck data:
   "image": web_deck_image,
   "hover_img": web_hover_image,

   In create_project_cards():
   ecommerce_image = upload_image_from_path("E-Commerce Image", "media/project-ecommerce.jpg")

   And uncomment in the card data:
   "image": ecommerce_image,

3. Re-run the script and images will be automatically uploaded and assigned!

The upload_image_from_path() function will:
- Check if the file exists
- Upload it to the database with the specified title
- Set the upload_slug to "test" for organization
- Return the ImageUpload object for use in your models
- Print success/error messages

Image paths are relative to the Backend/ directory.
"""
