# EstateIQ: AI-Driven Real Estate Lead & Valuation CRM

EstateIQ is an enterprise-grade, microservice-based Real Estate Customer Relationship Management (CRM) and Valuation platform. It empowers brokerage teams with ML-driven property price estimation, real-time lead conversion probability scoring, natural language semantic property matching, and interactive Kanban pipelines.

---

## 🏗️ System Architecture & Services

The platform consists of three decoupled microservices and two backing data stores:

| Component | Tech Stack | Port | Description |
| :--- | :--- | :--- | :--- |
| **Client Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, `@dnd-kit/core`, `react-leaflet`, Socket.io | `3000` | Real-time Kanban board, interactive Leaflet property map, analytics dashboard, AI valuation sandbox. |
| **Core CRM Backend** | Node.js, Express.js, Mongoose, Socket.io, BullMQ, Redis, JWT Auth | `5000` | REST API, real-time WebSocket events, background BullMQ followup queue worker, AI client caching. |
| **AI & ML Engine** | Python 3.11, FastAPI, Scikit-Learn, XGBoost, `sentence-transformers` | `8001` | Machine learning property valuation, 0–100 lead conversion scoring, 384-dimensional semantic embeddings. |
| **Database** | MongoDB | `27017` | Document database for users, properties, leads, and activity audit trails. |
| **Cache & Queue** | Redis | `6379` | Valuation response caching & BullMQ asynchronous task queue. |

---

## 🌟 Key Features

1. **AI Property Valuation Engine**:
   - Ensemble regression models (RandomForest & XGBoost) trained across micro-markets (Vasudev Nagar, Dharampeth, MIHAN, Trimurti Nagar, Manish Nagar).
   - Generates fair-value price estimates, confidence bands, and price/valuation ratios.

2. **Lead Conversion Probability Scoring**:
   - Scores buyer inquiries on a 0–100 scale using budget alignment, engagement velocity, and site visit milestones.
   - Categorizes leads into `Hot`, `Warm`, and `Cold` priority tiers with human-readable reasoning factors.

3. **Semantic Property Matching**:
   - Transforms natural language buyer requirements into 384-dimensional embeddings (`sentence-transformers/all-MiniLM-L6-v2`).
   - Computes hybrid matching combining cosine vector similarity and budget proximity.

4. **Interactive Lead Pipeline (Kanban)**:
   - Drag-and-drop board across 6 pipeline stages powered by `@dnd-kit/core`.
   - Real-time multi-client synchronization via Socket.io.
   - Slide-over Lead Detail Drawer featuring AI factor breakdowns, matched property recommendations, and activity logging.

5. **Geospatial Property Explorer**:
   - Interactive `react-leaflet` map with color-coded property markers highlighting undervalued versus premium-listed properties.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (v3.10 or v3.11)
- [Docker & Docker Compose](https://www.docker.com/) (for MongoDB & Redis)

---

### Step 1: Start Infrastructure (MongoDB & Redis)
```bash
docker compose up -d
```
*Note: If running MongoDB locally without Docker, ensure it is listening on `mongodb://127.0.0.1:27017`.*

---

### Step 2: Set Up & Launch AI Engine
```bash
cd ai-engine
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```
*Health check:* `http://127.0.0.1:8001/health`  
*Interactive Swagger Docs:* `http://127.0.0.1:8001/docs`

---

### Step 3: Set Up & Launch Core Server
```bash
cd ../server
npm install
cp .env.example .env

# Run database seed (1 Admin, 2 Agents, 15 Properties with AI valuations, 20 AI-scored Leads)
npm run seed

# Start server in development mode
npm run dev
```
*Server API Base:* `http://localhost:5000/api`

---

### Step 4: Set Up & Launch Client Frontend
```bash
cd ../client
npm install
cp .env.example .env.local

npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Demo Credentials

Once the seed script has executed (`npm run seed`), use the following accounts to sign in:

| Role | Email | Password | Assigned Localities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@estateiq.com` | `Admin@123` | *All Localities* |
| **Agent** | `rahul.sharma@estateiq.com` | `Agent@123` | Vasudev Nagar, Dharampeth |
| **Agent** | `priya.patel@estateiq.com` | `Agent@123` | MIHAN, Manish Nagar |

---

## 📡 Microservice API Contracts

### AI Engine (`http://127.0.0.1:8001/api/v1`)
- `POST /predict-price`: Predicts fair market value in Lakhs given locality, BHK, carpet area, floor, and amenities.
- `POST /score-lead`: Computes conversion probability score (0–100), priority tag (`Hot`, `Warm`, `Cold`), and explanatory factors.
- `POST /generate-embedding`: Produces a 384-dimensional vector embedding for property descriptions or buyer requirements.
- `POST /match-properties`: Performs vector similarity and budget matching across property inventories.
- `GET /health`: Microservice readiness & model status.

### Core CRM Server (`http://localhost:5000/api`)
- `POST /auth/login` & `POST /auth/register`: JWT authentication and user session management.
- `GET /properties` & `POST /properties`: Property listings with automated AI valuations and vector embeddings.
- `GET /leads` & `POST /leads`: Lead pipeline management with automated scoring.
- `PATCH /leads/:id/stage`: Kanban drag-and-drop stage updates with real-time WebSocket broadcast.
- `POST /activities`: Interaction logging (Calls, WhatsApp, Site Visits) with automated follow-up scheduling.

---

## 🔒 Security & Git Hygiene
- All sensitive credentials and local configs (`.env`, `.env.local`, `*.pem`, `*.key`) are strictly excluded via `.gitignore`.
- Template configurations are provided in `.env.example` across all services.

---

## 📄 License
This project is licensed under the MIT License.

