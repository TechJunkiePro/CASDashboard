"""FastAPI backend for the CAS Investment Dashboard."""
from __future__ import annotations

import hashlib
import json
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from analytics import compute_analytics
from parser import parse_cas_pdf

app = FastAPI(
    title="CAS Investment Dashboard API",
    description="Parse Consolidated Account Statement PDFs and serve portfolio analytics.",
    version="1.0.0",
)

# Allow all origins for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory cache keyed by (file_hash, password_hash)
_cache: dict[str, dict[str, Any]] = {}


def _cache_key(file_bytes: bytes, password: str) -> str:
    file_hash = hashlib.sha256(file_bytes).hexdigest()
    pwd_hash = hashlib.sha256(password.encode()).hexdigest()
    return f"{file_hash}:{pwd_hash}"


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}


@app.post("/upload-cas")
async def upload_cas(
    file: UploadFile = File(..., description="CAS PDF file"),
    password: str = Form(..., description="CAS PDF password"),
) -> JSONResponse:
    """Parse a CAS PDF and return structured portfolio data with analytics.

    Returns JSON with keys:
    - investor_info
    - folios
    - schemes
    - transactions
    - portfolio_summary
    - analytics (amc_distribution, category_distribution, top_10_holdings, etc.)
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    cache_key = _cache_key(file_bytes, password)
    if cache_key in _cache:
        return JSONResponse(content=_cache[cache_key])

    try:
        cas_data = parse_cas_pdf(file_bytes, password)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Unexpected error while parsing CAS: {exc}"
        ) from exc

    analytics = compute_analytics(cas_data)

    response_data: dict[str, Any] = {
        "investor_info": cas_data["investor_info"],
        "folios": cas_data["folios"],
        "schemes": cas_data["schemes"],
        "transactions": cas_data["transactions"],
        "portfolio_summary": analytics["portfolio_summary"],
        "analytics": {
            "amc_distribution": analytics["amc_distribution"],
            "category_distribution": analytics["category_distribution"],
            "scheme_distribution": analytics["scheme_distribution"],
            "top_10_holdings": analytics["top_10_holdings"],
            "investment_growth": analytics["investment_growth"],
            "sip_vs_lumpsum": analytics["sip_vs_lumpsum"],
        },
    }

    _cache[cache_key] = response_data
    return JSONResponse(content=response_data)
