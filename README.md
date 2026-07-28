# HomeValuator: AI-Powered House Price Prediction Platform

HomeValuator is a production-grade, responsive PropTech web application designed to estimate residential property valuations in Ames, Iowa using Explainable Machine Learning (XAI). The application features dynamic financial simulators, multi-model algorithms, interactive waterfall charts, batch CSV prediction returns, history logs, analytics dashboards, and administrative retraining services.

---

## 🚀 Key Features

*   **Multi-Step Valuation Form:** Interactive slider and pill selection covering area, interior specs, and building qualities, with an **Advanced Specifications Accordion** for optional overrides (plot frontage, masonry veneer area, deck size, pool size).
*   **AI Valuation Waterfall Chart:** A horizontal waterfall chart that stacks game-theory contributions (**SHAP values**) above or below the Ames baseline market price (~$181k) to explain prediction drivers in real time.
*   **Live Valuation Sandbox:** Quick-sliders on the results page to dynamically adjust living area, garage spaces, or quality, re-triggering estimation requests instantly.
*   **Interactive Financial Calculators:**
    *   **Mortgage EMI Calculator:** Sliders for down payment percentages, interest rates, and loan terms (15 vs 30 yrs fixed).
    *   **Rental Yield Simulator:** Sliders for customized monthly rents and operating costs (property tax, maintenance) computing net monthly cashflow and Cap Rate.
*   **Property Comparison:** Side-by-side comparison matrix of up to 3 saved properties.
*   **Batch CSV Valuations:** Drop-zone that accepts a property CSV file and instantly processes and downloads prediction-enriched CSV datasets.
*   **Valuation History & PDF Reports:** User prediction logs with full text search and detailed PDF valuation report generation (utilizing `fpdf2`).
*   **Analytics Dashboard:** Visual aggregations of pricing distributions, quality-price trends, top neighborhoods, and model feature importances.
*   **Administrative Model Re-training:** Admin dropper to upload new transaction CSVs and trigger background re-fitting and cross-validation logs.

---

## 🛠️ Technology Stack

*   **Backend:** Python 3.13, FastAPI (ASGI Web Services), SQLAlchemy ORM, Uvicorn, Pandas, Scikit-Learn 1.6.1, SHAP (Explainable AI), fpdf2 (PDF Generation).
*   **Database:** SQLite (local development zero-config db) / support for PostgreSQL connection strings.
*   **Frontend:** React, Vite (Asset Bundler), TypeScript, Tailwind CSS v4, Recharts, Framer Motion, Lucide Icons.

---

## 📂 Project Architecture

*   **[backend/](file:///d:/Git-Hub%20projects/House%20price%20pridiction/backend)** - Core python services.
    *   **[database.py](file:///d:/Git-Hub%20projects/House%20price%20pridiction/backend/database.py)**: Engine configurations and database session initializers.
    *   **[models.py](file:///d:/Git-Hub%20projects/House%20price%20pridiction/backend/models.py)**: SQLAlchemy models for users and predictions.
    *   **[schemas.py](file:///d:/Git-Hub%20projects/House%20price%20pridiction/backend/schemas.py)**: Pydantic schemas validating input structures and API responses.
    *   **[auth_utils.py](file:///d:/Git-Hub%20projects/House%20price%20pridiction/backend/auth_utils.py)**: Cryptographic password hashing (PBKDF2) and JWT token operations.
    *   **[ml_engine.py](file:///d:/Git-Hub%20projects/House%20price%20pridiction/backend/ml_engine.py)**: Scikit-learn estimator ingestion, SHAP TreeExplainer mappings, and investment calculations.
    *   **[pdf_generator.py](file:///d:/Git-Hub%20projects/House%20price%20pridiction/backend/pdf_generator.py)**: PDF valuation report compiler.
    *   **[main.py](file:///d:/Git-Hub%20projects/House%20price%20pridiction/backend/main.py)**: FastAPI endpoints, CORS bindings, and routes definitions.
    *   **[test_api.py](file:///d:/Git-Hub%20projects/House%20price%20pridiction/backend/test_api.py)**: Automated API integration test suite.
*   **[frontend/](file:///d:/Git-Hub%20projects/House%20price%20pridiction/frontend)** - React/Vite single-page application.
    *   **[src/api.ts](file:///d:/Git-Hub%20projects/House%20price%20pridiction/frontend/src/api.ts)**: Typing interfaces and client request functions mapping FastAPI endpoints.
    *   **[src/App.tsx](file:///d:/Git-Hub%20projects/House%20price%20pridiction/frontend/src/App.tsx)**: Main dashboard components and layouts.
    *   **[src/index.css](file:///d:/Git-Hub%20projects/House%20price%20pridiction/frontend/src/index.css)**: Tailwind v4 import guidelines, typography, scrollbars, and card styling.

---

## 💻 Installation & Setup

### 1. Run the Backend Server
1. Navigate to the root directory and activate the python virtual environment:
   ```powershell
   .venv\Scripts\activate
   ```
2. Start the FastAPI uvicorn server on port `8000`:
   ```powershell
   uvicorn backend.main:app --reload --port 8000
   ```
   *(API documentation is hosted at `http://127.0.0.1:8000/docs`)*

### 2. Run the Frontend Server
1. Open a new terminal and navigate to the `frontend/` folder:
   ```powershell
   cd frontend
   ```
2. Start the Vite dev server:
   ```powershell
   npm run dev
   ```
3. Open `http://localhost:5173` in your web browser.

---

## 🧪 Running Integration Tests

To run the automated integration tests and check all backend endpoints, activate the python environment and run:
```powershell
.venv\Scripts\python.exe backend/test_api.py
```
