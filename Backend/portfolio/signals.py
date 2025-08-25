from __future__ import annotations
import logging
from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.db import transaction

from portfolio.models import BackgroundData, Deck, ProjectCard, PagesModel, SlugEntry
from .cache_invalidate import (
    invalidate_deck, invalidate_background, invalidate_page, invalidate_project_page
)

logger = logging.getLogger(__name__)

@receiver(pre_save, sender=SlugEntry)
def _slugentry_capture_old(sender, instance: SlugEntry, **kwargs):
    if instance.pk:
        try:
            old = SlugEntry.objects.get(pk=instance.pk)
            instance.__old_slug = old.slug
        except SlugEntry.DoesNotExist:
            instance.__old_slug = None
    else:
        instance.__old_slug = None

@receiver(post_save, sender=SlugEntry)
def _slugentry_invalidate(sender, instance: SlugEntry, created: bool, **kwargs):
    new_slug = instance.slug
    old_slug = getattr(instance, '__old_slug', None)

    def _do():
        try:
            if created:
                logger.info(f"New slug created: {new_slug}, invalidating cache")
                invalidate_deck(new_slug)
                invalidate_background(new_slug)
                for cat in PagesModel.objects.filter(owner=new_slug).values_list('category', flat=True):
                    invalidate_page(new_slug, cat)
            else:
                if old_slug and old_slug != new_slug:
                    logger.info(f"Slug renamed from {old_slug} to {new_slug}, invalidating both")
                    invalidate_deck(old_slug)
                    invalidate_background(old_slug)
                    for cat in PagesModel.objects.filter(owner=old_slug).values_list('category', flat=True):
                        invalidate_page(old_slug, cat)
                invalidate_deck(new_slug)
                invalidate_background(new_slug)
                for cat in PagesModel.objects.filter(owner=new_slug).values_list('category', flat=True):
                    invalidate_page(new_slug, cat)
        except Exception as e:
            logger.error(f"Failed to invalidate cache for slug {new_slug}: {e}")

    transaction.on_commit(_do)

@receiver(post_save, sender=BackgroundData)
def _backgrounddata_save(sender, instance: BackgroundData, created: bool, **kwargs):
    slug = instance.owner

    def _do():
        try:
            logger.info(f"BackgroundData {'created' if created else 'updated'} for slug: {slug}")
            invalidate_background(slug)
            invalidate_deck(slug)
        except Exception as e:
            logger.error(f"Failed to invalidate cache for BackgroundData {slug}: {e}")

    transaction.on_commit(_do)

@receiver(post_delete, sender=BackgroundData)
def _backgrounddata_delete(sender, instance: BackgroundData, **kwargs):
    slug = instance.owner

    def _do():
        try:
            logger.info(f"BackgroundData deleted for slug: {slug}")
            invalidate_background(slug)
            invalidate_deck(slug)
        except Exception as e:
            logger.error(f"Failed to invalidate cache for deleted BackgroundData {slug}: {e}")

    transaction.on_commit(_do)

@receiver(post_save, sender=Deck)
def _deck_save(sender, instance: Deck, created: bool, **kwargs):
    slug = instance.owner

    def _do():
        try:
            logger.info(f"Deck {'created' if created else 'updated'} for slug: {slug}")
            invalidate_deck(slug)
        except Exception as e:
            logger.error(f"Failed to invalidate cache for Deck {slug}: {e}")

    transaction.on_commit(_do)

@receiver(post_delete, sender=Deck)
def _deck_delete(sender, instance: Deck, **kwargs):
    slug = instance.owner

    def _do():
        try:
            logger.info(f"Deck deleted for slug: {slug}")
            invalidate_deck(slug)
        except Exception as e:
            logger.error(f"Failed to invalidate cache for deleted Deck {slug}: {e}")

    transaction.on_commit(_do)

@receiver(post_save, sender=PagesModel)
def _pagemodel_save(sender, instance: PagesModel, created: bool, **kwargs):
    slug = instance.owner
    cat = instance.category

    def _do():
        try:
            logger.info(f"PagesModel {'created' if created else 'updated'} for slug: {slug}, category: {cat}")
            invalidate_page(slug, cat)
            if instance.project_card_id:
                invalidate_project_page(instance.project_card_id, slug)
        except Exception as e:
            logger.error(f"Failed to invalidate cache for PagesModel {slug}/{cat}: {e}")

    transaction.on_commit(_do)

@receiver(post_delete, sender=PagesModel)
def _pagemodel_delete(sender, instance: PagesModel, **kwargs):
    slug = instance.owner
    cat = instance.category

    def _do():
        try:
            logger.info(f"PagesModel deleted for slug: {slug}, category: {cat}")
            invalidate_page(slug, cat)
            if instance.project_card_id:
                invalidate_project_page(instance.project_card_id, slug)
        except Exception as e:
            logger.error(f"Failed to invalidate cache for deleted PagesModel {slug}/{cat}: {e}")

    transaction.on_commit(_do)

@receiver(post_save, sender=ProjectCard)
def _projectcard_save(sender, instance: ProjectCard, created: bool, **kwargs):
    slug = instance.owner
    pid = instance.id

    def _do():
        try:
            logger.info(f"ProjectCard {'created' if created else 'updated'} for slug: {slug}, id: {pid}")
            invalidate_project_page(pid, slug)
        except Exception as e:
            logger.error(f"Failed to invalidate cache for ProjectCard {pid}: {e}")

    transaction.on_commit(_do)

@receiver(post_delete, sender=ProjectCard)
def _projectcard_delete(sender, instance: ProjectCard, **kwargs):
    slug = instance.owner
    pid = instance.id

    def _do():
        try:
            logger.info(f"ProjectCard deleted for slug: {slug}, id: {pid}")
            invalidate_project_page(pid, slug)
        except Exception as e:
            logger.error(f"Failed to invalidate cache for deleted ProjectCard {pid}: {e}")

    transaction.on_commit(_do)
