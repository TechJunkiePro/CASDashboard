"""CAS PDF parser module using casparser library."""
from __future__ import annotations

import io
from typing import Any

import casparser
from casparser import read_cas_pdf


def parse_cas_pdf(file_bytes: bytes, password: str) -> dict[str, Any]:
    """Parse a CAS PDF file and return structured data.

    Args:
        file_bytes: Raw bytes of the CAS PDF.
        password: Password to decrypt the CAS PDF.

    Returns:
        Structured dictionary with investor_info, folios, schemes, and transactions.

    Raises:
        ValueError: If the password is incorrect or the file is not a valid CAS PDF.
    """
    try:
        result = read_cas_pdf(io.BytesIO(file_bytes), password=password, output="dict")
    except Exception as exc:
        error_msg = str(exc).lower()
        if any(k in error_msg for k in ("password", "decrypt", "incorrect", "wrong")):
            raise ValueError("Incorrect CAS password. Please check and try again.") from exc
        raise ValueError(f"Failed to parse CAS PDF: {exc}") from exc

    return _structure_cas_data(result)


def _structure_cas_data(raw: dict[str, Any]) -> dict[str, Any]:
    """Convert casparser dict output into a structured response."""
    investor_info: dict[str, Any] = {}
    folios: list[dict[str, Any]] = []
    schemes: list[dict[str, Any]] = []
    transactions: list[dict[str, Any]] = []

    raw_investor = raw.get("investor_info") or {}
    investor_info = {
        "name": raw_investor.get("name", "") or "",
        "email": raw_investor.get("email", "") or "",
        "mobile": raw_investor.get("mobile", "") or "",
        "address": raw_investor.get("address", "") or "",
    }

    for folio in raw.get("folios", []) or []:
        folio_number = folio.get("folio", "") or ""
        amc = folio.get("amc", "") or ""
        pan = folio.get("PAN", "") or folio.get("pan", "") or ""
        kyc = folio.get("KYC", "") or folio.get("kyc", "") or ""

        folio_data: dict[str, Any] = {
            "folio": folio_number,
            "amc": amc,
            "pan": pan,
            "kyc": kyc,
            "schemes": [],
        }
        folios.append(folio_data)

        for scheme in folio.get("schemes", []) or []:
            scheme_name = scheme.get("scheme", "") or ""
            isin = scheme.get("isin", "") or ""
            close = float(scheme.get("close", 0.0) or 0.0)
            close_calculated = float(scheme.get("close_calculated", 0.0) or 0.0)

            valuation = scheme.get("valuation") or {}
            current_value = float(valuation.get("value", 0.0) or 0.0)
            nav_val = float(valuation.get("nav", 0.0) or 0.0)
            nav_date_val = str(valuation.get("date", "")) if valuation.get("date") else ""

            scheme_transactions: list[dict[str, Any]] = []
            invested_amount = 0.0

            for txn in scheme.get("transactions", []) or []:
                txn_date = txn.get("date")
                txn_description = txn.get("description", "") or ""
                txn_amount = float(txn.get("amount", 0.0) or 0.0)
                txn_units = float(txn.get("units", 0.0) or 0.0)
                txn_nav = float(txn.get("nav", 0.0) or 0.0)
                txn_balance = float(txn.get("balance", 0.0) or 0.0)
                txn_type_raw = txn.get("type") or ""
                txn_type = str(txn_type_raw).replace("TransactionType.", "")

                txn_record: dict[str, Any] = {
                    "date": str(txn_date) if txn_date else "",
                    "description": txn_description,
                    "amount": txn_amount,
                    "units": txn_units,
                    "nav": txn_nav,
                    "balance": txn_balance,
                    "type": txn_type,
                    "scheme": scheme_name,
                    "folio": folio_number,
                    "amc": amc,
                }
                scheme_transactions.append(txn_record)
                transactions.append(txn_record)

                if txn_amount > 0:
                    invested_amount += txn_amount
                elif txn_amount < 0:
                    invested_amount += txn_amount

            category = _infer_category(scheme_name)
            scheme_record: dict[str, Any] = {
                "scheme": scheme_name,
                "folio": folio_number,
                "amc": amc,
                "isin": isin,
                "units": close,
                "units_calculated": close_calculated,
                "nav": nav_val,
                "nav_date": nav_date_val,
                "current_value": current_value,
                "invested_amount": invested_amount,
                "gain_loss": current_value - invested_amount,
                "gain_loss_pct": (
                    ((current_value - invested_amount) / invested_amount * 100)
                    if invested_amount > 0
                    else 0.0
                ),
                "category": category,
                "transactions": scheme_transactions,
            }
            schemes.append(scheme_record)
            folio_data["schemes"].append(scheme_record)

    return {
        "investor_info": investor_info,
        "folios": folios,
        "schemes": schemes,
        "transactions": transactions,
    }


def _infer_category(scheme_name: str) -> str:
    """Infer fund category from scheme name."""
    name_lower = (scheme_name or "").lower()
    if any(k in name_lower for k in ("liquid", "overnight", "money market", "ultra short")):
        return "Debt"
    if any(k in name_lower for k in ("debt", "bond", "gilt", "income", "credit risk", "banking and psu", "corporate")):
        return "Debt"
    if any(k in name_lower for k in ("equity", "large cap", "mid cap", "small cap", "multi cap", "flexi", "focused", "value", "contra", "dividend yield", "elss", "tax saver", "sectoral", "thematic", "index", "nifty", "sensex", "etf")):
        return "Equity"
    if any(k in name_lower for k in ("hybrid", "balanced", "aggressive hybrid", "conservative hybrid", "arbitrage")):
        return "Hybrid"
    if "fund of fund" in name_lower or "fof" in name_lower:
        return "FoF"
    return "Other"
