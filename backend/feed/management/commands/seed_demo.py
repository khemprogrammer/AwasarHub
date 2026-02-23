from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from feed.models import FeedContent
from jobs.models import Job
from opportunities.models import Opportunity
from ads.models import Advertisement


class Command(BaseCommand):
    help = "Seed demo data for AwasarHub"

    def handle(self, *args, **options):
        User = get_user_model()
        user, _ = User.objects.get_or_create(username="demo", defaults={
            "email": "demo@example.com"
        })
        user.set_password("Pass123!")
        user.city = "Kathmandu"
        user.interests = ["scholarship", "internship", "coding", "ai"]
        user.latitude = 27.7172
        user.longitude = 85.3240
        user.save()

        FeedContent.objects.all().delete()
        Job.objects.all().delete()
        Opportunity.objects.all().delete()
        Advertisement.objects.all().delete()

        FeedContent.objects.create(
            content_type="NEWS",
            title="AI Youth Summit 2026 announced",
            body="A national summit for AI enthusiasts and students.",
            tags=["ai", "summit", "event"],
            city="Kathmandu",
            latitude=27.7172,
            longitude=85.3240,
        )
        FeedContent.objects.create(
            content_type="VIDEO",
            title="Learn React in 10 minutes",
            video_url="https://www.w3schools.com/html/mov_bbb.mp4",
            tags=["coding", "react"],
            city="Lalitpur",
        )

        Job.objects.create(
            company="TechNepal",
            title="Junior Python Developer",
            description="Work with Django and APIs.",
            tags=["coding", "python", "django"],
            city="Kathmandu",
            link_url="https://example.com/jobs/python",
            posted_by=user,
        )
        Opportunity.objects.create(
            org="Global Scholarships",
            title="Undergraduate Scholarship 2026",
            description="Full ride scholarship for STEM students.",
            category="scholarship",
            tags=["scholarship", "stem"],
            link_url="https://example.com/opportunity/scholarship",
            city="Kathmandu",
            posted_by=user,
        )
        Advertisement.objects.create(
            title="Coding Bootcamp",
            body="Join 12-week intensive bootcamp.",
            category="education",
            tags=["coding", "bootcamp"],
            city="Kathmandu",
            link_url="https://example.com/bootcamp",
            bid_cpm=1.5,
            bid_cpc=0.2,
            enabled=True,
            advertiser=user,
        )

        self.stdout.write(self.style.SUCCESS("Seeded demo data"))
