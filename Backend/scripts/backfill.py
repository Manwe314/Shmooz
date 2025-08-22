# backfill_project_cards_with_deck_fk.py

from portfolio.models import Deck, ProjectCard


def backfill_deck_fk():
    updated = 0
    failed = 0
    for card in ProjectCard.objects.all():
        if card.deck_id is None and card.deckTitle:
            try:
                matching_deck = Deck.objects.get(title=card.deckTitle, owner=card.owner)
                card.deck = matching_deck
                card.save()
                updated += 1
                print(
                    f"✅ Linked card '{card.title}' to deck '{matching_deck.title}' (ID: {matching_deck.id})"
                )
            except Deck.DoesNotExist:
                failed += 1
                print(
                    f"❌ Deck not found for card '{card.title}' with deckTitle='{card.deckTitle}' and owner='{card.owner}'"
                )

    print(f"\n✅ Finished: {updated} cards updated, {failed} cards failed.")


if __name__ == "__main__":
    backfill_deck_fk()
