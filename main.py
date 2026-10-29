import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from datetime import datetime, timezone
import math

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PRESET_FARM_IDS = {"farm1", "farm2", "farm3", "farm4"}

# ==============================================================================
# FASTAPI APPLICATION & CORS CONFIGURATION
# ==============================================================================

app = FastAPI(
    title="CropVision Satellite Intelligence API",
    description="Multispectral Satellite Remote Sensing & Agricultural Crop Health API",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# DATA MODELS
# ==============================================================================

class FieldLocation(BaseModel):
    latitude: float
    longitude: float

# ==============================================================================
# FARMS CATALOG & REMOTE SENSING DATA
# ==============================================================================

FARMS = {
    "farm1": {
        "id": "farm1",
        "name": "Farm 01 - Greater Noida (Wheat Belt)",
        "location": "Greater Noida, Uttar Pradesh",
        "locationName": "Greater Noida, Uttar Pradesh",
        "latitude": 28.4744,
        "longitude": 77.5040,
        "lat": 28.4744,
        "lng": 77.5040,
        "crop": "Sharbati Wheat",
        "stage": "Tillering / Heading",
        "area": "48.5 Hectares",
        "sowing_date": "15 Nov 2025",
        "sowingDate": "15 Nov 2025",
        "ndvi": 0.82,
        "ndwi": 0.34,
        "savi": 0.74,
        "health_score": 84,
        "healthScore": 84,
        "health_status": "Healthy",
        "healthStatus": "Healthy",
        "cloud_cover": "0.8%",
        "cloudCover": "0.8%",
        "weather": {
            "temp": "28.4°C",
            "humidity": "56%",
            "soilMoisture": "34%",
            "et": "4.2 mm/day",
            "wind": "8 km/h"
        },
        "submetrics": {
            "chlorophyll": 88,
            "water": 74,
            "nitrogen": 82
        },
        "advice": "Canopy growth is in peak tillering. Photosynthetic absorption is optimal. Recommended next light irrigation in 4 days before ear emergence.",
        "boundary": [
            [28.4715, 77.5005],
            [28.4775, 77.5015],
            [28.4780, 77.5075],
            [28.4720, 77.5070]
        ],
        "zones": [
            { "name": "Sector A (North)", "ndvi": 0.86, "color": "#10b981", "coords": [[28.4750, 77.5015], [28.4778, 77.5018], [28.4776, 77.5073], [28.4752, 77.5071]] },
            { "name": "Sector B (South)", "ndvi": 0.78, "color": "#34d399", "coords": [[28.4717, 77.5007], [28.4748, 77.5014], [28.4750, 77.5070], [28.4722, 77.5068]] }
        ]
    },
    "farm2": {
        "id": "farm2",
        "name": "Farm 02 - Delhi NCR (Mustard & Legumes)",
        "location": "IARI Pusa Belt, Delhi",
        "locationName": "IARI Pusa Belt, Delhi",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "lat": 28.6139,
        "lng": 77.2090,
        "crop": "Yellow Mustard & Gram",
        "stage": "Siliqua Formation",
        "area": "32.0 Hectares",
        "sowing_date": "28 Oct 2025",
        "sowingDate": "28 Oct 2025",
        "ndvi": 0.63,
        "ndwi": 0.18,
        "savi": 0.58,
        "health_score": 65,
        "healthScore": 65,
        "health_status": "Moderate",
        "healthStatus": "Moderate",
        "cloud_cover": "1.4%",
        "cloudCover": "1.4%",
        "weather": {
            "temp": "30.1°C",
            "humidity": "48%",
            "soilMoisture": "23%",
            "et": "4.8 mm/day",
            "wind": "11 km/h"
        },
        "submetrics": {
            "chlorophyll": 68,
            "water": 54,
            "nitrogen": 70
        },
        "advice": "Western sectors show slight soil moisture deficit (NDWI 0.18). Schedule supplemental drip cycle to preserve seed filling.",
        "boundary": [
            [28.6105, 77.2050],
            [28.6170, 77.2065],
            [28.6165, 77.2135],
            [28.6110, 77.2120]
        ],
        "zones": [
            { "name": "Zone 1 (Vigorous)", "ndvi": 0.72, "color": "#10b981", "coords": [[28.6135, 77.2060], [28.6168, 77.2068], [28.6163, 77.2132], [28.6138, 77.2128]] },
            { "name": "Zone 2 (Moisture Stress)", "ndvi": 0.54, "color": "#f59e0b", "coords": [[28.6108, 77.2052], [28.6133, 77.2059], [28.6136, 77.2126], [28.6112, 77.2118]] }
        ]
    },
    "farm3": {
        "id": "farm3",
        "name": "Farm 03 - Punjab (Basmati Rice & Grain)",
        "location": "Ludhiana Agri Zone, Punjab",
        "locationName": "Ludhiana Agri Zone, Punjab",
        "latitude": 30.9010,
        "longitude": 75.8573,
        "lat": 30.9010,
        "lng": 75.8573,
        "crop": "Basmati Rice & Wheat",
        "stage": "Vegetative Maturation",
        "area": "65.2 Hectares",
        "sowing_date": "05 Nov 2025",
        "sowingDate": "05 Nov 2025",
        "ndvi": 0.78,
        "ndwi": 0.42,
        "savi": 0.76,
        "health_score": 81,
        "healthScore": 81,
        "health_status": "Healthy",
        "healthStatus": "Healthy",
        "cloud_cover": "0.4%",
        "cloudCover": "0.4%",
        "weather": {
            "temp": "26.8°C",
            "humidity": "65%",
            "soilMoisture": "42%",
            "et": "3.7 mm/day",
            "wind": "7 km/h"
        },
        "submetrics": {
            "chlorophyll": 84,
            "water": 82,
            "nitrogen": 79
        },
        "advice": "Ample canopy hydration and robust leaf nitrogen concentration. Weed pressure is negligible.",
        "boundary": [
            [30.8970, 75.8520],
            [30.9050, 75.8535],
            [30.9045, 75.8625],
            [30.8975, 75.8610]
        ],
        "zones": [
            { "name": "Paddy Block Alpha", "ndvi": 0.81, "color": "#10b981", "coords": [[30.9010, 75.8528], [30.9048, 75.8538], [30.9042, 75.8622], [30.9012, 75.8618]] },
            { "name": "Paddy Block Beta", "ndvi": 0.75, "color": "#34d399", "coords": [[30.8972, 75.8522], [30.9008, 75.8527], [30.9010, 75.8616], [30.8977, 75.8608]] }
        ]
    },
    "farm4": {
        "id": "farm4",
        "name": "Farm 04 - Nashik (Vineyard & Horticulture)",
        "location": "Dindori Agri Valley, Nashik",
        "locationName": "Dindori Agri Valley, Nashik",
        "latitude": 20.0059,
        "longitude": 73.7910,
        "lat": 20.0059,
        "lng": 73.7910,
        "crop": "Table Grapes & Pomegranate",
        "stage": "Berry Development",
        "area": "24.8 Hectares",
        "sowing_date": "12 Oct 2025",
        "sowingDate": "12 Oct 2025",
        "ndvi": 0.71,
        "ndwi": 0.29,
        "savi": 0.69,
        "health_score": 76,
        "healthScore": 76,
        "health_status": "Healthy",
        "healthStatus": "Healthy",
        "cloud_cover": "1.0%",
        "cloudCover": "1.0%",
        "weather": {
            "temp": "29.2°C",
            "humidity": "52%",
            "soilMoisture": "31%",
            "et": "4.5 mm/day",
            "wind": "9 km/h"
        },
        "submetrics": {
            "chlorophyll": 78,
            "water": 72,
            "nitrogen": 75
        },
        "advice": "Trellis canopy shows uniform greenness. Micro-irrigation schedule is performing to target benchmarks.",
        "boundary": [
            [20.0025, 73.7870],
            [20.0090, 73.7885],
            [20.0085, 73.7950],
            [20.0030, 73.7940]
        ],
        "zones": [
            { "name": "Vineyard North Rows", "ndvi": 0.74, "color": "#10b981", "coords": [[20.0058, 73.7878], [20.0088, 73.7887], [20.0083, 73.7948], [20.0060, 73.7945]] },
            { "name": "Vineyard South Rows", "ndvi": 0.68, "color": "#34d399", "coords": [[20.0027, 73.7872], [20.0056, 73.7877], [20.0058, 73.7943], [20.0032, 73.7938]] }
        ]
    }
}

# ==============================================================================
# ALGORITHMIC HELPER FUNCTIONS
# ==============================================================================

def classify_crop_health(ndvi: float):
    if ndvi >= 0.70:
        return (
            "Healthy",
            int(ndvi * 100),
            "Vegetation exhibits robust photosynthetic vigor and dense canopy development."
        )
    elif ndvi >= 0.50:
        return (
            "Moderate",
            int(ndvi * 100),
            "Canopy density is moderate. Supplemental nutrition or irrigation advised."
        )
    else:
        return (
            "Stressed",
            int(ndvi * 100),
            "Low chlorophyll reflection detected. Urgent field inspection recommended."
        )

# ==============================================================================
# API ENDPOINTS
# ==============================================================================

def _status():
    return {
        "platform": "CropVision Satellite AI",
        "status": "online",
        "version": "2.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/health")
def health():
    return _status()

def _serve(filename: str):
    path = os.path.join(BASE_DIR, filename)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail=f"{filename} not found next to main.py")
    return FileResponse(path)

