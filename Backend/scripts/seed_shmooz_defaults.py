#!/usr/bin/env python3
"""
Script to create default objects for the 'test' slug.
Creates:
- SlugEntry for 'test'
- 2 decks with placeholder data
- 2 project cards for each deck (4 total)
- Project pages for each project card with text content and swagger link
"""

import os
import django

# --- Setup Django environment ---
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "test.settings")
django.setup()

from django.utils import timezone
from portfolio.models import SlugEntry, Deck, ProjectCard, PagesModel, BackgroundData


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
    decks_data = [
        {
            "title": "web_projects_deck",
            "displayed_name": "Web Projects",
            "text_color": "#FFFFFF",
            "hover_color": "#4A90E2",
            "card_amount": 2,
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
    cards_data = [
        # Web Projects Deck Cards
        {
            "title": "E-Commerce Platform",
            "text": "Modern shopping experience",
            "label_letter": "E",
            "deck": decks[0],  # web_projects_deck
        },
        {
            "title": "Portfolio Website",
            "text": "Creative showcase platform",
            "label_letter": "P",
            "deck": decks[0],  # web_projects_deck
        },
        # Mobile Apps Deck Cards
        {
            "title": "Task Manager App",
            "text": "Productivity on the go",
            "label_letter": "T",
            "deck": decks[1],  # mobile_apps_deck
        },
        {
            "title": "Weather Forecast",
            "text": "Real-time weather updates",
            "label_letter": "W",
            "deck": decks[1],  # mobile_apps_deck
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
