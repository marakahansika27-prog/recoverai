# RecoverAI — Autonomous Revenue Recovery Agent (Razorpay Buildathon Track 3)

## 🚀 Live Demo

**[RecoverAI — Live Production Demo](https://recoverai-ochre.vercel.app)**

RecoverAI is an enterprise-grade AI revenue recovery platform designed for **Razorpay Buildathon Track 3: AI Revenue Recovery**. It detects revenue at risk from payment failures, checkout abandonments, and subscription renewal failures, diagnoses root causes, predicts action-specific recovery probabilities, optimizes Expected Recovery Value ($ERV = \text{Amount} \times P(\text{Recovery} \mid \text{Action}) - \text{Cost}$), enforces strict deterministic policy guardrails, executes authorized interventions, and maintains an immutable audit trail.

---

## 🏗️ Architecture Overview

- **Frontend**: Next.js 14, Tailwind CSS, TypeScript (Deployed on Vercel)
- **Backend**: FastAPI, SQLModel, Uvicorn (Deployed on Render / Railway)
- **Database**: PostgreSQL (Hosted on Supabase / Render PostgreSQL)
- **Public Razorpay Webhook**: `POST /api/v1/webhooks/razorpay`

---

## 🚀 Public Deployment Guide

### 1. Database Setup (Supabase PostgreSQL)
1. Create a free project on [Supabase](https://supabase.com).
2. Copy the PostgreSQL connection URI from **Project Settings -> Database -> Connection String (URI)**.
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

### 2. Backend Deployment (Render / Railway)
1. Push this repository to GitHub.
2. Log in to [Render](https://render.com) and click **New -> Web Service**.
3. Connect your GitHub repository.
4. Set Build Command: `pip install -r backend/requirements.txt`
5. Set Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables:
   - `DATABASE_URL`: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   - `SECRET_KEY`: `your-production-secret-key`
   - `RAZORPAY_WEBHOOK_SECRET`: `whsec_your_razorpay_webhook_secret`
   - `ALLOWED_ORIGINS`: `https://your-frontend-domain.vercel.app`
7. Click **Deploy Web Service**. Render will output your backend URL (e.g. `https://recoverai-backend.onrender.com`).

### 3. Frontend Deployment (Vercel)
1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Select your GitHub repository.
3. Set Framework Preset: `Next.js`.
4. Set Root Directory: `frontend`.
5. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: `https://recoverai-backend.onrender.com/api/v1`
6. Click **Deploy**. Vercel will output your public URL (e.g. `https://recoverai.vercel.app`).

### 4. Razorpay Webhook Configuration
1. Log in to your Razorpay Dashboard (**Settings -> Webhooks**).
2. Click **Add New Webhook**.
3. Set Webhook URL: `https://recoverai-backend.onrender.com/api/v1/webhooks/razorpay`
4. Select Events: `payment.failed`, `checkout.abandoned`, `subscription.halted`.
5. Enter Secret: Matched with `RAZORPAY_WEBHOOK_SECRET`.

---

## 🎯 Verification & Health Check

- **API Health Check**: `GET https://recoverai-backend.onrender.com/health`
- **Interactive OpenAPI Documentation**: `GET https://recoverai-backend.onrender.com/docs`
- **10,000-Event Benchmark Endpoint**: `POST https://recoverai-backend.onrender.com/api/v1/simulation/run-batch`
