

# 🤖 Project Overview

**FinBuddy** is a sophisticated Finance SaaS platform designed to automate the transition from raw physical receipts to structured, actionable financial insights. By orchestrating a multi-stage pipeline involving **OCR** and **Large Language Models (LLMs)**, it eliminates manual data entry and provides users with a proactive "AI Financial Coach".

## 🚀 Key AI & Engineering Features

### 1. Automated OCR Pipeline
The system utilizes **OCR.space** to extract raw text from receipt images, which is then fed into a secondary processing layer.
* **Implementation:** `api/ocr/full-process/route.js`.

### 2. Deterministic NLP Extraction
Leverages **GPT-4-1106-Preview** as a strict data parser. 
* **Prompt Engineering:** Uses advanced prompts with `temperature: 0` to convert unstructured text into a validated JSON schema (amount, category, vendor, date).
* **Constraint Handling:** Explicitly instructs the model to avoid hallucinations and only extract explicitly stated data.

### 3. Asynchronous Worker Architecture
Implements a background worker pattern for long-running AI tasks.
* **User Experience:** This architecture prevents blocking the main UI thread during the 3-6 second processing window.

### 4. Financial Insights Engine
A custom analyst agent performs trend analysis on transaction history to generate personalized spending summaries.
* **Data Requirements:** Requires a minimum of 5 expenses to ensure statistical relevance before generating advice.

## 🛠️ Technical Stack

| Category | Technology |
|:---|:---|
| **Framework** | Next.js 15 (App Router), React 19 |
| **AI/ML** | OpenAI API (GPT-4), OCR.space API, Tesseract.js |
| **Backend/Auth** | Supabase (Auth, PostgreSQL, Storage) |
| **Styling** | Tailwind CSS 4, Shadcn/UI, Framer Motion |
| **State** | SWR (Stale-While-Revalidate) |

## 🧠 Technical Challenges Overcome

### Multi-Stage Data Validation
Physical receipts often produce "noisy" OCR output. I engineered a **multi-pass validation logic** that cleans raw text before LLM ingestion and uses specific JSON-mode enforcement to prevent schema drift.

### Scalable Security Architecture
Implemented a **dual-client Supabase architecture**. 
* **Client-Side:** Restricted by Row Level Security (RLS).
* **Server-Side:** High-privilege AI processing and account lifecycle management are handled by secured Admin clients.

---

