"""Portfolio analytics module — computes derived metrics from CAS data."""
from __future__ import annotations

from collections import defaultdict
from typing import Any


def compute_analytics(cas_data: dict[str, Any]) -> dict[str, Any]:
    """Compute portfolio analytics from parsed CAS data.

    Args:
        cas_data: Structured CAS data returned by ``parser.parse_cas_pdf``.

    Returns:
        Dictionary with computed analytics.
    """
    schemes = cas_data.get("schemes", [])
    transactions = cas_data.get("transactions", [])

    total_invested = 0.0
    total_current_value = 0.0
    amc_distribution: dict[str, dict[str, float]] = defaultdict(lambda: {"invested": 0.0, "current": 0.0})
    scheme_distribution: list[dict[str, Any]] = []
    category_distribution: dict[str, dict[str, float]] = defaultdict(lambda: {"invested": 0.0, "current": 0.0})

    for scheme in schemes:
        invested = scheme.get("invested_amount", 0.0)
        current = scheme.get("current_value", 0.0)
        amc = scheme.get("amc", "Unknown AMC") or "Unknown AMC"
        category = scheme.get("category", "Other") or "Other"
        scheme_name = scheme.get("scheme", "Unknown") or "Unknown"

        total_invested += invested
        total_current_value += current

        amc_distribution[amc]["invested"] += invested
        amc_distribution[amc]["current"] += current

        category_distribution[category]["invested"] += invested
        category_distribution[category]["current"] += current

        scheme_distribution.append({
            "scheme": scheme_name,
            "amc": amc,
            "category": category,
            "invested": invested,
            "current": current,
            "gain_loss": current - invested,
            "gain_loss_pct": (
                ((current - invested) / invested * 100) if invested > 0 else 0.0
            ),
            "units": scheme.get("units", 0.0),
            "nav": scheme.get("nav", 0.0),
        })

    total_gain_loss = total_current_value - total_invested
    total_gain_loss_pct = (
        (total_gain_loss / total_invested * 100) if total_invested > 0 else 0.0
    )

    # SIP vs Lumpsum breakdown
    sip_invested = 0.0
    lumpsum_invested = 0.0
    for txn in transactions:
        amount = txn.get("amount", 0.0)
        txn_type = (txn.get("type", "") or "").upper()
        if amount > 0:
            if txn_type == "SIP":
                sip_invested += amount
            elif txn_type in ("LUMPSUM", "OTHER", ""):
                lumpsum_invested += amount

    # Investment growth over time — aggregate monthly net purchases
    monthly_flow: dict[str, float] = defaultdict(float)
    for txn in transactions:
        date_str = txn.get("date", "")
        amount = txn.get("amount", 0.0)
        if date_str and len(date_str) >= 7:
            month_key = date_str[:7]  # YYYY-MM
            monthly_flow[month_key] += amount

    # Build cumulative investment timeline
    sorted_months = sorted(monthly_flow.keys())
    cumulative = 0.0
    investment_growth: list[dict[str, Any]] = []
    for month in sorted_months:
        cumulative += monthly_flow[month]
        investment_growth.append({"month": month, "cumulative_invested": round(cumulative, 2)})

    # Top 10 holdings by current value
    top_10 = sorted(scheme_distribution, key=lambda x: x["current"], reverse=True)[:10]

    # AMC distribution as list
    amc_dist_list = [
        {
            "amc": amc,
            "invested": round(vals["invested"], 2),
            "current": round(vals["current"], 2),
        }
        for amc, vals in sorted(amc_distribution.items(), key=lambda x: x[1]["current"], reverse=True)
    ]

    # Category distribution as list
    category_dist_list = [
        {
            "category": cat,
            "invested": round(vals["invested"], 2),
            "current": round(vals["current"], 2),
        }
        for cat, vals in category_distribution.items()
    ]

    return {
        "portfolio_summary": {
            "total_invested": round(total_invested, 2),
            "total_current_value": round(total_current_value, 2),
            "total_gain_loss": round(total_gain_loss, 2),
            "total_gain_loss_pct": round(total_gain_loss_pct, 2),
            "total_funds": len(schemes),
            "total_folios": len(cas_data.get("folios", [])),
            "sip_invested": round(sip_invested, 2),
            "lumpsum_invested": round(lumpsum_invested, 2),
        },
        "amc_distribution": amc_dist_list,
        "category_distribution": category_dist_list,
        "scheme_distribution": [
            {
                "scheme": s["scheme"],
                "amc": s["amc"],
                "category": s["category"],
                "invested": round(s["invested"], 2),
                "current": round(s["current"], 2),
                "gain_loss": round(s["gain_loss"], 2),
                "gain_loss_pct": round(s["gain_loss_pct"], 2),
                "units": round(s["units"], 4),
                "nav": round(s["nav"], 4),
            }
            for s in scheme_distribution
        ],
        "top_10_holdings": [
            {
                "scheme": s["scheme"],
                "amc": s["amc"],
                "current": round(s["current"], 2),
                "gain_loss_pct": round(s["gain_loss_pct"], 2),
            }
            for s in top_10
        ],
        "investment_growth": investment_growth,
        "sip_vs_lumpsum": {
            "sip": round(sip_invested, 2),
            "lumpsum": round(lumpsum_invested, 2),
        },
    }
