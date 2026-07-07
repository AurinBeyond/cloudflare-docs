"""
Aurin Commerce — provider-neutral commerce layer.

Modules:
    - product_catalogue: single source of truth for every live SKU
    - events: provider-neutral webhook event model (canonical form)
"""

from commerce.product_catalogue import (
    CATALOGUE,
    ProductSpec,
    CATEGORY_ACCESS,
    CATEGORY_VOICE,
    CATEGORY_BOOK,
    ONE_SHOT,
    RECURRING,
    get,
    is_known,
    all_skus,
    by_category,
    wallet_grant_for,
    is_recurring,
)

__all__ = [
    "CATALOGUE",
    "ProductSpec",
    "CATEGORY_ACCESS",
    "CATEGORY_VOICE",
    "CATEGORY_BOOK",
    "ONE_SHOT",
    "RECURRING",
    "get",
    "is_known",
    "all_skus",
    "by_category",
    "wallet_grant_for",
    "is_recurring",
]
