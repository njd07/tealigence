"""
Tealigence — FastAPI Backend
AI-powered solution for the Assam tea value chain.
"""
import os, base64, json
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
from auth import authenticate_user, register_user, verify_token

load_dotenv()

# Load cached responses for demo/rate-limit fallback
CACHED_FILE = os.path.join(os.path.dirname(__file__), "cached_responses.json")
CACHED = {}
if os.path.exists(CACHED_FILE):
    with open(CACHED_FILE, "r") as f:
        CACHED = json.load(f)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
CHROMA_DB_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")
DB_FILE = os.path.join(CHROMA_DB_DIR, "vectorstore.json")

client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_API_KEY)
CHAT_MODEL = "google/gemma-4-31b-it:free"
VISION_MODEL = "google/gemma-4-31b-it:free"

vectorstore = None

def get_vectorstore():
    global vectorstore
    if vectorstore is None:
        from langchain_huggingface import HuggingFaceEmbeddings
        from langchain_community.vectorstores import SKLearnVectorStore
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2", model_kwargs={"device": "cpu"})
        vectorstore = SKLearnVectorStore(embedding=embeddings, persist_path=DB_FILE, serializer="json")
    return vectorstore

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []

def get_current_user(authorization: str | None = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload["sub"]

@asynccontextmanager
async def lifespan(app: FastAPI):
    if os.path.exists(DB_FILE):
        try:
            get_vectorstore()
            print("✅ Vectorstore loaded.")
        except Exception as e:
            print(f"⚠️ Vectorstore not loaded: {e}")
    else:
        print("⚠️ Run 'python init_db.py' first.")
    yield

app = FastAPI(title="Tealigence API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.post("/api/login")
async def login(req: LoginRequest):
    token = authenticate_user(req.username, req.password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"token": token, "username": req.username}

@app.post("/api/register")
async def register(req: RegisterRequest):
    success, message = register_user(req.username, req.password)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"message": message}

SYSTEM_PROMPT = """You are Tealigence AI, an expert agricultural advisor for Assam tea cultivation from the Tea Research Association.
Your expertise: tea plant biology, soil health, pest management (tea mosquito bug, red spider mite, blister blight), pruning, plucking standards, CTC/Orthodox processing, tea grading (TGFOP, BOP, PF, Dust), organic cultivation, shade tree management, climate adaptation for NE India.
Guidelines: Give practical advice for Assam planters. Use simple language. Include specific measurements/dosages. Keep responses concise (2-4 paragraphs). Be honest if unsure."""

@app.post("/api/chat")
async def chat(req: ChatRequest, authorization: str | None = Header(None)):
    get_current_user(authorization)

    # Check cached responses first (for preset questions)
    cached_chat = CACHED.get("chat", {})
    if req.message.strip() in cached_chat:
        return {"response": cached_chat[req.message.strip()]}

    context_text = ""
    try:
        vs = get_vectorstore()
        results = vs.similarity_search(req.message, k=3)
        if results:
            context_text = "\n\n".join([doc.page_content for doc in results])
    except Exception:
        pass

    prompt = SYSTEM_PROMPT
    if context_text:
        prompt += f"\n\nRelevant knowledge:\n{context_text}"

    messages = [{"role": "system", "content": prompt}]
    for msg in req.history[-6:]:
        messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
    messages.append({"role": "user", "content": req.message})

    try:
        response = client.chat.completions.create(model=CHAT_MODEL, messages=messages, max_tokens=1024, temperature=0.7,
            extra_headers={"HTTP-Referer": "https://tealigence.app", "X-Title": "Tealigence"})
        return {"response": response.choices[0].message.content}
    except Exception as e:
        if "429" in str(e) or "rate" in str(e).lower():
            raise HTTPException(status_code=429, detail="Rate limit reached. Wait and retry.")
        raise HTTPException(status_code=500, detail=f"AI error: {e}")

VISION_PROMPT = """You are a tea quality assessor from the Tea Research Association, Jorhat, Assam.
Analyze this tea leaf image. Return ONLY a JSON object:
{"grade":"Assam tea grade","grade_description":"explanation","quality_score":75,"leaf_appearance":"description","color_assessment":"color analysis","flavor_profile":{"body":"Medium","briskness":"Medium","aroma":"description","notes":"malty, muscatel etc"},"processing_type":"CTC or Orthodox","recommendations":["tip1","tip2"],"market_value":"Premium/Standard/Economy"}"""

@app.post("/api/vision")
async def analyze_tea_leaf(file: UploadFile = File(...), authorization: str | None = Header(None)):
    get_current_user(authorization)

    # Check if it's the sample image — return cached result
    fname = (file.filename or "").lower()
    if "sample" in fname and CACHED.get("sample_image"):
        await file.read()  # consume the upload
        return {"analysis": CACHED["sample_image"]}

    contents = await file.read()
    b64 = base64.b64encode(contents).decode("utf-8")
    ct = file.content_type or "image/jpeg"
    try:
        response = client.chat.completions.create(model=VISION_MODEL,
            messages=[{"role": "user", "content": [{"type": "text", "text": VISION_PROMPT},
                {"type": "image_url", "image_url": {"url": f"data:{ct};base64,{b64}"}}]}],
            max_tokens=1024, temperature=0.3,
            extra_headers={"HTTP-Referer": "https://tealigence.app", "X-Title": "Tealigence"})
        text = response.choices[0].message.content.strip()
        try:
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0]
            result = json.loads(text)
        except json.JSONDecodeError:
            result = {"grade": "Analysis Done", "quality_score": 75, "leaf_appearance": text,
                "flavor_profile": {"body": "Medium", "briskness": "Medium", "aroma": "See analysis", "notes": "See analysis"},
                "recommendations": ["See full analysis"], "raw_analysis": text}
        return {"analysis": result}
    except Exception as e:
        if "429" in str(e):
            raise HTTPException(status_code=429, detail="Rate limit reached.")
        raise HTTPException(status_code=500, detail=f"Vision error: {e}")

