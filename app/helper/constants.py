ACTIVITY_TYPES: set[str] = {
    "art_gallery",
    "art_museum",
    "bakery",
    "bar",
    "barbecue_restaurant",
    "bistro",
    "bridge",
    "cafe",
    "cafeteria",
    "cake_shop",
    "church",
    "coffee_shop",
    "cultural_center",
    "dessert_restaurant",
    "donut_shop",
    "eastern_european_restaurant",
    "event_venue",
    "fast_food_restaurant",
    "gas_station",
    "gastropub",
    "hamburger_restaurant",
    "history_museum",
    "hotel",
    "irish_pub",
    "italian_restaurant",
    "lounge_bar",
    "meal_takeaway",
    "mosque",
    "movie_theater",
    "museum",
    "other",
    "pastry_shop",
    "pizza_restaurant",
    "playground",
    "restaurant",
    "seafood_restaurant",
    "soul_food_restaurant",
    "sushi_restaurant",
    "tourist_attraction",
    "wine_bar",
}

MIN_CATEGORY_RELEVANCE: float = 0.3


# For future improvement, we can: 
# - Consider adding more context keywords and activity types based on user feedback and data analysis.
# - Implement a more dynamic way to update context-activity mappings without code changes, 
# such as using a database or configuration file, or even leveraging machine learning to 
# learn associations from user interactions and preferences.
CONTEXT_ACTIVITY_TYPES: dict[str, list[str]] = {
    "breakfast": [
        "bakery",
        "cafe",
        "coffee_shop",
        "pastry_shop",
        "breakfast_restaurant",
        "brunch_restaurant",
        "dessert_shop",
    ],
    "coffee": [
        "coffee_shop",
        "cafe",
        "bakery",
        "pastry_shop",
        "dessert_shop",
    ],
    "lunch": [
        "restaurant",
        "bistro",
        "lunch_restaurant",
        "sandwich_shop",
        "fast_food_restaurant",
        "italian_restaurant",
        "seafood_restaurant",
        "barbecue_restaurant",
        "diner",
        "bakery",
    ],
    "dinner": [
        "restaurant",
        "fine_dining_restaurant",
        "bistro",
        "steak_house",
        "seafood_restaurant",
        "grill",
        "italian_restaurant",
        "sushi_restaurant",
        "barbecue_restaurant",
    ],
    "nightlife": [
        "bar",
        "cocktail_bar",
        "lounge",
        "pub",
        "night_club",
    ],
    "culture": [
        "museum",
        "art_museum",
        "art_gallery",
        "history_museum",
        "tourist_attraction",
        "monument",
        "library",
    ],
    "family": [
        "amusement_park",
        "zoo",
        "playground",
        "movie_theater",
        "bowling_alley",
        "museum",
        "park",
    ],
    "outdoors": [
        "park",
        "hiking_area",
        "beach",
        "botanical_garden",
        "lake",
        "tourist_attraction",
    ],
    "shopping": [
        "shopping_mall",
        "market",
        "clothing_store",
        "book_store",
        "supermarket",
    ],
    "wellness": [
        "spa",
        "massage",
        "sauna",
        "gym",
        "beauty_salon",
    ],
}

CONTEXT_KEYWORDS: dict[str, set[str]] = {
    context: set(activity_types)
    for context, activity_types in CONTEXT_ACTIVITY_TYPES.items()
}

_DAY_ALIASES = {
    "0": "monday",
    "1": "tuesday",
    "2": "wednesday",
    "3": "thursday",
    "4": "friday",
    "5": "saturday",
    "6": "sunday",
}

