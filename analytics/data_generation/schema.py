"""
Schema definitions and constants for synthetic SME transaction data.
"""

from typing import List

INDUSTRIES: List[str] = [
    "Retail",
    "Wholesale & Distribution",
    "Food & Beverage",
    "Professional Services",
    "Healthcare Services",
    "Construction & Trade",
    "Logistics & Transport"
]

REGIONS: List[str] = [
    "North",
    "South",
    "East",
    "West",
    "Central"
]

CHANNELS: List[str] = [
    "POS Terminal",
    "Online Gateway",
    "Invoice / B2B Direct",
    "Mobile Pay"
]

TRANSACTION_TYPES: List[str] = [
    "PAYMENT",
    "REFUND",
    "FEE"
]

STATUSES: List[str] = [
    "SUCCESS",
    "FAILED",
    "REFUNDED"
]