@app.get("/api/supply-chain")
async def get_supply_chain_data(authorization: str | None = Header(None)):
    get_current_user(authorization)
    return {
        "demand_forecast": [
            {"month": "Jan", "actual": 1200, "predicted": 1180}, {"month": "Feb", "actual": 1350, "predicted": 1320},
            {"month": "Mar", "actual": 1500, "predicted": 1480}, {"month": "Apr", "actual": 1800, "predicted": 1850},
            {"month": "May", "actual": 2100, "predicted": 2050}, {"month": "Jun", "actual": None, "predicted": 2300},
            {"month": "Jul", "actual": None, "predicted": 2450}, {"month": "Aug", "actual": None, "predicted": 2200},
        ],
        "inventory": [
            {"warehouse": "Jorhat Central", "stock_kg": 45000, "capacity_kg": 60000, "status": "optimal"},
            {"warehouse": "Dibrugarh Unit", "stock_kg": 12000, "capacity_kg": 40000, "status": "low"},
            {"warehouse": "Guwahati Export", "stock_kg": 38000, "capacity_kg": 40000, "status": "excess"},
            {"warehouse": "Tezpur Depot", "stock_kg": 3500, "capacity_kg": 25000, "status": "critical"},
        ],
        "wastage_alerts": [
            {"id": 1, "type": "moisture", "warehouse": "Guwahati Export", "severity": "high", "message": "Humidity at 85% — risk of mold on CTC. Activate dehumidifiers."},
            {"id": 2, "type": "pest", "warehouse": "Tezpur Depot", "severity": "medium", "message": "Pest activity in Lot #TZ-441. Fumigate within 48 hours."},
            {"id": 3, "type": "expiry", "warehouse": "Jorhat Central", "severity": "low", "message": "Lot #JC-228 (Orthodox TGFOP) nearing best-before. Prioritize for auction."},
        ],
    }

