---
title: "FinBuddy: Advanced AI-Driven Financial Intelligence System"
author: "Glen Louis"
date: "`r Sys.Date()`"
output: 
  github_document:
    toc: true
    toc_depth: 3
---

# 🤖 Project Vision
**FinBuddy** is an enterprise-grade Finance SaaS designed to bridge the gap between messy, real-world physical data and structured financial intelligence. Unlike traditional trackers, FinBuddy utilizes an **asynchronous AI pipeline** to automate data entry and provide proactive coaching based on longitudinal spending patterns.

---

# 🚀 Core AI Architecture & Data Engineering

### 1. The Multi-Stage Asynchronous Pipeline
To solve the problem of high-latency AI inference, I architected a non-blocking worker system.
* **Ingestion**: High-resolution receipt images are uploaded to **Supabase Storage**.
* **OCR Orchestration**: The system triggers a background process using **OCR.space (Engine 2)** to extract raw text, optimized for tabular financial layouts.
* **NLP Transformation**: Extracted text is fed into **GPT-4-1106-Preview**, acting as a semantic parser to identify line items, tax, and merchant metadata.

### 2. Deterministic Intelligence & Safety Guardrails
To eliminate the risk of "financial hallucinations," I implemented strict engineering constraints:
* **Schema Enforcement**: The LLM is restricted to a specific JSON output format (Title, Amount, Category, Date, Vendor).
* **Zero-Temperature Policy**: By setting `temperature: 0`, I ensured that the extraction logic remains deterministic and reproducible across multiple sessions.
* **System Prompt Persona**: Explicit system instructions define the LLM as a "Strict Data Extractor" that is prohibited from inventing or guessing missing fields.

### 3. Predictive Financial Analytics
The "AI Coach" feature goes beyond simple math to perform high-level trend analysis.
* **Contextual Benchmarking**: The analyst agent analyzes a minimum of 5 data points to identify anomalies or increasing costs in specific categories.
* **Natural Language Generation (NLG)**: Generates human-readable spending summaries and actionable suggestions under a 100-word limit for rapid user consumption.

---

# 🛠️ Comprehensive Tech Stack

| Layer | Technologies |
|:---|:---|
| **Frontend Core** | **Next.js 15.4.3**, **React 19.1.0** |
| **AI Processing** | **OpenAI SDK (GPT-4)**, **Tesseract.js**, OCR.space API |
| **Backend/DB** | **Supabase** (PostgreSQL, Realtime, Edge Functions) |
| **Storage** | **Supabase Buckets** (Receipts) with **Signed URL Security** |
| **State Layer** | **SWR** (Optimistic UI updates) |
| **UX/Design** | **Tailwind CSS 4.1**, **Framer Motion 12.2**, **Radix UI** |

---

# 🧠 Key Engineering Challenges Overcome

### Problem: Handling High-Latency API Requests
**Scenario**: OCR and LLM processing combined can take up to 8 seconds, causing standard serverless functions to timeout.  
**Solution**: I implemented a **Background Worker Pattern**. The frontend creates a placeholder record and returns instantly. The backend then processes the data asynchronously, updating the UI via **SWR revalidation** once the AI task is complete.

### Problem: Multi-Tenant Data Leakage
**Scenario**: AI processing requires admin-level database access to update records, but this must never expose user data to other accounts.  
**Solution**: Architected a **Secure Dual-Client Logic**. 
* **Standard Client**: Restricted by **Row Level Security (RLS)** for all frontend actions.
* **Admin Client**: Utilizes the `SUPABASE_SERVICE_ROLE_KEY` purely on the server, but only after verifying the user's JWT (JSON Web Token) to ensure the AI only processes data belonging to that specific UID.

---

# 📈 Deployment & Security
* **Environment Hygiene**: Managed via `.env` variables for API keys and database secrets.
* **User Lifecycle Management**: Automated cleanup protocols that delete physical receipt storage files immediately upon account termination to maintain GDPR-compliant data hygiene.

---
*FinBuddy represents a modern approach to AI-integrated SaaS, focusing on reliability, deterministic data handling, and elite user performance.*
