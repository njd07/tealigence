# 🍵 Tealigence — AI-Powered Tea Ecosystem Platform

An AI-powered solution that enhances efficiency, transparency, and profitability across the Assam tea value chain. Built for the Tea Research Association hackathon.

🌐 **Live Demo:** [https://tealigence.vercel.app](https://tealigence.vercel.app/login)

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+** with pip
- **Node.js 18+** with npm
- **OpenRouter API Key** (free — [get one here](https://openrouter.ai))

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Linux/Mac
pip install -r requirements.txt
```

Edit `backend/.env` and paste your OpenRouter API key:
```
OPENROUTER_API_KEY=sk-or-YOUR_KEY_HERE
JWT_SECRET=tealigence-secret-key-2024
```

Initialize the knowledge base & start the server:
```bash
python init_db.py
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** → Login with `admin` / `admin`

---

## 📋 Features & Sections

### 1. 🌿 Farmer Advisory (RAG Chatbot)
**What it does:** AI chatbot powered by a Retrieval-Augmented Generation (RAG) pipeline. It retrieves relevant information from the Tea Research Association's knowledge base before answering.

**How it works:**
- User asks a question about tea cultivation
- System searches the vectorized Tocklai guidelines document for relevant context
- Context + question are sent to Google Gemma 4 (via OpenRouter) for an informed answer
- 4 preset questions are cached for demo responses

**Key topics:** Soil pH management, pest control (tea mosquito bug, red spider mite, blister blight), fertilizer schedules, CTC/Orthodox processing, plucking standards, shade management.

### 2. 🔬 Quality Assessment Lab (AI Vision)
**What it does:** Upload a tea leaf image and get instant AI-powered grading, quality scoring, and flavor profiling.

**How it works:**
- User uploads/drops a tea leaf photo
- Image is sent to Google Gemma 4 vision model for multimodal analysis
- Returns: tea grade (TGFOP, BOP, PF, etc.), quality score (0-100), flavor profile, processing type, and market value
- You can use the `sample_image.jpg`  for a reliable demo

**Output includes:** Grade classification, quality score ring, flavor profile (body, briskness, aroma), recommendations.

### 3. 📊 Trader Dashboard (Market Intelligence)
**What it does:** Interactive charts showing GTAC auction price trends, spoilage risk distribution, and export compliance metrics.

**Charts:**
- **Price Trends:** Area chart showing CTC, Orthodox, and Green tea prices over 6 months
- **Spoilage Risk:** Donut chart with risk distribution across inventory
- **Export Compliance:** Bar + line chart showing volume and compliance % by country (UK, Russia, UAE, USA, Germany)

### 4. 🚛 Supply Chain Analytics
**What it does:** Demand forecasting with actual vs. predicted comparison, warehouse inventory health monitoring, and wastage alerts.

**Components:**
- **Demand Forecast:** Bar chart comparing actual vs. AI-predicted demand
- **Inventory Status:** 4 warehouses with fill-level bars and status badges (Optimal/Low/Excess/Critical)
- **Wastage Alerts:** Real-time alerts for moisture, pest, and expiry risks with severity levels

### 5. 🌤️ Weather Advisor (Real-Time)
**What it does:** Fetches **live weather data** from Open-Meteo API for Jorhat, Assam and provides garden-specific activity recommendations.

**How it works:**
- Pulls real-time temperature, humidity, rainfall, wind, UV from Open-Meteo (free, no key needed)
- 5-day forecast with rain probability
- **Smart garden activity guide** that adapts to actual weather — recommends/avoids plucking, spraying, pruning, fertilization, drainage based on conditions
- Weather alerts generated dynamically (flood risk, humidity warnings, heat advisories)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Recharts, Lucide Icons |
| **Backend** | FastAPI (Python), Uvicorn |
| **AI Models** | Google Gemma 4 31B (free via OpenRouter) — text + vision |
| **RAG Pipeline** | LangChain + HuggingFace Embeddings + SKLearn VectorStore |
| **Weather** | Open-Meteo API (free, real-time) |
| **Auth** | JWT + bcrypt + SQLite |

---

## 📁 Project Structure

```
Tealigence/
├── backend/
│   ├── main.py                 ← FastAPI server (all endpoints)
│   ├── auth.py                 ← JWT authentication
│   ├── init_db.py              ← Vector database builder
│   ├── cached_responses.json   ← Demo responses (chat + sample image)
│   ├── requirements.txt
│   ├── .env                    ← API keys (edit this!)
│   └── documents/
│       └── tocklai_guidelines.txt  ← Knowledge base
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx             ← React Router setup
│   │   ├── index.css           ← Design system
│   │   ├── lib/api.js          ← API client
│   │   └── components/
│   │       ├── LoginPage.jsx
│   │       ├── RegisterPage.jsx
│   │       ├── Layout.jsx          ← Navbar + routing
│   │       ├── FarmerAdvisory.jsx  ← RAG chatbot
│   │       ├── QualityLab.jsx      ← Vision analysis
│   │       ├── TraderDashboard.jsx ← Charts
│   │       ├── SupplyChain.jsx     ← Inventory
│   │       └── WeatherAdvisor.jsx  ← Live weather
│   └── vite.config.js
│
├── sample_image.jpg            ← Demo image for Quality Lab
└── README.md
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Authenticate user |
| POST | `/api/register` | Create new user |
| POST | `/api/chat` | RAG chatbot query |
| POST | `/api/vision` | Tea leaf image analysis |
| GET | `/api/supply-chain` | Inventory & demand data |
| GET | `/api/weather` | Real-time weather + garden advice |

---

## 🎯 Demo Tips

1. **Chatbot:** You can ask any question from your side or you can click the 4 preset questions
2. **Quality Lab:** Upload `sample_image.jpg` or any tea leaf image— returns a detailed analysis instantly
3. **Weather:** Shows live data — the "LIVE" badge confirms real-time API connection
4. **Default Login:** `admin` / `admin`

---

## 👥 Team

Built by **Team Tealigence** for the Tea Research Association Hackathon.
