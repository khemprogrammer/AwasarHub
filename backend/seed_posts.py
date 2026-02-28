import os
import django
import random
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'awasarhub.settings')
django.setup()

from accounts.models import User
from jobs.models import Job
from opportunities.models import Opportunity
from feed.models import FeedContent

admin_user = User.objects.get(username='admin')

jobs_data = [
    {"company": "TechNova", "title": "Frontend Developer", "desc": "Looking for a skilled React developer", "city": "San Francisco", "tags": ['React', 'JavaScript', 'Frontend']},
    {"company": "DataSphere", "title": "Data Scientist", "desc": "Join our AI team to build predictive models", "city": "New York", "tags": ['Python', 'Machine Learning', 'AI']},
    {"company": "CloudPeak", "title": "DevOps Engineer", "desc": "Manage our AWS infrastructure", "city": "Seattle", "tags": ['AWS', 'Docker', 'Kubernetes']},
    {"company": "SecureNet", "title": "Cybersecurity Analyst", "desc": "Protect our systems from emerging threats", "city": "Washington D.C.", "tags": ['Security', 'Network', 'Cyber']},
    {"company": "DesignHub", "title": "UX/UI Designer", "desc": "Create intuitive user experiences", "city": "Austin", "tags": ['Design', 'Figma', 'UX']},
    {"company": "CodeCrafters", "title": "Backend Developer", "desc": "Build scalable APIs using Django", "city": "Remote", "tags": ['Python', 'Django', 'API']},
    {"company": "MobileMinds", "title": "iOS Developer", "desc": "Develop innovative mobile applications", "city": "London", "tags": ['iOS', 'Swift', 'Mobile']},
    {"company": "FinTech Innovations", "title": "Full Stack Engineer", "desc": "Work on next-gen financial software", "city": "Toronto", "tags": ['Full Stack', 'Node.js', 'React']}
]

opp_data = [
    {"org": "Global Scholars", "title": "International Exchange Program", "desc": "Study abroad for a semester", "cat": "scholarship", "city": "Paris", "tags": ['Education', 'Travel', 'Scholarship']},
    {"org": "Tech for Good", "title": "Non-profit Grant", "desc": "Funding for tech projects with social impact", "cat": "grant", "city": "Global", "tags": ['Grant', 'Social Impact', 'Non-profit']},
    {"org": "StartUp Catalyst", "title": "Summer Internship", "desc": "Learn the ropes at a fast-growing startup", "cat": "internship", "city": "Berlin", "tags": ['Internship', 'Startup', 'Business']},
    {"org": "Women in Tech", "title": "Mentorship Program", "desc": "Connect with industry leaders", "cat": "mentorship", "city": "Online", "tags": ['Mentorship', 'Networking', 'Women in Tech']},
    {"org": "Green Future", "title": "Sustainability Fellowship", "desc": "Research renewable energy solutions", "cat": "fellowship", "city": "Copenhagen", "tags": ['Sustainability', 'Research', 'Environment']},
    {"org": "Code Academy", "title": "Coding Bootcamp Scholarship", "desc": "Full tuition coverage for our 12-week program", "cat": "scholarship", "city": "Remote", "tags": ['Coding', 'Education', 'Bootcamp']},
    {"org": "InnovateNow", "title": "Innovation Hackathon", "desc": "Compete for prizes and funding", "cat": "competition", "city": "Singapore", "tags": ['Hackathon', 'Innovation', 'Competition']}
]

feed_data = [
    {"type": "NEWS", "title": "AI Breakthrough in Healthcare", "body": "New AI model predicts diseases with 99% accuracy.", "city": "Boston", "tags": ['AI', 'Healthcare', 'News']},
    {"type": "VIDEO", "title": "Tech Conference Highlights", "body": "Watch the best moments from this year's biggest tech event.", "city": "Las Vegas", "tags": ['Conference', 'Tech', 'Video']},
    {"type": "NEWS", "title": "The Future of Remote Work", "body": "How companies are adapting to hybrid models.", "city": "Global", "tags": ['Remote Work', 'Business', 'News']},
    {"type": "OPPORTUNITY", "title": "Call for Speakers", "body": "Submit your proposals for the upcoming developer summit.", "city": "Amsterdam", "tags": ['Speaking', 'Developer', 'Event']},
    {"type": "JOB", "title": "Hiring Spree at BigTech", "body": "BigTech announces 10,000 new engineering roles.", "city": "Silicon Valley", "tags": ['Hiring', 'Tech', 'Jobs']}
]


# Create Jobs
for data in jobs_data:
    Job.objects.create(
        company=data["company"],
        title=data["title"],
        description=data["desc"],
        city=data["city"],
        tags=data["tags"],
        posted_by=admin_user
    )

# Create Opportunities
for data in opp_data:
    Opportunity.objects.create(
        org=data["org"],
        title=data["title"],
        description=data["desc"],
        category=data["cat"],
        city=data["city"],
        tags=data["tags"],
        posted_by=admin_user
    )

# Create Feed Content
for data in feed_data:
    FeedContent.objects.create(
        content_type=data["type"],
        title=data["title"],
        body=data["body"],
        city=data["city"],
        tags=data["tags"]
    )
    
print("Successfully seeded 20 unique posts!")
