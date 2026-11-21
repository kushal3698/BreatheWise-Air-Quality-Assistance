# 🤝 Contributing to BreatheWise

Thank you for your interest in contributing to **BreatheWise**! This document outlines coding standards, development workflows, testing requirements, and architectural conventions.

---

## 📋 Code Quality & Architectural Guidelines

### 1. General Principles
- **Predictable & Deterministic**: Never compute life-safety numbers or impact percentages inside non-deterministic LLMs. All numerical values must flow through the deterministic mathematical engines (`app/services/impact.py` and `lib/initialData.ts`).
- **Single Source of Truth**: When displaying categorical data (e.g. CPCB AQI bands, risk categories, colors), all UI components must derive state from unified functions (`getAQIBand(aqi)` in frontend and `get_aqi_category_and_color(aqi)` in backend).
- **Separation of Concerns**: Keep business logic decoupled from UI markup. Custom hooks, utilities, and components should be single-purpose and under 300 lines of code.

### 2. Python Backend Standards
- **Style**: Follow PEP 8 guidelines. Format code using `black` and lint with `ruff` or `flake8`.
- **Type Hints**: All functions must include strict Python type hints for parameters and return types:
  ```python
  def calculate_cpcb_aqi(
      pm2_5: Optional[float] = None,
      pm10: Optional[float] = None,
      no2: Optional[float] = None,
      so2: Optional[float] = None,
      co: Optional[float] = None,
      o3: Optional[float] = None,
  ) -> int:
  ```
- **Docstrings**: Provide Google-style or Sphinx docstrings explaining inputs, outputs, mathematical formulas, and edge cases.
- **Named Constants**: Never use magic numbers inline. Breakpoints, emission factors, and conversion ratios must be imported from `config/` or declared as named module constants.

### 3. TypeScript & React Frontend Standards
- **Strict Typing**: Use strict TypeScript definitions; avoid `any`. All API responses must conform to interfaces defined in `src/lib/api.ts`.
- **Accessibility (WCAG 2.1 AA)**:
  - All interactive elements must be keyboard-accessible.
  - Interactive icons require explicit `aria-label` tags.
  - Color must never be the sole conveyor of information (pair colors with text badges).
  - Multi-language text blocks must feature appropriate `lang` attributes (`en`, `hi`, `te`, `ta`).
- **Formatting**: Lint with ESLint (`npm run lint`) and format with Prettier.

---

## 🧪 Testing Requirements

Every new feature or bug fix must include automated test coverage:
- **Backend Tests (Pytest)**:
  ```bash
  python -m pytest backend/tests -v
  ```
  Ensure 100% pass rate across schemas, CPCB calculations, safety rules, and impact calculations.
- **Frontend Tests (Vitest)**:
  ```bash
  cd frontend
  npm test -- --run
  ```
  Ensure tests cover component rendering, responsive calculations, accessibility, and internationalization.

---

## 🔒 Security & Safe Disclosure

- **Zero-Secret Policy**: Never commit `.env` files, API keys, or personal tokens.
- **Input Validation**: All public endpoints must sanitize input parameters and enforce strict length constraints using Pydantic or regex scrubbers.
- See [SECURITY.md](SECURITY.md) for vulnerability reporting procedures.
