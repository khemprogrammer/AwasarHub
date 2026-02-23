from math import sqrt
from typing import List, Dict, Any
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import FeedContent
from .serializers import FeedContentSerializer
from ads.models import Advertisement
from engagement.models import EngagementLog, Comment
from jobs.models import Job
from opportunities.models import Opportunity
from jobs.serializers import JobSerializer
from opportunities.serializers import OpportunitySerializer


def proximity_score(user_loc, item_loc):
    if not user_loc or not item_loc:
        return 0.0
    (ulat, ulon) = user_loc
    (ilat, ilon) = item_loc
    dist = sqrt((ulat - ilat) ** 2 + (ulon - ilon) ** 2)
    return max(0.0, 1.0 - min(dist / 10.0, 1.0))


def interest_score(interests: List[str], tags: List[str]):
    if not interests or not tags:
        return 0.1
    inter = set(i.lower() for i in interests)
    tset = set(t.lower() for t in tags)
    overlap = inter.intersection(tset)
    return 0.2 + (0.8 * (len(overlap) / max(len(tset), 1)))


class FeedViewSet(viewsets.ModelViewSet):
    queryset = FeedContent.objects.all().order_by("-created_at")
    serializer_class = FeedContentSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def personalized(self, request):
        user = request.user
        interests = user.interests or []
        user_loc = user.location_tuple()

        qs = FeedContent.objects.all()
        results: List[Dict[str, Any]] = []
        for item in qs:
            pscore = proximity_score(user_loc, (item.latitude, item.longitude) if item.latitude is not None and item.longitude is not None else None)
            iscore = interest_score(interests, item.tags or [])
            rank = (0.6 * iscore) + (0.4 * pscore)
            results.append({"rank": rank, "item": item})

        results.sort(key=lambda x: x["rank"], reverse=True)
        feed = [self.serializer_class(r["item"]).data for r in results]

        ads = Advertisement.objects.filter(enabled=True)
        ad_cards = []
        for ad in ads[:3]:
            ad_cards.append({
                "content_type": "AD",
                "title": ad.title,
                "body": ad.body,
                "source_url": ad.link_url,
                "city": ad.city,
                "latitude": ad.latitude,
                "longitude": ad.longitude,
                "created_at": ad.created_at.isoformat(),
            })

        final_feed = []
        ad_index = 0
        for i, card in enumerate(feed):
            final_feed.append(card)
            if i % 5 == 4 and ad_index < len(ad_cards):
                final_feed.append(ad_cards[ad_index])
                ad_index += 1

        return Response({"items": final_feed})

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def global_feed(self, request):
        jobs = Job.objects.all()
        opportunities = Opportunity.objects.all()
        
        job_data = JobSerializer(jobs, many=True).data
        opp_data = OpportunitySerializer(opportunities, many=True).data
        
        for j in job_data:
            j['type'] = 'job'
            j['likes'] = EngagementLog.objects.filter(content_type='job', content_id=j['id'], action='like').count()
            j['comments'] = Comment.objects.filter(content_type='job', content_id=j['id']).count()
            j['reposts'] = EngagementLog.objects.filter(content_type='job', content_id=j['id'], action='repost').count()
            j['shares'] = EngagementLog.objects.filter(content_type='job', content_id=j['id'], action='share').count()
            j['liked_by_user'] = EngagementLog.objects.filter(content_type='job', content_id=j['id'], action='like', user=request.user).exists()

        for o in opp_data:
            o['type'] = 'opportunity'
            o['likes'] = EngagementLog.objects.filter(content_type='opportunity', content_id=o['id'], action='like').count()
            o['comments'] = Comment.objects.filter(content_type='opportunity', content_id=o['id']).count()
            o['reposts'] = EngagementLog.objects.filter(content_type='opportunity', content_id=o['id'], action='repost').count()
            o['shares'] = EngagementLog.objects.filter(content_type='opportunity', content_id=o['id'], action='share').count()
            o['liked_by_user'] = EngagementLog.objects.filter(content_type='opportunity', content_id=o['id'], action='like', user=request.user).exists()

        all_posts = sorted(job_data + opp_data, key=lambda x: x['created_at'], reverse=True)
        return Response({"items": all_posts})

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def log(self, request):
        content_id = request.data.get("content_id")
        action = request.data.get("action")
        if not content_id or not action:
            return Response({"detail": "content_id and action required"}, status=400)
        EngagementLog.objects.create(user=request.user, content_id=content_id, action=action)
        return Response({"status": "ok"})
