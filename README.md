# CAS Dashboard

A **personal investment dashboard** that reads your **Consolidated Account Statement (CAS) PDF** from mutual funds and generates a visual analytics dashboard.

## Features

- 📄 Upload CAS PDF with password
- 📊 Portfolio summary (invested, current value, gain/loss)
- 🥧 Pie charts — AMC, asset class, SIP vs Lumpsum allocation
- 📈 Line chart — Investment growth over time
- 📉 Bar chart — Top 10 holdings
- 🗂️ Sortable/searchable scheme table
- 📱 Manual stock entry with P&L tracking
- 💾 Download parsed data as JSON
- 🌙 Dark mode, responsive design

## Project Structure

```
investment-dashboard/
├── backend/
│   ├── main.py           # FastAPI app
│   ├── parser.py         # CAS PDF parser (uses casparser)
│   ├── analytics.py      # Portfolio analytics
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── types/        # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── sample_data/          # Place CAS PDFs here for testing
└── README.md
```

## Prerequisites

- Python 3.11+
- Node.js 18+

## Setup & Run

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be available at http://localhost:8000

API docs at http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The dashboard will be available at http://localhost:5173

### 3. Usage

1. Open http://localhost:5173 in your browser
2. Upload your CAS PDF file
3. Enter the CAS password (usually your PAN or email)
4. View your complete portfolio analytics dashboard

## API Reference

### `POST /upload-cas`

Upload and parse a CAS PDF.

**Form Data:**
| Field | Type | Description |
|-------|------|-------------|
| `file` | File | CAS PDF file |
| `password` | string | PDF password |

**Response:**
```json
{
  "investor_info": { "name": "...", "email": "...", "mobile": "...", "address": "..." },
  "folios": [...],
  "schemes": [...],
  "transactions": [...],
  "portfolio_summary": {
    "total_invested": 500000,
    "total_current_value": 650000,
    "total_gain_loss": 150000,
    "total_gain_loss_pct": 30.0,
    "total_funds": 12,
    "total_folios": 3,
    "sip_invested": 300000,
    "lumpsum_invested": 200000
  },
  "analytics": {
    "amc_distribution": [...],
    "category_distribution": [...],
    "scheme_distribution": [...],
    "top_10_holdings": [...],
    "investment_growth": [...],
    "sip_vs_lumpsum": { "sip": 300000, "lumpsum": 200000 }
  }
}
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI, casparser |
| Frontend | React, TypeScript, Vite |
| Styling | TailwindCSS v4 |
| Charts | Recharts |
| HTTP | Axios |
