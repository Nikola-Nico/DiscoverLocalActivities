# recommender.py
import math
from data import CONTEXT_KEYWORDS

def get_distance_score(distance_km, radius_km=1.0):
    if radius_km <= 0:
        return 0.0
    score = 1.0 - (distance_km / radius_km)
    return max(0.0, min(score, 1.0))  # Keeps score between 0.0 and 1.0

def get_rating_score(rating):
    return max(0.0, min(rating / 5.0, 1.0))

def get_popularity_score(user_rating_count):
    # formula: min(log10(user_rating_count + 1) / 4, 1.0)
    score = math.log10(user_rating_count + 1) / 4.0
    return min(score, 1.0)

def get_category_relevance(activity_type, context):
    allowed_types = CONTEXT_KEYWORDS.get(context, [])
    if activity_type in allowed_types:
        return 1.0
    return 0.0

def calculate_recommendation_score(distance_score, rating_score, popularity_score, category_relevance):
    # Define how much each score impacts the final recommendation. 
    # You can change these weights to tune your recommendation engine!
    weights = {
        "distance": 0.3,
        "rating": 0.2,
        "popularity": 0.2,
        "relevance": 0.3
    }
    
    total_score = (
        (distance_score * weights["distance"]) +
        (rating_score * weights["rating"]) +
        (popularity_score * weights["popularity"]) +
        (category_relevance * weights["relevance"])
    )
    return round(total_score, 3)