@app.get("/")
def home():
    # Serve the landing page if present, otherwise fall back to the JSON status
    if os.path.isfile(os.path.join(BASE_DIR, "index.html")):
        return _serve("index.html")
    return _status()

@app.get("/index.html", include_in_schema=False)
def index_page():
    return _serve("index.html")

@app.get("/dashboard.html", include_in_schema=False)
def dashboard_page():
    return _serve("dashboard.html")

@app.get("/app.js", include_in_schema=False)
def app_js():
    return _serve("app.js")

@app.get("/style.css", include_in_schema=False)
def style_css():
    return _serve("style.css")

@app.get("/api/farms")
def get_all_farms():
    return list(FARMS.values())

@app.get("/api/farm/{farm_id}")
def get_farm(farm_id: str):
    if farm_id not in FARMS:
        raise HTTPException(status_code=404, detail="Farm not found")
    return FARMS[farm_id]

@app.get("/api/dashboard")
def get_dashboard_summary(farm_id: str = "farm1"):
    farm = FARMS.get(farm_id)
    if farm is None:
        raise HTTPException(status_code=404, detail="Farm not found")
    status, score, desc = classify_crop_health(farm["ndvi"])

    return {
        "ndvi": farm["ndvi"],
        "ndwi": farm["ndwi"],
        "savi": farm["savi"],
        "health_status": status,
        "health_score": score,
        "health_description": desc,
        "observation_date": datetime.now(timezone.utc).strftime("%d %b %Y"),
        "last_update": datetime.now(timezone.utc).strftime("Today, %I:%M %p UTC"),
        "weather": farm["weather"],
        "submetrics": farm["submetrics"]
    }

