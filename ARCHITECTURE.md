# 🏗️ BreatheWise — Architectural Design & Cross-Stack Parity

## 1. Overview & System Topology

BreatheWise is designed as a hybrid microservice and serverless system providing zero-latency urban air quality awareness and actionable low-emission decision support for Indian metropolitan areas.

```
+-------------------------------------------------------------------------------+
|                             Next.js 14 Web Client                             |
|  - Accessibility (WCAG 2.1 AA Semantic Landmarks, Skip Link, ARIA Tabs)      |
|  - State Management: Extracted Hooks (useAirQuality, useHousehold, usePlan)   |
|  - Multi-Lingual Engine (EN, HI, TE, TA)                                      |
+---------------------------------------+---------------------------------------+
                                        |
               +------------------------+------------------------+
               |                                                 |
               v (Serverless Deployment)                         v (Local / Container)
+---------------------------------------+       +---------------------------------------+
|        Vercel Serverless Layer        |       |        FastAPI Backend Service        |
|  - /api/aqi (City Telemetry)          |       |  - Port 8000 (Python 3.11+)           |
|  - /api/plan (Household Action Plan)  |       |  - Open-Meteo Async Telemetry Engine  |
|  - /api/chat (Sanitized AI Proxy)     |       |  - Deterministic Impact Engine        |
|  - /api/community/* (Civic APIs)      |       |  - RAG Retrieval & Clinical Guides    |
+---------------------------------------+       +---------------------------------------+
```

---

## 2. The Dual-Implementation Trade-Off (Python & TypeScript)

A key architectural design decision in BreatheWise is maintaining parallel implementations of the **Central Pollution Control Board (CPCB) NAQI mathematical engine** and **Plan Generation logic**:

1. **Python Implementation (`backend/app/services/air_quality.py`, `backend/app/services/impact.py`, `backend/app/services/llm/demo_llm.py`)**:
   - Powers the standalone REST API, containerized Docker deployment, CLI analysis workflows, and Python test suites.
   - Computes piecewise linear sub-indices, diurnal safe windows, and deterministic emission avoidance metrics.

2. **TypeScript Implementation (`frontend/src/lib/cpcb.ts`, `frontend/src/lib/presetPlan.ts`, `frontend/src/lib/cities.ts`)**:
   - Powers the zero-cold-start Next.js serverless deployment on Vercel (`/api/aqi`, `/api/plan`).
   - Enables instant client-side fallback rendering when disconnected or when backend network requests fail.

### Why Not Run a Monolithic Backend?
Deploying a separate containerized Python server for hackathon evaluation introduces network latency, cold-start delays on serverless platforms, and external infrastructure dependencies. The TypeScript port enables BreatheWise to run as a high-performance, standalone Vercel deployment while retaining full FastAPI compatibility.

---

## 3. Cross-Stack Parity Testing (`cpcb_cases.json`)

To prevent divergence between the Python and TypeScript engines, both implementations are validated against a shared golden test fixture:

- **Fixture Location**: [`tests/fixtures/cpcb_cases.json`](tests/fixtures/cpcb_cases.json)
- **Backend Test**: [`backend/tests/test_cpcb_parity.py`](backend/tests/test_cpcb_parity.py) (Pytest)
- **Frontend Test**: [`frontend/src/__tests__/cpcbParity.test.ts`](frontend/src/__tests__/cpcbParity.test.ts) (Vitest)

Both test suites load the exact same pollutant concentrations (Delhi smog episode, Bengaluru moderate baseline, coastal breeze, and exact breakpoint boundaries) and verify that:
1. Every individual sub-index matches ($I_{p}$).
2. The composite AQI matches ($\max(I_p)$).
3. The assigned CPCB category (Good, Satisfactory, Moderate, Poor, Very Poor, Severe) and dominant pollutant agree.

---

## 4. Frontend State & Component Architecture

To maintain high code quality and adhere to the project constraint that UI components remain single-purpose and under 300 lines of code:

- **Custom Hooks (`frontend/src/hooks/`)**:
  - `useAirQuality`: Manages city selection, real-time fetching, instant preset loading, and animated feedback toasts.
  - `useHousehold`: Manages family member demographics, respiratory sensitivity flags, transport modes, and purifier states.
  - `usePlan`: Handles diurnal action plan generation, structured fallback recovery, and background re-validation.
- **Decomposed Visual Components**:
  - `RiskMeter.tsx`: Core container decoupled into `AQIBandScale.tsx` (6-segment gauge) and `PollutantGrid.tsx` (pollutant benchmark cards).
  - `ForecastChart.tsx`: Diurnal 24-hour area chart with strictly formatted tooltips and two-hour tick intervals.
  - `Sanitizer Utility (`frontend/src/lib/sanitize.ts`)`: Centralized `sanitizeCity()` utility using a Unicode-aware regular expression (`/[^\p{L}\p{M}\p{N}\s()\-.]/gu`) shared across all API routes.

---

## 5. Security & Responsible AI Guardrails

1. **Security Headers**: Both FastAPI middleware and Next.js enforce HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and a strict `Permissions-Policy`.
2. **Deterministic Math Floor**: No life-safety or emissions metrics are generated via LLM text completion. All numerical values (exposure reduction, $\text{CO}_2$ saved, fuel costs avoided, cigarette equivalents) are calculated via verified deterministic algorithms.
3. **Clinical Asthma Guardrail**: Whenever an asthmatic household member is present, a dedicated inhaler caution banner is permanently injected into the plan post-generation, regardless of whether a rule-based or GenAI provider produced the output.
