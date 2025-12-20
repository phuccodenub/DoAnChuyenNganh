# 📜 AI STRATEGY & HISTORY ARCHIVE

**Archive Date:** December 20, 2025
**Purpose:** Consolidates historical strategy documents, decision logs, and implementation summaries.

---

## 📅 DECEMBER 2025 STRATEGY SHIFT

### 1. The "Google AI RPD" Crisis
**Context:** In mid-December 2025, it was identified that Google AI's free tier has a strict **20 Requests Per Day (RPD)** limit per model/key (previously thought to be higher or unlimited).
**Impact:** A single API key could only handle ~20 requests/day, insufficient for an LMS with 100+ users.

### 2. The Solution: Hybrid & Multi-Key Strategy
To overcome the RPD limit without incurring high costs, the following strategy was adopted:

*   **Multi-Key Rotation:** Implemented a system to rotate between 3 Google API keys.
    *   Capacity: 3 Keys × 3 Models × 20 RPD = **180 Requests/Day** (Google AI total).
*   **Groq as Primary:** Shifted general traffic to Groq (Llama 3.3 70B), which offers unlimited RPD for free.
*   **Intelligent Routing:** Instead of a simple fallback, requests are routed based on task type:
    *   **Math:** -> Groq (Qwen 32B)
    *   **Code:** -> Google (Gemini 3 Flash) -> ProxyPal
    *   **General:** -> Groq -> Google (Gemini 2.5 Flash)

### 3. ProxyPal Role
*   **Local Development:** ProxyPal is the "Heavy Lifter" for local dev, providing unlimited access to powerful models (Gemini 3 Pro, Qwen Coder) without hitting cloud quotas.
*   **Production:** ProxyPal is NOT used in production (local only).

---

## 🧪 IMPLEMENTATION & TEST LOGS (Dec 20, 2025)

### ✅ Completed Tasks
1.  **Google AI Integration:**
    *   Configured 3 core models: `gemini-3-flash-preview`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`.
    *   Implemented `gemini-2.5-flash-tts` for Text-to-Speech.
    *   Removed `gemini-robotics` (irrelevant).
2.  **Backend Logic:**
    *   Updated `ai-orchestrator.ts` with the new routing table.
    *   Added `test-provider` endpoint for verification.
3.  **Verification:**
    *   All 3 Google models tested successfully with latency ~2-5s.
    *   Groq models verified working.

### 📊 Model Performance Data
| Model | Latency | Quality | Use Case |
| :--- | :--- | :--- | :--- |
| **Groq Llama 3.3** | ~0.5-1.5s | High | General Chat |
| **Google Gemini 3 Flash** | ~5.7s | Best | Code & Complex Logic |
| **Google Gemini 2.5 Lite** | ~2.8s | Good | Simple Queries |
| **ProxyPal Gemini 3 Pro** | ~1.3s | Best | Long Content (Local) |

---

## 📂 ARCHIVED FILE SUMMARIES

This document replaces the following files:

*   **`AI_FEATURES_SUMMARY.md`**: Listed initial AI features (Chat, Lesson Chat, Summary). *Status: Merged into Master Status.*
*   **`AI_IMPLEMENTATION_COMPLETE.md`**: Announced the completion of the "AI System V2" backend. *Status: Valid backend reference.*
*   **`AI_PLAN.md`**: Old planning document, marked deprecated. *Status: Archived.*
*   **`AI_PROVIDER_STRATEGY_2025.md`**: Detailed the RPD analysis and tier classification. *Status: Core logic preserved here.*
*   **`AI_SESSION_SUMMARY_DEC20.md`**: Logged the specific work done on Dec 20 (Testing & Routing). *Status: Logs preserved above.*
*   **`GOOGLE_AI_FINAL_SUMMARY.md`**: Final report on Google AI integration. *Status: Key details merged.*
*   **`GOOGLE_AI_MULTIMODEL_STRATEGY.md`**: Explained the multi-model rationale. *Status: Merged.*
*   **`TOM_TAT_GOOGLE_AI_VIET.md`**: Vietnamese summary of the Google AI implementation. *Status: Merged.*

---

## 🔗 REFERENCE LINKS

*   **Current Status:** [AI_IMPLEMENTATION_STATUS_MASTER.md](AI_IMPLEMENTATION_STATUS_MASTER.md)
*   **Full Architecture:** [01_OVERVIEW.md](01_OVERVIEW.md)
