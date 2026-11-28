# 🌿 BreatheWise — Urban Air Quality Assistant

### PromptWars Virtual Hackathon — [Challenge 6] Urban Air Quality Assistant

> **"Create a GenAI-powered assistant that helps families and communities navigate severe winter smog and urban air pollution. The application should suggest low-emission daily routines, indoor air quality hacks, and sustainable alternatives tailored to their location and lifestyle, while clearly explaining the direct impact of their choices."**

![BreatheWise Dashboard Presentation](docs/assets/thumbnail.jpg)

[![CI / CD Pipeline](https://github.com/kushal3698/BreatheWise-Air-Quality-Assistance/actions/workflows/ci.yml/badge.svg)](https://github.com/kushal3698/BreatheWise-Air-Quality-Assistance/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/Production-Vercel%20Live-black?style=for-the-badge&logo=vercel&logoColor=white)](https://breathewise-nine.vercel.app/)
[![Tests Passing](https://img.shields.io/badge/Tests-135%20Passed-success?style=for-the-badge)](backend/tests)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA--aligned-purple?style=for-the-badge)](frontend/src/__tests__/a11y.test.ts)
[![Security](https://img.shields.io/badge/Security-Headers%20%2B%20Rate%20Limiting-red?style=for-the-badge)](SECURITY.md)

---

### ⚡ Quick Requirement Mapping
- **Low-Emission Routines** $\rightarrow$ Daily Action Plan Card 1 (`PlanCard.tsx`) & Diurnal Forecast (`SafeWindows.tsx`).
- **Indoor Air Quality Hacks** $\rightarrow$ Daily Action Plan Card 2 (`PlanCard.tsx`) & RAG Knowledge Base (`indoor_air_quality.md`).
- **Sustainable Alternatives** $\rightarrow$ Household Drawer (`HouseholdSelector.tsx`) & Transit Whitelist (`initialData.ts`).
- **Direct Impact Explained** $\rightarrow$ Quantified Impact Engine (`ImpactBar.tsx`) with transparent "Why this matters" rationales.

---

## 📌 Contents

- [🎯 Challenge 6 Requirement Traceability Matrix](#-challenge-6-requirement-traceability-matrix)
- [🌍 Overview & Problem Statement](#-overview--problem-statement)
- [❄️ Winter Smog Playbook](#️-winter-smog-playbook)
- [📸 Application Screenshots](#-application-screenshots)
- [✨ Key Features](#-key-features)
- [🏗️ System Architecture](#️-system-architecture)
- [📁 Repository Structure](#-repository-structure)
- [⚡ Quick Start & Deployment](#-quick-start--deployment)
- [📡 API Reference](#-api-reference)
- [📄 Sample API Plan Response](#-sample-api-plan-response)
- [⚙️ Environment Variables & Config](#️-environment-variables--config)
- [🧮 Mathematical Engine & CPCB Breakpoints](#-mathematical-engine--cpcb-breakpoints)
- [📡 Data Sources & Limitations](#-data-sources--limitations)
- [🧪 Automated Testing & CI/CD](#-automated-testing--cicd)
- [♿ Accessibility (WCAG 2.1 AA)](#-accessibility-wcag-21-aa)
- [🔒 Security & Threat Modeling](#-security--threat-modeling)
- [🛡️ Responsible AI & Medical Safeguards](#️-responsible-ai--medical-safeguards)
- [📄 License](#-license)

---

## 🎯 Challenge 6 Requirement Traceability Matrix

Each clause of the official Challenge 6 brief is mapped to the code that implements it:

| Challenge 6 Requirement | Implementation Module | Source File(s) | Verification & Evidence |
|:---|:---|:---|:---|
| **GenAI-Powered Assistant** | Multi-lingual RAG-grounded conversational agent with document citations and localized context | `frontend/src/components/ChatAssistant.tsx`<br>`backend/app/routers/chat.py`<br>`backend/app/services/llm/` | Natural conversational interface in **English, Hindi, Telugu, and Tamil**. Answers user queries with domain grounding (`indoor_air_quality.md`, `vulnerable_groups.md`) and non-medical disclaimers. Live Vercel deployment runs live Gemini (`GEMINI_MODEL`, `DEMO_MODE=false`) with automatic rule-based fallback. |
| **Helps Families Navigate Winter Smog** | Household Profiling Engine with sensitive-member tracking & tailored cautions | `frontend/src/components/HouseholdSelector.tsx`<br>`backend/app/services/safety.py`<br>`backend/app/models/schemas.py` | Configurable family profiles: track children, seniors, and respiratory sensitivities (asthma, COPD). Two caution triggers: (1) an inhaler caution is always shown when a household member has asthma/COPD, regardless of AQI; (2) a general air-quality caution is added when AQI reaches an unhealthy category (Poor or worse). |
| **Helps Communities Navigate Smog** | School Guidance Protocols & Neighborhood Community Challenges with real-time feedback | `frontend/src/components/SchoolView.tsx`<br>`frontend/src/components/CommunityView.tsx`<br>`backend/app/routers/school.py`<br>`backend/app/routers/community.py` | Operational protocols for morning assembly, sports PE, and recess ventilation. Neighborhood leaderboards with car-free challenges and cumulative community CO₂ counters. |
| **Suggests Low-Emission Daily Routines** | Dynamic Daily Action Planner with diurnal curve synchronization | `frontend/src/components/PlanCard.tsx`<br>`backend/app/routers/plan.py`<br>`backend/app/services/air_quality.py` | Recommends optimal exercise windows (shifting from morning inversion to afternoon thermal mixing), work-from-home coordination, and trip consolidation. |
| **Indoor Air Quality Hacks** | Actionable, zero-cost and low-cost indoor mitigation techniques | `frontend/src/components/PlanCard.tsx`<br>`backend/knowledge_base/indoor_air_quality.md` | Wet mopping over sweeping, DIY Corsi-Rosenthal filtration boxes, window sealing during smog peaks, timed ventilation during afternoon dips, and kitchen exhaust protocols. |
| **Sustainable Alternatives Tailored to Location & Lifestyle** | Location-aware multi-modal transit and lifestyle alternatives | `frontend/src/components/HouseholdSelector.tsx`<br>`frontend/src/lib/initialData.ts`<br>`backend/app/services/geocoding.py` | Metro-aware transit switches: recommends **bus/metro** in metro cities, and **public bus/shared electric shuttles** in non-metro cities (e.g. Guntur, Vijayawada). Tailored to vehicle fuel type, floor level, and cooking fuel. |
| **Clearly Explaining Direct Impact of Choices** | Deterministic & Interactive Direct Impact Simulator with Before-vs-After comparison | `frontend/src/components/ImpactBar.tsx`<br>`frontend/src/components/PlanCard.tsx`<br>`frontend/src/lib/impactSimulator.ts`<br>`backend/app/services/impact.py`<br>`backend/config/emission_factors.json` | Interactive action-toggle simulation dynamically updating **Exposure Avoided %**, **CO₂ Avoided (kg/week)**, **Cost Saved (₹/month)**, and **Cigarette Equivalents Avoided** (~22 µg/m³ PM2.5 / 24h ≈ 1 cigarette). |

---

## 🌍 Overview & Problem Statement

Urban air pollution across Indian cities—especially during severe winter temperature inversions—poses acute health hazards. However, conventional air quality dashboards only present static numbers without contextualizing what families should actually do.

**BreatheWise** is an intelligent, GenAI-powered urban companion that transforms real-time and modelled environmental telemetry into actionable, daily lifestyle decisions:
1. **Decision Support**: Clear answers to *"When should I exercise?"*, *"Can my child play outside today?"*, and *"How do I keep indoor air clean?"*
2. **Demographic Tailoring**: Automatically adapts recommendations based on family members (children, seniors, asthmatic individuals) and living situations (apartment floor, cooking fuel).
3. **Transparent Mathematical Proof**: Quantifies the environmental and economic impact of each choice with deterministic calculations.

---

## ❄️ Winter Smog Playbook

The brief asks for help during **severe winter smog**. BreatheWise treats winter as a specific, time-of-day problem and maps each cause to a feature.

### Why winter air is worse
- **Temperature inversion:** Cold ground-level air is trapped under a warmer layer, so pollutants stay near the surface, especially from night until late morning.
- **Low wind and fog:** Calm, humid mornings keep particulates suspended.
- **Extra sources in the cold season:** Open burning of leaves, waste and crop residue (mainly in north India), biomass heating and cooking, and festival emissions.
- **Regional variation:** Inversion and burning episodes are most severe in the Indo-Gangetic Plain (e.g. Delhi, Lucknow, Patna). BreatheWise tailors advice dynamically to local forecast telemetry across all Indian cities, rather than assuming a uniform seasonal baseline.

### How each cause maps to a feature
| Winter problem | BreatheWise response | Where |
|:---|:---|:---|
| Morning inversion peak | Diurnal curve shows the morning peak; plan advises keeping intense cardio indoors until air improves | `ForecastChart.tsx`, `PlanCard.tsx` |
| Cleaner afternoon window | Safe Windows derived from the afternoon thermal-mixing dip | `SafeWindows.tsx` |
| Polluted air getting indoors | Seal windows at the morning peak, ventilate in the safe window, run a HEPA purifier or DIY Corsi-Rosenthal box | Indoor Air Playbook |
| Open burning | Zero Open-Burning Vigilance community challenge | `CommunityView.tsx` |
| Vulnerable people | Asthma caution banner for sensitive members; school protocols for assembly, PE and recess | `safety.py`, `SchoolView.tsx` |

### Live 6-Pollutant Forecast & Offline Note
When running live (`DEMO_MODE=false`), Open-Meteo supplies real-time hourly 6-pollutant telemetry (`pm2_5`, `pm10`, `no2`, `so2`, `co`, `o3`) from which per-hour CPCB sub-indices and Safe Windows are computed directly. When offline or in `DEMO_MODE=true`, the 24-hour curve uses a **modelled diurnal shape** calibrated to each city. See [Data Sources & Limitations](#-data-sources--limitations).

---

## 📸 Application Screenshots

| Live Air Dashboard (CPCB NAQI 345 Very Poor) | Dynamic Daily Action Plan (Tailored Mitigations) |
|:---:|:---:|
| ![Live Air Dashboard](docs/assets/dashboard.png) | ![Daily Action Plan](docs/assets/plan.png) |
| *Real-time CPCB NAQI calculation with dominant pollutant PM2.5 (345), WHO exceedance benchmarks, and meteorological telemetry.* | *Personalized winter smog mitigation plan with diurnal safe window, asthma alerts, structured action cards, and quantified impact.* |

---

## ✨ Key Features

### 1. 📊 Official CPCB NAQI Dial & Diurnal Forecast
- **CPCB-Standard Formula**: Headline AQI computed as the strict maximum across pollutant sub-indices ($\max(I_{\text{PM2.5}}, I_{\text{PM10}}, I_{\text{NO2}}, \dots)$).
- **Synchronized Visual Feedback**: A single source of truth (`getAQIBand`) simultaneously controls the category badge, color accent, and active segment highlight on the 6-band CPCB gauge (**Good**, **Satisfactory**, **Moderate**, **Poor**, **Very Poor**, **Severe**).
- **Dominant Pollutant Callout**: Instantly surfaces the primary health driver (e.g. `Dominant pollutant: PM2.5 • Sub-index: ~345`).
- **Benchmark Indicators**: Displays both **India NAAQS** and **WHO 2021** reference thresholds with real-time exceedance multipliers.
- **Realistic Diurnal Inversion Curve**: 24-hour forecast sampled at strictly even 2-hour increments (`00:00, 02:00, ..., 22:00`) illustrating natural atmospheric physics: morning inversion peak (08:00), afternoon thermal dispersion dip (14:00), and evening traffic peak (20:00).
- **Mathematically Derived Safe Windows**: Highlights optimal outdoor exposure windows matching the afternoon thermal mixing dip.

### 2. 🧠 GenAI Assistant & RAG Knowledge Base
- **Multi-Lingual NLP**: Full conversational support in **English**, **हिन्दी (Hindi)**, **తెలుగు (Telugu)**, and **தமிழ் (Tamil)**.
- **RAG-Grounded**: Responses retrieve facts from verified environmental health guides (`indoor_air_quality.md`, `exercise_and_aqi.md`, `vulnerable_groups.md`, `masks_and_ppe.md`, `sustainable_transport.md`, `school_and_community.md`).
- **Explainable Reasoning**: Every recommendation includes a plain-language **Why**, verified sources, and confidence classification.

### 3. 🏠 Household Personalization Drawer
- **Vulnerable Group Tagging**: Add household members with specific respiratory sensitivities (asthma, COPD).
- **Synchronized Sensitivity Badges**: Visual chips persist across dashboard and plan views.
- **Lifestyle & Housing Config**: Set transport modes (petrol car, diesel, EV, two-wheeler), commute distances, floor level, air purifier status, and cooking fuel.

### 4. 🧮 Deterministic Impact Engine
- **No Hallucinated Statistics**: All environmental and financial savings are calculated using deterministic formulas from official emission factors (`backend/config/emission_factors.json`):
  - **Exposure Reduction %**: Indoor filtration and activity shifting.
  - **CO₂ Avoided (kg/week)**: Multi-modal transport replacement.
  - **Fuel Cost Saved (₹/month)**: Commute fuel vs. public transit tariffs.
  - **Cigarette Equivalents Avoided**: Public health awareness metric ($\approx 22\ \mu\text{g/m}^3\ \text{PM2.5 over 24h} \approx 1\ \text{cigarette}$).

### 5. 👥 Community Challenges & 🏫 School Advisory Protocols
- **School Guidance Dashboard**: Automatic threshold-based operational advisories for school administrators (morning assemblies, PE, playground recess, classroom ventilation, and asthmatic student safeguards).
- **Community Challenges**: Car-free days, cycling commutes, and DIY filtration challenges with instant feedback toasts and neighborhood leaderboards.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client["🖥️ Client Layer (Next.js 14 + Tailwind CSS)"]
        UI["Web Dashboard (Desktop / Mobile)"]
        NAV["Navbar & Autocomplete City Search"]
        A11Y["WCAG 2.1 AA Semantic Landmarks & ARIA Tabs"]
        I18N["Multi-Language Engine (EN, HI, TE, TA)"]
    end

    subgraph Serverless["⚡ Next.js API Routes (Vercel Production)"]
        ROUTE_AQI["/api/aqi (City Telemetry & CPCB Math)"]
        ROUTE_PLAN["/api/plan (Personalized Daily Plan)"]
        ROUTE_CHAT["/api/chat (Sanitized AI Proxy)"]
        ROUTE_COMM["/api/community/* (Challenges & Leaderboard)"]
    end

    subgraph Backend["🐍 FastAPI Backend (Python 3.11+)"]
        API_GW["FastAPI Core with Security Headers & Rate Limiting"]
        AQ_SVC["Air Quality & Diurnal Forecaster"]
        RAG_SVC["RAG Document Retriever (TF-IDF / Vector)"]
        IMPACT_SVC["Deterministic Impact Calculator"]
        SAFETY_SVC["Responsible AI & Medical Guardrails"]
        LLM_SVC["Gemini (configurable via GEMINI_MODEL) / Demo Fallback"]
    end

    subgraph Data["📂 Data & Knowledge Bases"]
        KB["Markdown Health Guides (indoor_air, masks, exercise)"]
        EMISSIONS["emission_factors.json & exposure_assumptions.json"]
        GEO["30+ Pre-Calibrated Indian Cities Database"]
    end

    UI --> NAV --> ROUTE_AQI & ROUTE_PLAN & ROUTE_CHAT & ROUTE_COMM
    Serverless -. "Optional Proxy (INTERNAL_API_URL) / Serverless Fallback" .-> API_GW
    API_GW --> AQ_SVC & IMPACT_SVC & SAFETY_SVC & RAG_SVC
    RAG_SVC --> LLM_SVC
    AQ_SVC --> GEO
    IMPACT_SVC --> EMISSIONS
    RAG_SVC --> KB
```

> **Live Deployment Note:** On the live Vercel deployment (`https://breathewise-nine.vercel.app`, with `DEMO_MODE=false` and `GEMINI_API_KEY` configured), `/api/aqi` serves live 6-pollutant Open-Meteo hourly dispersion forecasts, and `/api/chat` and `/api/plan` invoke live Gemini (`GEMINI_MODEL`, defaulting to `gemini-3.5-flash` with Flash fallback) via Next.js serverless routes while enforcing deterministic `impact_summary` figures and medical cautions. When `DEMO_MODE=true` or an upstream API is unavailable, routes fall back seamlessly to pre-calibrated telemetry and the grounded rule-based engine. Setting `INTERNAL_API_URL` optionally proxies `/api/*` to the standalone FastAPI service (`https://backend-virid-omega-y3vu6py2nl.vercel.app`), Docker, or local Python dev.

---

## 📁 Repository Structure

```
BreatheWise-Air-Quality-Assistance/
├── .github/
│   └── workflows/
│       └── ci.yml                   # Automated GitHub Actions CI (Frontend, Backend & Secret Scanning)
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI wiring, CORS, global exception handler & prod docs gate
│   │   ├── config.py                # Validated settings, Redis URL & KB path resolution
│   │   ├── middleware/
│   │   │   └── security.py          # OWASP headers, Server strip, Redis/memory sliding rate limiter
│   │   ├── routers/
│   │   │   ├── aqi.py               # GET  /api/aqi (CPCB telemetry & forecast)
│   │   │   ├── plan.py              # POST /api/plan (Household daily action plan)
│   │   │   ├── chat.py              # POST /api/chat (RAG conversational agent)
│   │   │   ├── impact.py            # GET  /api/impact/summary (Deterministic metrics)
│   │   │   ├── school.py            # GET  /api/school/guidance (Campus protocols)
│   │   │   └── community.py         # GET  /api/community/* (Leaderboard & challenges)
│   │   ├── services/
│   │   │   ├── air_quality.py       # Modular facade over CPCB, diurnal forecaster & Open-Meteo client
│   │   │   ├── cpcb_math.py         # Pure deterministic CPCB NAQI sub-index & category calculations
│   │   │   ├── diurnal_forecaster.py# 6-pollutant hourly Open-Meteo parser & safe window derivation
│   │   │   ├── open_meteo_client.py # Async Open-Meteo 6-pollutant + weather client & TTL cache
│   │   │   ├── geocoding.py         # 30+ pre-calibrated Indian cities & geocoding
│   │   │   ├── impact.py            # Mathematical exposure, CO2, and INR calculator
│   │   │   ├── rag.py               # Path-safe knowledge base retrieval & document indexing
│   │   │   ├── safety.py            # Medical disclaimer & asthma safety rules
│   │   │   └── llm/                 # Gemini (prompt-bounded, GEMINI_MODEL) & Demo providers
│   │   └── models/schemas.py        # Strict Pydantic v2 models (extra="forbid", Unicode city sanitizer)
│   ├── knowledge_base/              # Curated evidence-based environmental health guides
│   ├── config/                      # emission_factors.json, exposure_assumptions.json, plan_templates.json
│   ├── pyproject.toml               # Ruff (C901 complexity + S security), Black & Mypy --strict config
│   ├── tests/                       # Pytest suite (76 tests across routers, services, security, guardrails & parity)
│   └── requirements.txt             # Python dependencies
├── frontend/
│   ├── e2e/                         # Playwright E2E + Axe WCAG 2.1 AA core flow spec
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # Root HTML layout with skip-to-content anchor
│   │   │   ├── page.tsx             # Modular dashboard shell (<300 lines) with custom hooks
│   │   │   ├── globals.css          # Tailwind directives
│   │   │   └── api/                 # Next.js Serverless API routes (live Open-Meteo & Gemini w/ fallback)
│   │   ├── data/                    # Externalized JSON configs (cities.json, locales.json, emissionFactors.json)
│   │   ├── components/
│   │   │   ├── dashboard/           # DashboardTabs with ARIA Left/Right/Home/End key navigation
│   │   │   ├── Navbar.tsx           # Top navigation shell
│   │   │   ├── navbar/              # CitySearchAutocomplete, CityToastBanner, LanguageSwitcher, MobileCityBar
│   │   │   ├── Footer.tsx           # Extracted accessible disclaimer footer
│   │   │   ├── RiskMeter.tsx        # Modular 6-band CPCB gauge
│   │   │   ├── risk-meter/          # Decomposed sub-components (AQIBandScale, PollutantGrid)
│   │   │   ├── SafeWindows.tsx      # Diurnal safe window cards with thermal mixing rationale
│   │   │   ├── ForecastChart.tsx    # 24-hr CPCB AQI diurnal chart with 2h tick intervals
│   │   │   ├── PlanCard.tsx         # Interactive Direct Impact 3-section daily action plan
│   │   │   ├── ImpactBar.tsx        # Live before vs. after exposure & savings simulator bar
│   │   │   ├── ChatAssistant.tsx    # Conversational GenAI assistant
│   │   │   ├── HouseholdSelector.tsx# Profile card shell
│   │   │   ├── household/           # MemberSensitivityList, CommuteHomeSettings & accessible HouseholdModal
│   │   │   ├── SchoolView.tsx       # Campus advisory protocol dashboard
│   │   │   ├── CommunityView.tsx    # Neighborhood challenges & leaderboard shell
│   │   │   └── community/           # ChallengeCard & accessible LeaderboardTable
│   │   ├── hooks/                   # Extracted state hooks with race-condition guards
│   │   ├── lib/
│   │   │   ├── cpcb.ts              # Mathematical CPCB NAQI calculation engine
│   │   │   ├── cities.ts            # Typed loader over data/cities.json
│   │   │   ├── impactSimulator.ts   # Cross-stack synced & interactive Direct Impact calculator
│   │   │   ├── presetPlan.ts        # Pre-calibrated plans & mandatory safety cautions
│   │   │   ├── communityData.ts     # Neighborhood challenges and leaderboard state
│   │   │   ├── feedback.ts          # Audio/haptic interaction feedback utility
│   │   │   ├── sanitize.ts          # Unicode-safe city & chat input sanitization
│   │   │   ├── logger.ts            # Environment-aware client logging utility
│   │   │   ├── initialData.ts       # Backward-compatible barrel re-export
│   │   │   ├── api.ts               # Sanitized AbortController-timeout API client
│   │   │   └── i18n.ts              # Typed loader over data/locales.json (EN, HI, TE, TA)
│   │   └── __tests__/               # Vitest suite (59 tests across app, a11y, parity, routes; 97% coverage)
│   ├── next.config.js               # OWASP CSP headers & conditional INTERNAL_API_URL proxy
│   ├── playwright.config.ts         # Playwright Chromium configuration
│   ├── tsconfig.json                # Strict TS (noUncheckedIndexedAccess + noUnusedLocals)
│   ├── package.json                 # Next.js 14 & dependencies
│   └── tailwind.config.js           # Tailwind CSS configuration
├── tests/
│   └── fixtures/
│       ├── cpcb_cases.json          # Shared golden dataset for cross-stack CPCB verification
│       └── plan_impact_cases.json   # Shared golden dataset for cross-stack impact & safety parity
├── scripts/                         # Portable environment-independent utility scripts
├── docs/assets/
│   ├── dashboard.png                # Desktop dashboard screenshot
│   ├── plan.png                     # Daily action plan screenshot
│   └── thumbnail.jpg                # 16:9 Presentation thumbnail
├── ARCHITECTURE.md                  # System architecture, cross-stack design, and decoupling
├── Makefile                         # Cross-platform dev, lint, typecheck, test & Docker targets
├── docker-compose.yml               # Redis + FastAPI + Next.js stack with healthchecks
├── run_all.bat                      # Unified Windows launcher shim
├── run_backend.bat                  # Dedicated FastAPI backend launcher shim
├── run_frontend.bat                 # Dedicated Next.js frontend launcher shim
├── .env.example                     # Environment template (zero committed secrets)
├── CONTRIBUTING.md                  # Code style, testing, and contribution guide
├── SECURITY.md                      # Formal security policy & threat model
├── LICENSE                          # MIT License
└── README.md                        # Documentation & requirement matrix
```

---

## ⚡ Quick Start & Deployment

### 1. Unified Launch (Windows)
```powershell
# Double-click or run from terminal:
.\run_all.bat
```
Starts both the FastAPI backend and Next.js frontend and opens `http://localhost:3000` in your browser.

### 2. Manual Terminal Setup

```bash
# 1. Initialize environment variables from template (once at repository root)
cp .env.example .env
```

#### Backend Setup
```bash
cd backend
python -m venv .venv
# Windows: .\.venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
*Interactive Swagger documentation: [http://localhost:8000/docs](http://localhost:8000/docs)*

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Application interface: [http://localhost:3000](http://localhost:3000)*

### 3. Vercel Production Deployment
The frontend is optimized for zero-configuration deployment to **Vercel**:
1. Connect the repository at [vercel.com](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Framework preset will automatically configure **Next.js**.
4. Click **Deploy**. Complete telemetry operates immediately via serverless routes.

---

## 📡 API Reference

| Method | Endpoint | Description |
|:---:|---|---|
| **GET** | `/api/aqi?city={name}` | Returns official CPCB AQI, sub-indices, dominant pollutant, 24-hr diurnal forecast, and safe windows. |
| **POST** | `/api/plan` | Generates a 3-section personalized daily action plan with before-vs-after impact metrics grounded in household profile. |
| **POST** | `/api/chat` | RAG-grounded conversational agent with sanitized inputs and source citations. |
| **GET** | `/api/impact/summary` | Aggregated environmental and financial savings metrics. |
| **GET** | `/api/school/guidance?city={name}` | School operational protocols for assemblies, PE, recess, and asthmatic students. |
| **GET** | `/api/community/leaderboard` | Neighborhood leaderboards and active community challenges. |

---

## 📄 Sample API Plan Response

`POST /api/plan` returns a structured schema combining actionable routines with deterministic impact:

```json
{
  "summary": "Elevated Very Poor smog today in Delhi (NCR) (AQI 345). Ground inversion traps morning emissions; shift cardio indoors and use the afternoon safe window (13:30 – 16:30).",
  "risk_level": "high",
  "sections": {
    "low_emission_routines": [
      {
        "action": "Schedule outdoor exercise during the afternoon safe window (13:30 – 16:30)",
        "why": "Between 06:00 and 09:30 AM, AQI peaks near ~390 during ground inversion. Morning cardio increases fine particle alveolar intake.",
        "effort": "low",
        "cost": "free",
        "impact": { "exposure_reduction_pct": 55.0, "confidence": "Modelled estimate" },
        "sources": ["kb/exercise_and_aqi.md"]
      },
      {
        "action": "Shift peak commute (8–10 AM) to Metro or carpool",
        "why": "Avoids concentrated tailpipe exhaust in traffic congestion; switching from single-occupancy petrol car (170g CO2/km) to metro (14g CO2/km) cuts transit emissions by ~92% per commute kilometer.",
        "effort": "medium",
        "cost": "free",
        "impact": { "exposure_reduction_pct": 35.0, "co2_saved_kg": 2.3, "cost_saved_inr": 110.0, "confidence": "Modelled estimate" },
        "sources": ["kb/sustainable_transport.md"]
      }
    ],
    "indoor_air_hacks": [
      {
        "action": "Keep windows shut during morning peak; cross-ventilate during 13:30 – 16:30",
        "why": "Afternoon solar convection breaks the inversion layer, dropping PM2.5 to the daily low.",
        "effort": "low",
        "cost": "free",
        "impact": { "exposure_reduction_pct": 35.0, "confidence": "Modelled estimate" },
        "sources": ["kb/indoor_air_quality.md"]
      }
    ],
    "sustainable_alternatives": [
      {
        "action": "Batch grocery and errand trips across Delhi (NCR) during the safe window",
        "why": "Reduces cold-start engine emissions and lowers weekly fuel burn.",
        "effort": "low",
        "cost": "free",
        "impact": { "exposure_reduction_pct": 15.0, "co2_saved_kg": 1.2, "cost_saved_inr": 50.0, "confidence": "Modelled estimate" },
        "sources": ["kb/sustainable_transport.md"]
      }
    ]
  },
  "today_timeline": [
    { "time": "06:00 - 09:30", "advice": "Very Poor morning peak. Ground inversion traps traffic exhaust; keep all exercise indoors." },
    { "time": "13:30 – 16:30", "advice": "Optimal safe window today. Afternoon solar convection disperses surface pollutants." }
  ],
  "impact_summary": {
    "exposure_reduction_pct": 42.0,
    "co2_avoided_kg_week": 8.5,
    "cost_saved_inr_month": 1850.0,
    "cigarettes_avoided_day": 3.4,
    "confidence": "Modelled estimate"
  },
  "cautions": [
    "One or more household members have respiratory sensitivities (asthma/COPD): Keep prescribed fast-acting reliever inhalers within immediate reach."
  ],
  "disclaimer": "Estimates for awareness only. BreatheWise is a decision-support tool, not a medical device."
}
```

> **Units Note:** Action items reflect immediate single-event savings (₹110/commute, ₹50/errand), scaled to monthly totals in the overall impact summary.

---

## ⚙️ Environment Variables & Config

All environment variables have sensible defaults and fallback to complete offline operation:

| Variable | Default | Purpose |
|:---|:---|:---|
| `DEMO_MODE` | `false` in code; `true` in the root `.env.example` | When `true`, uses offline pre-calibrated telemetry and the rule-based assistant, even if `GEMINI_API_KEY` is set. Set to `false` for live Open-Meteo data and Gemini. |
| `DEFAULT_CITY` | `Delhi` | Fallback city on initial launch. |
| `LLM_PROVIDER` | `gemini` | `gemini` or `demo` (rule-based fallback). If the model call fails, the assistant falls back to the rule-based provider. |
| `GEMINI_API_KEY` | `""` | Optional Google AI Studio API key for conversational chat. |
| `GEMINI_MODEL` | `gemini-3.5-flash` | Configurable via `GEMINI_MODEL` (e.g. `gemini-3.5-flash`). |
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Whitelisted cross-origin request sources. |
| `RATE_LIMIT_RPM` | `120` | Maximum requests permitted per minute per client IP. |

---

## 🧮 Mathematical Engine & CPCB Breakpoints

### Official CPCB NAQI Formulation
In strict compliance with Central Pollution Control Board (CPCB) standards, NAQI is evaluated as the maximum sub-index across all monitored pollutants:
$$I_{\text{AQI}} = \max\left(I_{\text{PM2.5}},\, I_{\text{PM10}},\, I_{\text{NO2}},\, I_{\text{SO2}},\, I_{\text{CO}},\, I_{\text{O3}}\right)$$

Each pollutant sub-index $I_p$ is calculated using linear piecewise interpolation:
$$I_p = I_{\text{lo}} + \frac{I_{\text{hi}} - I_{\text{lo}}}{B_{\text{hi}} - B_{\text{lo}}} \times (C_p - B_{\text{lo}})$$

#### CPCB Official Breakpoints:
- **$\text{PM}_{2.5}$**:
  - $0\text{–}30 \rightarrow 0\text{–}50$ (Good)
  - $31\text{–}60 \rightarrow 51\text{–}100$ (Satisfactory)
  - $61\text{–}90 \rightarrow 101\text{–}200$ (Moderate)
  - $91\text{–}120 \rightarrow 201\text{–}300$ (Poor)
  - $121\text{–}250 \rightarrow 301\text{–}400$ (Very Poor)
  - $250.1\text{–}380 \rightarrow 401\text{–}500$ (Severe; 380 is an interpolation cap, CPCB defines Severe as 250+)
- **$\text{PM}_{10}$**:
  - $0\text{–}50 \rightarrow 0\text{–}50$ (Good)
  - $51\text{–}100 \rightarrow 51\text{–}100$ (Satisfactory)
  - $101\text{–}250 \rightarrow 101\text{–}200$ (Moderate)
  - $251\text{–}350 \rightarrow 201\text{–}300$ (Poor)
  - $351\text{–}430 \rightarrow 301\text{–}400$ (Very Poor)
  - $430.1\text{–}600 \rightarrow 401\text{–}500$ (Severe; 600 is an interpolation cap, CPCB defines Severe as 430+)

#### Real-World Delhi Worked Example:
- **$\text{PM}_{2.5} = 178.4\ \mu\text{g/m}^3$**: Bin $[121, 250] \rightarrow [301, 400] \implies 301 + \frac{99}{129} \times (178.4 - 121) = \mathbf{345}$
- **$\text{PM}_{10} = 288.0\ \mu\text{g/m}^3$**: Bin $[251, 350] \rightarrow [201, 300] \implies 201 + \frac{99}{99} \times (288.0 - 251) = \mathbf{238}$
- **$\text{NO}_2 = 45.2\ \mu\text{g/m}^3$**: Bin $[41, 80] \rightarrow [51, 100] \implies 51 + \frac{49}{39} \times (45.2 - 41) = \mathbf{56}$
- **Final CPCB AQI**: $\max(345, 238, 56) = \mathbf{345\ (\text{Very Poor})}$ with **Dominant Pollutant: $\text{PM}_{2.5}$**.

---

## 📡 Data Sources & Limitations

### 1. Telemetry Transparency
- **Modelled Atmospheric Estimates**: Unless connected to an active CAAQMS physical station feed, telemetry is derived from atmospheric reanalysis models via Open-Meteo and procedural diurnal boundary layer modeling. The application prominently displays:
  > `● Modelled estimate • Regional estimate for {City} • Street level exposures vary with local traffic.`

### 2. CPCB Integer Rounding Protocol
Under official Indian Central Pollution Control Board reporting conventions, ambient sensor concentrations are evaluated against integer breakpoint bands:
- An observed $\text{PM}_{2.5}$ of $60.1\ \mu\text{g/m}^3$ rounds to $60\ \mu\text{g/m}^3$, which sits at the upper limit of the Satisfactory band ($31\text{–}60$), yielding an exact sub-index of **100**.
- An observed $\text{PM}_{10}$ of $118.3\ \mu\text{g/m}^3$ rounds to $118$ and falls in the Moderate bin $[101, 250] \rightarrow [101, 200]$, yielding a sub-index of **112**.
- The composite AQI is $\max(100, 112) = \mathbf{112\ (\text{Moderate})}$, with **Dominant Pollutant: $\text{PM}_{10}$**.

---

## 🧪 Automated Testing & CI/CD

BreatheWise maintains **135 unit & integration tests** (76 backend at 94% coverage, 59 frontend at 97% library/API coverage) plus an end-to-end Playwright + Axe accessibility spec integrated into GitHub Actions:

```bash
# Frontend Tests & Coverage (Vitest — 59 passed)
cd frontend
npm test -- --run --coverage

# Frontend E2E & Axe Accessibility (Playwright)
npm run build && npm run test:e2e

# Backend Tests & Strict Type/SAST Checks (Pytest — 76 passed)
cd backend
python -m mypy --strict app/ && python -m bandit -r app/ -ll && python -m pytest -v --cov=app --cov-fail-under=90 tests/
```

### GitHub Actions CI Workflow (`.github/workflows/ci.yml`)
- **`frontend-ci`**: Node 20, strict `npm ci`, `tsc --noEmit` (`noUncheckedIndexedAccess` + `noUnusedLocals`), ESLint, Vitest (`85%+` coverage floor), Next.js production build, and Playwright + `@axe-core/playwright` E2E verification.
- **`backend-ci`**: Python 3.11, Ruff (`C901` complexity + `S` security rules), Black formatting, `mypy --strict app/`, `bandit -r app/ -ll` SAST, `pip-audit`, and Pytest (`90%+` coverage floor).
- **`security-audit`**: Automated secret scanning (`gitleaks` + regex check) ensuring zero credentials exist in version control.

---

## ♿ Accessibility (WCAG 2.1 AA)

BreatheWise is designed for inclusive access:
- **Skip to Main Content**: Keyboard-accessible anchor (`#main-content`) allows screen reader and keyboard users to bypass navigation.
- **ARIA Semantics**: Proper `role="tablist"`, `role="tab"`, `aria-selected`, `role="status"`, `aria-live="polite"`, and `role="search"` attributes throughout.
- **Contrast Ratios**: Color palettes for all 6 CPCB bands are designed for WCAG 2.1 AA contrast standards with high-contrast text pairings.
- **Screen Reader Support**: Decorative icons feature `aria-hidden="true"`, while interactive inputs provide explicit `aria-label` tags.
- **Multi-Language Tagging**: Main content containers carry explicit `lang` attributes (`en`, `hi`, `te`, `ta`) so screen readers select correct voice engines.

---

## 🔒 Security & Threat Modeling

BreatheWise adheres to strict cybersecurity standards (see [SECURITY.md](SECURITY.md)):
- **HTTP Security Headers**: Enforces `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, strict `Content-Security-Policy`, and restrictive `Permissions-Policy` (with deprecated `X-XSS-Protection` removed and server banners stripped).
- **Sliding-Window Rate Limiting**: Enforces a 120 requests/minute ceiling per client IP (Redis-backed when `REDIS_URL` is configured, with automatic in-memory deque fallback) and `429 Too Many Requests` responses.
- **Multi-Lingual Input Sanitization & Prompt Hardening**: City parameters sanitize via `/[^\p{L}\p{M}\p{N}\s()\-.]/gu` and Python `unicodedata` (`L*`/`M*`/`N*`), preserving Latin, Devanagari, Telugu, and Tamil characters while neutralizing XSS. Chat payloads strip control chars, cap at 1,000 chars, reject extra Pydantic fields (`extra="forbid"`), and isolate queries inside `<user_query>` delimiters.
- **Stack Trace Suppression & Prod Docs Gate**: Generic 500 error handler prevents exposure of internal exception traces, and Swagger `/docs` disables when `APP_ENV=production`.
- **Knowledge Base Grounding**: Dedicated environmental health reference guides live in `backend/knowledge_base/*.md`, indexed safely with path-traversal validation (`is_relative_to`) in [rag.py](backend/app/services/rag.py).

---

## 🛡️ Responsible AI & Medical Safeguards

1. **Non-Medical Disclaimer**: BreatheWise is a decision-support and awareness platform, not a medical diagnosis device. Disclaimers are prominently displayed.
2. **Asthma & Vulnerability Triggers**: Two caution triggers: (1) an inhaler caution is always shown when a household member has asthma/COPD, regardless of AQI; (2) a general air-quality caution is added when AQI reaches an unhealthy category (Poor or worse, i.e. above 200). These guardrails are applied after every provider (rule-based or LLM) so a model can never omit them, and impact figures always come from the deterministic engine, never from model output.
3. **Deterministic Math**: Plan impact figures (exposure reduction, CO₂ avoided, fuel savings, cigarette equivalents) are strictly computed via deterministic mathematical engines rather than generated by LLMs to eliminate numerical hallucinations. Chat conversational replies are instructed to reference only verified supplied numbers.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
