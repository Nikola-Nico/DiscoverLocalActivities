from app.helper.recommendation_handler import get_category_relevance


def test_category_relevance_uses_ranked_context_order() -> None:
    assert get_category_relevance("coffee_shop", "coffee") == 1.0
    assert get_category_relevance("cafe", "coffee") == 0.825
    assert get_category_relevance("dessert_shop", "coffee") == 0.3


def test_category_relevance_returns_zero_for_non_context_types() -> None:
    assert get_category_relevance("museum", "coffee") == 0.0