@app.post("/api/analyze")
def analyze_field_coordinates(location: FieldLocation):
    # Deterministic spatial analysis - same formula as the dashboard's map-click sampler
    raw = math.sin(location.latitude * 12.9898 + location.longitude * 78.233) * 43758.5453
    pseudo = raw - math.floor(raw)
    ndvi = round(0.45 + pseudo * 0.44, 2)
    ndwi = round(-0.1 + pseudo * 0.55, 2)
    savi = round(ndvi * 0.9, 2)

    status, score, desc = classify_crop_health(ndvi)

    return {
        "latitude": location.latitude,
        "longitude": location.longitude,
        "ndvi": ndvi,
        "ndwi": ndwi,
        "savi": savi,
        "health_status": status,
        "health_score": score,
        "healthStatus": status,
        "healthScore": score,
        "health_description": desc,
        "observation_date": datetime.now(timezone.utc).strftime("%d %b %Y"),
        "last_update": datetime.now(timezone.utc).strftime("Today, %I:%M %p UTC")
    }

@app.post("/api/farms")
def create_farm(farm_data: dict):
    farm_id = str(farm_data.get("id") or f"custom_farm_{int(datetime.now().timestamp())}")
    if farm_id in PRESET_FARM_IDS:
        raise HTTPException(status_code=409, detail="Preset farms cannot be overwritten")
    farm_data["id"] = farm_id
    FARMS[farm_id] = farm_data
    return {"status": "success", "farm_id": farm_id, "data": farm_data}

@app.post("/api/crops")
def create_crop(crop_data: dict):
    return {"status": "success", "crop": crop_data}

@app.post("/api/calculator/roi")
def calculate_roi(payload: dict):
    try:
        base_yield = float(payload.get("base_yield", 40))
        area_ha = float(payload.get("area_ha", 40))
        ndvi = float(payload.get("ndvi", 0.82))
        price_per_qtl = float(payload.get("price_per_qtl", 2275))
    except (TypeError, ValueError):
        raise HTTPException(status_code=422, detail="base_yield, area_ha, ndvi and price_per_qtl must be numbers")
    if base_yield < 0 or area_ha < 0 or price_per_qtl < 0 or not (-1 <= ndvi <= 1):
        raise HTTPException(status_code=422, detail="Values must be non-negative and ndvi must be between -1 and 1")
    irrigation = str(payload.get("irrigation", "drip")).lower()

    irrig_mult = 1.12 if irrigation == "drip" else (1.06 if irrigation == "sprinkler" else (0.90 if irrigation == "rainfed" else 1.0))
    ndvi_yield_mult = max(0.60, min(1.30, 1 + ((ndvi - 0.65) * 0.75)))
    yield_per_ha = round(base_yield * ndvi_yield_mult * irrig_mult, 1)
    total_yield = round(yield_per_ha * area_ha)
    gross_revenue = round(total_yield * price_per_qtl)
    fert_savings = round(area_ha * (3800 if ndvi >= 0.70 else 2500))

    return {
        "yield_per_ha": yield_per_ha,
        "total_yield_quintals": total_yield,
        "gross_revenue": gross_revenue,
        "fertilizer_savings": fert_savings
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)