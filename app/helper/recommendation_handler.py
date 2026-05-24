import math
from datetime import datetime

from app.models import Activity
from app.helper.constants import (
    CONTEXT_ACTIVITY_TYPES,
    MIN_CATEGORY_RELEVANCE,
    _DAY_ALIASES,
)


# Helper functions for recommendation logic


# Get current timestamp in ISO format with timezone
def get_response_timestamp(now: datetime | None = None) -> str:
    current = now or datetime.now().astimezone()
    if current.tzinfo is None:
        current = current.astimezone()
    return current.isoformat(timespec="seconds")


# Scoring functions for different aspects of the recommendation


# Distance score: Closer activities get higher scores (0 to 1)
def get_distance_score(distance_km, radius_km=1.0):
    if radius_km <= 0:
        return 0.0
    score = 1.0 - (distance_km / radius_km)
    return max(0.0, min(score, 1.0))


# Rating score: Normalize activity rating (0 to 5) to a 0 to 1 scale
def get_rating_score(rating):
    if rating is None:
        return 0.0
    return max(0.0, min(rating / 5.0, 1.0))


# Popularity score: Logarithmic scaling based on user rating count (0 to 1)
def get_popularity_score(user_rating_count):
    score = math.log10((user_rating_count or 0) + 1) / 4.0
    return min(score, 1.0)


# Category relevance: rank activity type within the context list.
def get_category_relevance(activity_type, context: str):
    context_types = get_context_activity_types(context)
    normalized_type = (activity_type or "").lower()
    if normalized_type not in context_types:
        return 0.0

    if len(context_types) == 1:
        return 1.0

    rank = context_types.index(normalized_type)
    score_step = (1.0 - MIN_CATEGORY_RELEVANCE) / (len(context_types) - 1)
    score = 1.0 - (rank * score_step)
    return round(max(score, MIN_CATEGORY_RELEVANCE), 3)


# Get ordered activity types based on context keywords
def get_context_activity_types(context: str) -> list[str]:
    normalized_context = context.lower()
    context_types = CONTEXT_ACTIVITY_TYPES.get(normalized_context)
    if context_types is None:
        raise ValueError(f"Unknown recommendation context: {context}")
    return context_types


# Get allowed activity types based on context keywords
def get_allowed_context_types(context: str) -> set[str]:
    return set(get_context_activity_types(context))


# Calculate overall recommendation score using weighted average of
# different factors
def calculate_recommendation_score(
    distance_score, rating_score, popularity_score, category_relevance
):
    weights = {
        "distance": 0.35,
        "rating": 0.3,
        "popularity": 0.2,
        "relevance": 0.15,
    }

    total_score = (
        (distance_score * weights["distance"])
        + (rating_score * weights["rating"])
        + (popularity_score * weights["popularity"])
        + (category_relevance * weights["relevance"])
    )
    return round(total_score, 3)


# Check if activity is currently open based on working hours and
# response timestamp
def _parse_clock(value: str | None):
    if not value:
        return None
    return datetime.strptime(value, "%H:%M").time()


# Check if the working day matches the current day, considering
# aliases and case insensitivity
def _matches_day(working_day: str | None, current_day: str) -> bool:
    if working_day is None:
        return False
    normalized_day = working_day.strip().lower()
    normalized_day = _DAY_ALIASES.get(normalized_day, normalized_day)
    return normalized_day == current_day


# Check if the current time is within the open hours, considering
# breaks and 24h status
def _time_in_range(value, start, end):
    if start <= end:
        return start <= value <= end
    return value >= start or value <= end


# Check if the activity is currently open based on its working hours
# and the current timestamp
def is_activity_open(activity: Activity, response_timestamp: str | None = None) -> bool:
    timestamp = (
        datetime.fromisoformat(response_timestamp)
        if response_timestamp
        else datetime.now().astimezone()
    )
    if timestamp.tzinfo is None:
        timestamp = timestamp.astimezone()

    current_day = timestamp.strftime("%A").lower()
    current_time = timestamp.timetz().replace(tzinfo=None)

    for working_hour in activity.working_hours or []:
        if not _matches_day(working_hour.day_of_week, current_day):
            continue
        if working_hour.is_closed:
            return False
        if working_hour.is_open_24h:
            return True

        open_time = _parse_clock(working_hour.open_time)
        close_time = _parse_clock(working_hour.close_time)
        if open_time is None or close_time is None:
            continue

        if not _time_in_range(current_time, open_time, close_time):
            continue

        break_start = _parse_clock(working_hour.break_hour_start)
        break_end = _parse_clock(working_hour.break_hour_end)
        if (
            break_start is not None
            and break_end is not None
            and _time_in_range(current_time, break_start, break_end)
        ):
            continue

        return True

    return False


# Build the recommendation result dictionary with all relevant
# information and scores
def build_recommendation_result(
    activity: Activity,
    distance_km: float,
    radius_km: float,
    context: str,
    response_timestamp: str,
) -> dict:
    distance_score = get_distance_score(distance_km, radius_km)
    rating_score = get_rating_score(activity.rating)
    popularity_score = get_popularity_score(activity.user_rating_count)
    category_relevance = get_category_relevance(activity.type, context)
    recommendation_score = calculate_recommendation_score(
        distance_score,
        rating_score,
        popularity_score,
        category_relevance,
    )

    result = {
        "id": activity.id,
        "name": activity.name,
        "type": activity.type,
        "latitude": activity.latitude,
        "longitude": activity.longitude,
        "rating": activity.rating,
        "user_rating_count": activity.user_rating_count,
        "distance_km": round(distance_km, 4),
        "recommendation_score": recommendation_score,
        "category_relevance": category_relevance,
        "is_open": True,
        "response_timestamp": response_timestamp,
    }

    result["context"] = context

    return result


# Main function to rank nearby recommendations based on distance,
def rank_nearby_recommendations(
    activities: list[Activity],
    user_lat: float,
    user_lon: float,
    radius_km: float,
    context: str,
    response_timestamp: str | None = None,
) -> tuple[list[dict], str]:
    from app.helper.calculate_haversine import calculate_haversine

    timestamp = (
        get_response_timestamp() if response_timestamp is None else response_timestamp
    )
    allowed_types = get_allowed_context_types(context)

    ranked = []
    for activity in activities:
        distance_km = calculate_haversine(
            user_lat, user_lon, activity.latitude, activity.longitude
        )
        if distance_km > radius_km:
            continue
        if not is_activity_open(activity, timestamp):
            continue
        if (activity.type or "").lower() not in allowed_types:
            continue
        ranked.append(
            build_recommendation_result(
                activity=activity,
                distance_km=distance_km,
                radius_km=radius_km,
                context=context,
                response_timestamp=timestamp,
            )
        )

    ranked.sort(
        key=lambda item: (
            -item["recommendation_score"],
            item["distance_km"],
            item["name"],
        )
    )
    return ranked, timestamp
