# portfolio/sitemaps.py
from urllib.parse import urlencode
from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from django.db.models.functions import Coalesce
from django.utils import timezone

from portfolio.models import SlugEntry, PagesModel


class SlugRootSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.5

    def items(self):
        return SlugEntry.objects.all().order_by('id')

    def location(self, obj: SlugEntry) -> str:
        return f"/{obj.slug}"

    def lastmod(self, obj: SlugEntry):
        return obj.edited_at or obj.created_at


class PageOneSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.6

    def items(self):
        return PagesModel.objects.filter(category='page_one').annotate(
            sort_ts=Coalesce('edited_at', 'created_at')
        ).order_by('id')

    def location(self, obj: PagesModel) -> str:
        return f"/page_one/{obj.owner}"

    def lastmod(self, obj: PagesModel):
        return obj.edited_at or obj.created_at


class PageTwoSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.6

    def items(self):
        return PagesModel.objects.filter(category='page_two').annotate(
            sort_ts=Coalesce('edited_at', 'created_at')
        ).order_by('id')

    def location(self, obj: PagesModel) -> str:
        return f"/page_two/{obj.owner}"

    def lastmod(self, obj: PagesModel):
        return obj.edited_at or obj.created_at


class ProjectPageSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.7

    def items(self):
        return PagesModel.objects.select_related('project_card').filter(
            project_card__isnull=False
        ).annotate(
            sort_ts=Coalesce('edited_at', 'created_at')
        ).order_by('id')

    def location(self, obj: PagesModel) -> str:
        qs = urlencode({"slug": obj.owner})
        return f"/project_page/{obj.project_card_id}?{qs}"

    def lastmod(self, obj: PagesModel):
        return obj.edited_at or obj.created_at
