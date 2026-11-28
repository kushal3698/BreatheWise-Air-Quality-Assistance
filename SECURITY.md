# 🔒 Security Policy — BreatheWise

## Supported Versions

BreatheWise strictly maintains active security patches and updates for the following versions:

| Version | Supported          | Security Status |
| ------- | ------------------ | --------------- |
| 1.0.x   | :white_check_mark: | Active Support  |
| < 1.0   | :x:                | Deprecated      |

---

## 🛡️ Security Architecture & Threat Model

BreatheWise is engineered with a **defense-in-depth security model** protecting user interactions, API endpoints, and client telemetry:

### 1. HTTP Security Headers
Both the **Next.js 14** web application and the **FastAPI** backend ([middleware/security.py](backend/app/middleware/security.py)) enforce strict OWASP HTTP security headers:
- `Strict-Transport-Security (HSTS)`: `max-age=63072000; includeSubDomains; preload` enforces end-to-end encrypted HTTPS traffic.
- `X-Frame-Options: DENY`: Prevents UI clickjacking and iframe embedding attacks.
- `X-Content-Type-Options: nosniff`: Eliminates MIME-type confusion attacks.
- `Content-Security-Policy`: Enforces strict same-origin policies and `frame-ancestors 'none'` (removing deprecated `X-XSS-Protection` per OWASP guidance).
- `Referrer-Policy: strict-origin-when-cross-origin`: Restricts outbound referrer leakage.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`: Disallows unauthorized browser hardware access.
- `X-Powered-By` / `Server`: Suppressed across all responses to prevent technology fingerprinting.

### 2. Input Sanitization, Rate Limiting & Attack Surface Mitigation
- **City Parameter Scrubbing**: Frontend inputs use `/[^\p{L}\p{M}\p{N}\s()\-.]/gu` ([sanitize.ts](frontend/src/lib/sanitize.ts)) and backend Pydantic validators use `unicodedata` (`L*`/`M*`/`N*` categories) in [schemas.py](backend/app/models/schemas.py) so Latin, Devanagari, Telugu, and Tamil characters plus combining vowel marks survive while scripts and tags are scrubbed.
- **Strict Pydantic Contracts & Payload Caps**: Request schemas forbid unknown extra fields (`extra="forbid"`), strip ASCII control characters, cap chat queries at 1,000 characters, and cap history depth.
- **Prompt Injection Boundaries & RAG Safety**: LLM chat queries are wrapped in `<user_query>...</user_query>` untrusted data delimiters, and [rag.py](backend/app/services/rag.py) validates resolved markdown file paths via `is_relative_to()` to block symlink path traversal.
- **Sliding-Window Rate Limiter & Production Docs Gate**: [middleware/security.py](backend/app/middleware/security.py) enforces sliding-window per-IP throttling backed optionally by Redis (`REDIS_URL`) with automatic in-memory fallback, and Swagger `/docs` / `/redoc` automatically disable when `APP_ENV=production`.
- **Language Whitelisting**: Language switches strictly validate against supported ISO codes (`en`, `hi`, `te`, `ta`) with safe fallback to `en`.

### 3. Zero-Hardcoded Secrets Policy
- API keys (e.g., `GEMINI_API_KEY`) are loaded solely from runtime environment variables (`.env`).
- No private tokens or keys exist within the source repository.
- Complete offline demo and procedural modes operate seamlessly when API credentials are not supplied.

### 4. Responsible AI & Safety Guardrails
- **Decision Support Only**: Clear disclaimers communicate that BreatheWise provides atmospheric awareness and lifestyle recommendations, not medical diagnosis or prescription.
- **Deterministic Math Engine**: All exposure percentages, CO₂ avoided, and cost calculations are computed using verified deterministic formulas, preventing LLM hallucination of safety-critical figures.

---

## 🚨 Reporting a Vulnerability

If you discover a potential security vulnerability within BreatheWise, please report it responsibly:

1. **Email**: Open an advisory or contact the maintainer directly at `kuswanthreddy369@gmail.com`.
2. **Details to Include**:
   - Component affected (Frontend API route, FastAPI backend, or client component)
   - Step-by-step reproduction instructions or Proof-of-Concept (PoC)
   - Potential impact assessment
3. **Response Timeline**:
   - Initial acknowledgment promptly, typically within **2 business days**.
   - Remediation prioritized based on severity.

Please do not disclose potential security issues publicly until a patch has been verified and released.
