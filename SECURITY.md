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
Both the **Next.js 14** web application and the **FastAPI** backend enforce strict HTTP security headers:
- `Strict-Transport-Security (HSTS)`: `max-age=63072000; includeSubDomains; preload` enforces end-to-end encrypted HTTPS traffic.
- `X-Frame-Options: DENY`: Prevents UI clickjacking and iframe embedding attacks.
- `X-Content-Type-Options: nosniff`: Eliminates MIME-type confusion attacks.
- `X-XSS-Protection: 1; mode=block`: Activates browser-level reflected cross-site scripting filters.
- `Referrer-Policy: strict-origin-when-cross-origin`: Restricts outbound referrer leakage.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`: Disallows unauthorized browser hardware access.
- `X-Powered-By`: Suppressed across all responses to prevent technology fingerprinting.

### 2. Input Sanitization & Attack Surface Mitigation
- **City Parameter Scrubbing**: Search parameters and city inputs are strictly sanitized with `/[^\p{L}\p{M}\p{N}\s()\-.]/gu` and truncated to 60 characters, neutralizing cross-site scripting (XSS), script injection, and path traversals.
- **Payload Size & Type Enforcement**: Conversational chat payloads are capped at 1,000 characters with explicit type checking before LLM ingestion, preventing resource exhaustion (DoS) and prompt injection tampering.
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