@app.get("/api/weather")
async def get_weather_data(authorization: str | None = Header(None)):
    get_current_user(authorization)
    import httpx
    # Jorhat, Assam coordinates
    LAT, LON = 26.75, 94.22
    try:
        async with httpx.AsyncClient(timeout=10) as c:
            r = await c.get(f"https://api.open-meteo.com/v1/forecast?latitude={LAT}&longitude={LON}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia/Kolkata&forecast_days=5")
            w = r.json()
        cur = w.get("current", {})
        daily = w.get("daily", {})
        wmo = {0:"Sunny",1:"Mostly Clear",2:"Partly Cloudy",3:"Overcast",45:"Foggy",48:"Fog",51:"Light Drizzle",53:"Drizzle",55:"Heavy Drizzle",61:"Light Rain",63:"Moderate Rain",65:"Heavy Rain",71:"Light Snow",73:"Snow",75:"Heavy Snow",80:"Light Showers",81:"Showers",82:"Heavy Showers",95:"Thunderstorm",96:"Thunderstorm+Hail",99:"Severe Thunderstorm"}
        cond = wmo.get(cur.get("weather_code",2),"Partly Cloudy")
        temp = cur.get("temperature_2m",28)
        humidity = cur.get("relative_humidity_2m",75)
        rain = cur.get("precipitation",0)
        wind = cur.get("wind_speed_10m",10)
        uv = cur.get("uv_index",5)
        days = ["Today","Tomorrow","Day 3","Day 4","Day 5"]
        forecast = []
        for i in range(min(5, len(daily.get("time",[])))):
            forecast.append({"day": days[i] if i < len(days) else f"Day {i+1}",
                "high": daily["temperature_2m_max"][i], "low": daily["temperature_2m_min"][i],
                "condition": wmo.get(daily["weather_code"][i],"Cloudy"),
                "rain_chance": daily.get("precipitation_probability_max",[0]*5)[i] or 0})
        # Smart garden activities based on real weather
        activities = []
        rain_soon = any(f.get("rain_chance",0)>60 for f in forecast[:2])
        activities.append({"activity":"Plucking","status":"recommended" if not rain_soon else "caution",
            "note":f"Fine plucking (2L+bud) {'ideal now' if not rain_soon else 'OK but monitor rain forecast'}."})
        activities.append({"activity":"Spraying","status":"avoid" if rain_soon else "recommended",
            "note":f"{'Rain expected — delay pesticide 48hrs' if rain_soon else 'Conditions suitable for spraying'}."})
        activities.append({"activity":"Pruning","status":"avoid" if humidity>85 else "caution",
            "note":f"{'High humidity — avoid pruning, infection risk' if humidity>85 else 'Light skiffing OK. Avoid heavy pruning'}."})
        activities.append({"activity":"Fertilization","status":"recommended" if rain_soon else "caution",
            "note":f"{'Apply NPK before rain for absorption' if rain_soon else 'Wait for rain forecast before applying'}."})
        activities.append({"activity":"Drainage","status":"urgent" if rain_soon else "recommended",
            "note":f"{'Clear drains — rain expected soon' if rain_soon else 'Routine drain maintenance recommended'}."})
        alerts = []
        if any(f.get("rain_chance",0)>80 for f in forecast):
            alerts.append({"type":"flood","severity":"warning","message":"Heavy rainfall expected. Ensure drainage in low-lying sections."})
        if humidity > 80:
            alerts.append({"type":"humidity","severity":"advisory","message":f"Humidity at {humidity}% — watch for blister blight and warehouse spoilage."})
        if temp > 35:
            alerts.append({"type":"heat","severity":"warning","message":f"Temperature {temp}°C — ensure shade canopy and irrigate young bushes."})
        if not alerts:
            alerts.append({"type":"info","severity":"advisory","message":"No active weather alerts. Conditions normal for tea cultivation."})
        return {
            "current": {"location":"Jorhat, Assam","temperature":temp,"humidity":humidity,"rainfall_mm":rain,"condition":cond,"wind_speed_kmh":wind,"uv_index":uv},
            "forecast": forecast,
            "garden_activities": activities,
            "alerts": alerts,
            "climate_tips": [
                "Install rain gauges for micro-climate monitoring",
                "Maintain shade canopy at 40-50%",
                "Mulch between rows to prevent erosion",
                "Monitor soil pH monthly — ideal: 4.5-5.5",
            ],
        }
    except Exception:
        # Fallback to mock if API fails
        return {
            "current": {"location":"Jorhat, Assam","temperature":28,"humidity":78,"rainfall_mm":0,"condition":"Partly Cloudy","wind_speed_kmh":14,"uv_index":6},
            "forecast": [{"day":"Today","high":30,"low":22,"condition":"Partly Cloudy","rain_chance":40},{"day":"Tomorrow","high":31,"low":23,"condition":"Light Rain","rain_chance":70},{"day":"Day 3","high":29,"low":21,"condition":"Heavy Rain","rain_chance":90},{"day":"Day 4","high":27,"low":20,"condition":"Thunderstorm","rain_chance":95},{"day":"Day 5","high":30,"low":22,"condition":"Sunny","rain_chance":15}],
            "garden_activities": [{"activity":"Plucking","status":"recommended","note":"Fine plucking ideal now."},{"activity":"Spraying","status":"avoid","note":"Rain expected. Delay 48hrs."},{"activity":"Pruning","status":"caution","note":"Light skiffing OK."},{"activity":"Fertilization","status":"recommended","note":"Apply NPK before rain."},{"activity":"Drainage","status":"urgent","note":"Clear drains before rain."}],
            "alerts": [{"type":"flood","severity":"warning","message":"Heavy rainfall expected."}],
            "climate_tips": ["Install rain gauges","Maintain shade at 40-50%","Mulch between rows","Monitor soil pH: 4.5-5.5"],
        }

@app.get("/api/health")
async def health():
    return {"status": "healthy", "app": "Tealigence"}
