"""Regression checks for invested amount calculations.

Run from the ``backend/`` directory:

    python scripts/test_invested_amount.py
"""
from __future__ import annotations

import sys
import types
from pathlib import Path

# Ensure backend/ is on sys.path so local imports work.
sys.path.insert(0, str(Path(__file__).parent.parent))

_mock_casparser = types.ModuleType("casparser")
_mock_casparser.read_cas_pdf = lambda *a, **kw: {}  # type: ignore[attr-defined]
sys.modules.setdefault("casparser", _mock_casparser)

from analytics import compute_analytics  # noqa: E402
from parser import _structure_cas_data  # noqa: E402


def _assert(condition: bool, message: str) -> None:
    if not condition:
        print(f"FAIL: {message}", file=sys.stderr)
        sys.exit(1)
    print(f"PASS: {message}")


raw = {
    "investor_info": {},
    "folios": [
        {
            "folio": "123",
            "amc": "Demo AMC",
            "schemes": [
                {
                    "scheme": "Demo Equity Fund",
                    "isin": "INF000000001",
                    "close": 10,
                    "close_calculated": 10,
                    "valuation": {"value": 1200, "nav": 120, "date": "2026-03-01"},
                    "transactions": [
                        {"date": "2025-01-01", "amount": 1000, "type": "SIP"},
                        {"date": "2025-06-01", "amount": -200, "type": "REDEMPTION"},
                    ],
                }
            ],
        }
    ],
}

cas_data = _structure_cas_data(raw)
scheme = cas_data["schemes"][0]
_assert(scheme["invested_amount"] == 1000.0, "scheme invested_amount excludes redemption cashflows")

analytics = compute_analytics(cas_data)
summary = analytics["portfolio_summary"]
_assert(summary["total_invested"] == 1000.0, "portfolio total_invested matches positive investments only")
_assert(summary["sip_invested"] == 1000.0, "sip_invested still tracks positive SIP cashflows")

print("\nAll invested amount regression checks passed.")
