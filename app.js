/* ==========================================================================
   CropVision - Precision Satellite Agriculture Intelligence Engine (app.js)
   ========================================================================== */

const API_URL = "http://127.0.0.1:8000";

// Global GIS & State Variables
let map = null;
let currentMarker = null;
let ndviChart = null;
let currentBaseLayer = "satellite";
let baseLayers = {};
let farmBoundaryLayer = null;
let ndviHeatmapLayer = null;
let isNDVIOverlayVisible = true;
let isBoundaryVisible = true;
let currentTimeframe = 3; // Months
let currentFarmData = null;
let lastClickedCoords = null;
let activeAreaFilter = "all";

// Preset Farms Catalog with GeoJSON Polygon Boundaries
let FARMS_DATABASE = {
    farm1: {
        id: "farm1",
        name: "Farm 01 - Greater Noida (Wheat Belt)",
        locationName: "Greater Noida, Uttar Pradesh",
        lat: 28.4744,
        lng: 77.5040,
        crop: "Sharbati Wheat",
        stage: "Tillering / Heading",
        area: "48.5 Hectares",
        sowingDate: "15 Nov 2025",
        ndvi: 0.82,
        ndwi: 0.34,
        savi: 0.74,
        healthScore: 84,
        healthStatus: "Healthy",
        cloudCover: "0.8%",
        weather: { temp: "28.4°C", humidity: "56%", soilMoisture: "34%", et: "4.2 mm/day", wind: "8 km/h" },
        submetrics: { chlorophyll: 88, water: 74, nitrogen: 82 },
        advice: "Canopy growth is in peak tillering. Photosynthetic absorption is optimal. Recommended next light irrigation in 4 days before ear emergence.",
        boundary: [
            [28.4715, 77.5005],
            [28.4775, 77.5015],
            [28.4780, 77.5075],
            [28.4720, 77.5070]
        ],
        zones: [
            { name: "Sector A (North)", ndvi: 0.86, color: "#10b981", coords: [[28.4750, 77.5015], [28.4778, 77.5018], [28.4776, 77.5073], [28.4752, 77.5071]] },
            { name: "Sector B (South)", ndvi: 0.78, color: "#34d399", coords: [[28.4717, 77.5007], [28.4748, 77.5014], [28.4750, 77.5070], [28.4722, 77.5068]] }
        ]
    },
    farm2: {
        id: "farm2",
        name: "Farm 02 - Delhi NCR (Mustard & Legumes)",
        locationName: "IARI Pusa Belt, Delhi",
        lat: 28.6139,
        lng: 77.2090,
        crop: "Yellow Mustard & Gram",
        stage: "Siliqua Formation",
        area: "32.0 Hectares",
        sowingDate: "28 Oct 2025",
        ndvi: 0.63,
        ndwi: 0.18,
        savi: 0.58,
        healthScore: 65,
        healthStatus: "Moderate",
        cloudCover: "1.4%",
        weather: { temp: "30.1°C", humidity: "48%", soilMoisture: "23%", et: "4.8 mm/day", wind: "11 km/h" },
        submetrics: { chlorophyll: 68, water: 54, nitrogen: 70 },
        advice: "Western sectors show slight soil moisture deficit (NDWI 0.18). Schedule supplemental drip cycle to preserve seed filling.",
        boundary: [
            [28.6105, 77.2050],
            [28.6170, 77.2065],
            [28.6165, 77.2135],
            [28.6110, 77.2120]
        ],
        zones: [
            { name: "Zone 1 (Vigorous)", ndvi: 0.72, color: "#10b981", coords: [[28.6135, 77.2060], [28.6168, 77.2068], [28.6163, 77.2132], [28.6138, 77.2128]] },
            { name: "Zone 2 (Moisture Stress)", ndvi: 0.54, color: "#f59e0b", coords: [[28.6108, 77.2052], [28.6133, 77.2059], [28.6136, 77.2126], [28.6112, 77.2118]] }
        ]
    },
    farm3: {
        id: "farm3",
        name: "Farm 03 - Punjab (Basmati Rice & Grain)",
        locationName: "Ludhiana Agri Zone, Punjab",
        lat: 30.9010,
        lng: 75.8573,
        crop: "Basmati Rice & Wheat",
        stage: "Vegetative Maturation",
        area: "65.2 Hectares",
        sowingDate: "05 Nov 2025",
        ndvi: 0.78,
        ndwi: 0.42,
        savi: 0.76,
        healthScore: 81,
        healthStatus: "Healthy",
        cloudCover: "0.4%",
        weather: { temp: "26.8°C", humidity: "65%", soilMoisture: "42%", et: "3.7 mm/day", wind: "7 km/h" },
        submetrics: { chlorophyll: 84, water: 82, nitrogen: 79 },
        advice: "Ample canopy hydration and robust leaf nitrogen concentration. Weed pressure is negligible.",
        boundary: [
            [30.8970, 75.8520],
            [30.9050, 75.8535],
            [30.9045, 75.8625],
            [30.8975, 75.8610]
        ],
        zones: [
            { name: "Paddy Block Alpha", ndvi: 0.81, color: "#10b981", coords: [[30.9010, 75.8528], [30.9048, 75.8538], [30.9042, 75.8622], [30.9012, 75.8618]] },
            { name: "Paddy Block Beta", ndvi: 0.75, color: "#34d399", coords: [[30.8972, 75.8522], [30.9008, 75.8527], [30.9010, 75.8616], [30.8977, 75.8608]] }
        ]
    },
    farm4: {
        id: "farm4",
        name: "Farm 04 - Nashik (Vineyard & Horticulture)",
        locationName: "Dindori Agri Valley, Nashik",
        lat: 20.0059,
        lng: 73.7910,
        crop: "Table Grapes & Pomegranate",
        stage: "Berry Development",
        area: "24.8 Hectares",
        sowingDate: "12 Oct 2025",
        ndvi: 0.71,
        ndwi: 0.29,
        savi: 0.69,
        healthScore: 76,
        healthStatus: "Healthy",
        cloudCover: "1.0%",
        weather: { temp: "29.2°C", humidity: "52%", soilMoisture: "31%", et: "4.5 mm/day", wind: "9 km/h" },
        submetrics: { chlorophyll: 78, water: 72, nitrogen: 75 },
        advice: "Trellis canopy shows uniform greenness. Micro-irrigation schedule is performing to target benchmarks.",
        boundary: [
            [20.0025, 73.7870],
            [20.0090, 73.7885],
            [20.0085, 73.7950],
            [20.0030, 73.7940]
        ],
        zones: [
            { name: "Vineyard North Rows", ndvi: 0.74, color: "#10b981", coords: [[20.0058, 73.7878], [20.0088, 73.7887], [20.0083, 73.7948], [20.0060, 73.7945]] },
            { name: "Vineyard South Rows", ndvi: 0.68, color: "#34d399", coords: [[20.0027, 73.7872], [20.0056, 73.7877], [20.0058, 73.7943], [20.0032, 73.7938]] }
        ]
    }
};

// Master Crop Registry Catalog with Regional Suitability
const DEFAULT_CROPS = [
    {
        id: "crop_wheat",
        name: "Sharbati Wheat",
        category: "Cereal",
        areas: ["Greater Noida, Uttar Pradesh", "Delhi NCR", "Ludhiana Agri Zone, Punjab", "Karnal Agro Belt, Haryana"],
        season: "Rabi (Winter)",
        ndviRange: "0.78 - 0.88",
        water: "Medium",
        duration: "120 - 130 Days",
        stage: "Tillering / Heading",
        icon: "🌾",
        farmId: "farm1",
        notes: "High gluten index wheat. Requires timely first irrigation at crown root initiation."
    },
    {
        id: "crop_mustard",
        name: "Yellow Mustard & Gram",
        category: "Oilseed",
        areas: ["IARI Pusa Belt, Delhi", "Greater Noida, Uttar Pradesh", "Karnal Agro Belt, Haryana"],
        season: "Rabi (Winter)",
        ndviRange: "0.60 - 0.72",
        water: "Low",
        duration: "105 - 115 Days",
        stage: "Siliqua Formation",
        icon: "🌱",
        farmId: "farm2",
        notes: "High oil content (42%). Requires monitoring for aphid infestation during flowering."
    },
    {
        id: "crop_basmati",
        name: "Basmati Rice & Wheat",
        category: "Cereal",
        areas: ["Ludhiana Agri Zone, Punjab", "Karnal Agro Belt, Haryana", "Greater Noida, Uttar Pradesh"],
        season: "Kharif (Monsoon)",
        ndviRange: "0.74 - 0.85",
        water: "Saturated",
        duration: "135 - 150 Days",
        stage: "Vegetative Maturation",
        icon: "🌾",
        farmId: "farm3",
        notes: "Long slender aromatic grain. Saturated canopy with AWD (alternate wetting and drying)."
    },
    {
        id: "crop_grapes",
        name: "Table Grapes & Pomegranate",
        category: "Horticulture",
        areas: ["Dindori Agri Valley, Nashik", "Pune Agri Valley, Maharashtra"],
        season: "Perennial / All Season",
        ndviRange: "0.68 - 0.76",
        water: "Medium",
        duration: "150 - 180 Days",
        stage: "Berry Development",
        icon: "🍇",
        farmId: "farm4",
        notes: "Export-grade Thompson Seedless. Sub-surface drip irrigation with canopy micro-pruning."
    },
    {
        id: "crop_cotton",
        name: "Bt Cotton (Hybrid-9)",
        category: "Cash Crop",
        areas: ["Ludhiana Agri Zone, Punjab", "Karnal Agro Belt, Haryana", "Pune Agri Valley, Maharashtra"],
        season: "Kharif (Monsoon)",
        ndviRange: "0.72 - 0.84",
        water: "Medium",
        duration: "150 - 165 Days",
        stage: "Boll Formation",
        icon: "☁️",
        farmId: null,
        notes: "High boll retention and fiber length. Sensitive to waterlogging in early squaring phase."
    },
    {
        id: "crop_sugarcane",
        name: "Sugarcane (Co-0238)",
        category: "Cash Crop",
        areas: ["Greater Noida, Uttar Pradesh", "Ludhiana Agri Zone, Punjab", "Pune Agri Valley, Maharashtra"],
        season: "Perennial / All Season",
        ndviRange: "0.75 - 0.90",
        water: "High",
        duration: "300 - 360 Days",
        stage: "Grand Growth",
        icon: "🎋",
        farmId: null,
        notes: "High sucrose recovery (12.2%). Heavy biomass feeder requiring balanced NPK ratio."
    },
    {
        id: "crop_gram",
        name: "Chickpea / Desi Chana",
        category: "Pulses",
        areas: ["IARI Pusa Belt, Delhi", "Karnal Agro Belt, Haryana", "Greater Noida, Uttar Pradesh"],
        season: "Rabi (Winter)",
        ndviRange: "0.58 - 0.70",
        water: "Low",
        duration: "100 - 115 Days",
        stage: "Pod Development",
        icon: "🌿",
        farmId: null,
        notes: "Nitrogen-fixing legume with high drought resilience. Needs minimal supplemental watering."
    },
    {
        id: "crop_sunflower",
        name: "Sunflower Gold Hybrid",
        category: "Oilseed",
        areas: ["Ludhiana Agri Zone, Punjab", "Dindori Agri Valley, Nashik"],
        season: "Zaid (Summer)",
        ndviRange: "0.65 - 0.78",
        water: "Medium",
        duration: "90 - 100 Days",
        stage: "Ray Florets Opening",
        icon: "🌻",
        farmId: null,
        notes: "Short-duration summer cash crop. High oleic acid content with moderate water use efficiency."
    }
];

let CROPS_DATABASE = [...DEFAULT_CROPS];

// Storage Synchronization
function initStorageData() {
    // Merge custom farms
    try {
        const savedFarms = localStorage.getItem("cropvision_custom_farms");
        if (savedFarms) {
            const parsed = JSON.parse(savedFarms);
            Object.assign(FARMS_DATABASE, parsed);
        }
    } catch (e) {
        console.error("Failed loading saved farms:", e);
    }

    // Merge custom crops
    try {
        const savedCrops = localStorage.getItem("cropvision_custom_crops");
        if (savedCrops) {
            const parsed = JSON.parse(savedCrops);
            parsed.forEach(c => {
                if (!CROPS_DATABASE.some(existing => existing.id === c.id)) {
                    CROPS_DATABASE.push(c);
                }
            });
        }
    } catch (e) {
        console.error("Failed loading saved crops:", e);
    }
}

/* ==========================================================================
   APP INITIALIZATION
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Restore saved theme
    if (localStorage.getItem("cropvision_theme") === "light") {
        document.body.classList.add("light-theme");
    }

    // Initialize custom farms & crops from localStorage
    initStorageData();

    // Populate Dynamic Farm Select Ribbon
    populateFarmDropdown();

    // Populate Dynamic Crop options in Add Field Form
    populateCropDropdown();

    // Initialize GIS Leaflet Map
    initializeMap();

    // Check if landing page pre-selected a farm
    const preselected = sessionStorage.getItem("selected_farm");
    const initialFarm = (preselected && FARMS_DATABASE[preselected]) ? preselected : "farm1";

    const selectElem = document.getElementById("farmSelect");
    if (selectElem) {
        selectElem.value = initialFarm;
        selectElem.addEventListener("change", function () {
            loadFarmData(this.value);
            // Show delete button only for custom farms
            const deleteBtn = document.getElementById("deleteFarmBtn");
            if (deleteBtn) deleteBtn.style.display = this.value.startsWith("custom_farm_") ? "inline-flex" : "none";
        });
    }

    // Load initial farm
    loadFarmData(initialFarm);
    const initialDeleteBtn = document.getElementById("deleteFarmBtn");
    if (initialDeleteBtn) initialDeleteBtn.style.display = initialFarm.startsWith("custom_farm_") ? "inline-flex" : "none";

    // Initialize Crop & Area Registry View
    renderAreaFilterPills();
    renderCropRegistry();

    // Initialize Yield & Harvest ROI Calculator
    if (typeof runHarvestROICalculation === "function") {
        runHarvestROICalculation();
    }

    // Check if landing page requested opening Add Field Modal
    if (sessionStorage.getItem("open_add_field_modal") === "true") {
        sessionStorage.removeItem("open_add_field_modal");
        setTimeout(openAddFieldModal, 400);
    }

    // Ping backend to show live API badge status
    checkBackendConnection();
});

/* ==========================================================================
   GIS MAP ENGINE (LEAFLET + SATELLITE + HEATMAPS)
   ========================================================================== */

function initializeMap() {
    const mapElement = document.getElementById("map");
    if (!mapElement) return;

    // Leaflet comes from a CDN; if it failed to load, keep the rest of the dashboard working
    if (typeof L === "undefined") {
        console.warn("Leaflet failed to load - map disabled.");
        mapElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;padding:20px;text-align:center;color:#94a3b8;">Map could not be loaded. Check your internet connection and refresh.</div>';
        return;
    }

    // Default center at Greater Noida
    const defaultCoords = [28.4744, 77.5040];

    map = L.map("map", {
        center: defaultCoords,
        zoom: 14,
        zoomControl: false,
        attributionControl: false
    });

    // Custom positioned zoom control
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // High-Res Esri World Satellite Tile Layer
    baseLayers.satellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
            maxZoom: 19,
            attribution: "Esri, Maxar, Earthstar Geographics"
        }
    );

    // Clean Topographic / Street Map Layer
    baseLayers.street = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
            maxZoom: 19,
            subdomains: "abcd",
            attribution: "&copy; OpenStreetMap contributors &copy; CARTO"
        }
    );

    // Add satellite layer by default
    baseLayers.satellite.addTo(map);

    // Precision Pin Icon
    const customPin = L.divIcon({
        className: "custom-gis-pin",
        html: `
            <div style="position:relative; display:flex; align-items:center; justify-content:center; width:34px; height:34px;">
                <span style="position:absolute; width:34px; height:34px; border-radius:50%; background:rgba(16,185,129,0.35); animation:pulseGlow 2s infinite;"></span>
                <span style="position:relative; width:16px; height:16px; border-radius:50%; background:#10b981; border:3px solid #ffffff; box-shadow:0 0 12px #10b981;"></span>
            </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
    });

    currentMarker = L.marker(defaultCoords, { icon: customPin }).addTo(map);

    // User Interactive Click on Map (supports both coordinate inspection & drawing)
    map.on("click", function (e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        if (isDrawingBoundary) {
            handleDrawMapClick(lat, lng);
        } else {
            handleMapCoordinateClick(lat, lng);
        }
    });
}

function setMapBaseLayer(layerType) {
    if (!map || layerType === currentBaseLayer) return;

    if (layerType === "satellite") {
        map.removeLayer(baseLayers.street);
        baseLayers.satellite.addTo(map);
        document.getElementById("btnLayerSat").classList.add("active");
        document.getElementById("btnLayerStreet").classList.remove("active");
        currentBaseLayer = "satellite";
    } else {
        map.removeLayer(baseLayers.satellite);
        baseLayers.street.addTo(map);
        document.getElementById("btnLayerStreet").classList.add("active");
        document.getElementById("btnLayerSat").classList.remove("active");
        currentBaseLayer = "street";
    }
}

function toggleNDVIOverlay() {
    isNDVIOverlayVisible = !isNDVIOverlayVisible;
    const btn = document.getElementById("btnLayerNDVI");
    if (btn) btn.classList.toggle("active", isNDVIOverlayVisible);

    if (ndviHeatmapLayer) {
        if (isNDVIOverlayVisible) {
            ndviHeatmapLayer.addTo(map);
        } else {
            map.removeLayer(ndviHeatmapLayer);
        }
    }
}

function toggleFarmBoundary() {
    isBoundaryVisible = !isBoundaryVisible;
    const btn = document.getElementById("btnLayerBoundary");
    if (btn) btn.classList.toggle("active", isBoundaryVisible);

    if (farmBoundaryLayer) {
        if (isBoundaryVisible) {
            farmBoundaryLayer.addTo(map);
        } else {
            map.removeLayer(farmBoundaryLayer);
        }
    }
}

/* ==========================================================================
   FARM DATA LOADER & GEO-POLYGON RENDERER
   ========================================================================== */

async function loadFarmData(farmId) {
    const farm = FARMS_DATABASE[farmId] || FARMS_DATABASE["farm1"];
    currentFarmData = farm;

    // Update Coordinate Readout
    updateCoordinatesDisplay(farm.lat, farm.lng);

    // Update Meta Pills
    const cropElem = document.getElementById("farmCropType");
    const areaElem = document.getElementById("farmArea");
    const stageElem = document.getElementById("farmStage");
    if (cropElem) cropElem.innerText = farm.crop;
    if (areaElem) areaElem.innerText = farm.area;
    if (stageElem) stageElem.innerText = farm.stage;

    // Pan map to Farm
    if (map) {
        map.flyTo([farm.lat, farm.lng], 14, { duration: 1.2 });
        currentMarker.setLatLng([farm.lat, farm.lng]);
        currentMarker.bindPopup(`
            <div style="font-family:'Inter',sans-serif; padding:4px;">
                <strong style="color:#0f2015; font-size:13px;">${farm.name}</strong><br>
                <span style="color:#4a6252; font-size:11px;">${farm.locationName}</span><br>
                <div style="margin-top:6px; color:#059669; font-weight:700; font-size:12px;">NDVI Vigor: ${farm.ndvi}</div>
            </div>
        `).openPopup();

        // Render Farm Boundary Polygon
        renderFarmBoundaries(farm);
    }

    // Try fetching live data from FastAPI backend if available
    try {
        const response = await fetch(`${API_URL}/api/farm/${farmId}`, { signal: AbortSignal.timeout(1800) });
        if (response.ok) {
            const apiData = await response.json();
            applyDataToDashboard({ ...farm, ...apiData });
            fetchLiveWeatherData(farm.lat, farm.lng);
            updateCropBotContext();
            return;
        }
    } catch (err) {
        // Fallback gracefully to built-in telemetry simulation
    }

    applyDataToDashboard(farm);
    fetchLiveWeatherData(farm.lat, farm.lng);
    updateCropBotContext();
}

function renderFarmBoundaries(farm) {
    // Remove previous boundary
    if (farmBoundaryLayer) {
        map.removeLayer(farmBoundaryLayer);
    }
    // Remove previous NDVI layer
    if (ndviHeatmapLayer) {
        map.removeLayer(ndviHeatmapLayer);
    }

    // Draw main Farm Boundary polygon
    farmBoundaryLayer = L.polygon(farm.boundary, {
        color: "#10b981",
        weight: 2.5,
        opacity: 0.9,
        dashArray: "6, 6",
        fillColor: "transparent"
    });

    if (isBoundaryVisible) {
        farmBoundaryLayer.addTo(map);
    }

    // Draw NDVI Management Zones Heatmap Polygons
    const zoneLayers = farm.zones.map(z => {
        return L.polygon(z.coords, {
            color: z.color,
            weight: 1.5,
            fillColor: z.color,
            fillOpacity: 0.35
        }).bindPopup(`
            <div style="font-family:'Inter',sans-serif;">
                <strong>${z.name}</strong><br>
                <span>Sector NDVI: <b>${z.ndvi}</b></span>
            </div>
        `);
    });

    ndviHeatmapLayer = L.layerGroup(zoneLayers);
    if (isNDVIOverlayVisible) {
        ndviHeatmapLayer.addTo(map);
    }
}

/* ==========================================================================
   DYNAMIC MAP POINT-AND-ANALYZE
   ========================================================================== */

async function handleMapCoordinateClick(lat, lng) {
    lastClickedCoords = { lat, lng };
    updateCoordinatesDisplay(lat, lng);
    currentMarker.setLatLng([lat, lng]);

    // Calculate deterministic spatial vegetative metrics based on coordinates
    const seed = Math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453;
    const pseudoRandom = seed - Math.floor(seed);

    const sampledNDVI = parseFloat((0.45 + pseudoRandom * 0.44).toFixed(2));
    const sampledNDWI = parseFloat((-0.1 + pseudoRandom * 0.55).toFixed(2));
    const sampledSAVI = parseFloat((sampledNDVI * 0.9).toFixed(2));
    const healthScore = Math.round(sampledNDVI * 100);

    let status = "Healthy";
    let statusClass = "status-healthy";
    let advice = "Vegetation shows robust vigor. Optimal photosynthesis and adequate moisture.";
    if (sampledNDVI < 0.50) {
        status = "Stressed";
        statusClass = "status-stressed";
        advice = "Low chlorophyll reflection detected. Field ground inspection and irrigation are strongly recommended.";
    } else if (sampledNDVI < 0.70) {
        status = "Moderate";
        statusClass = "status-moderate";
        advice = "Canopy density is moderate. Consider targeted nutrient application in dry pockets.";
    }

    const clickedData = {
        name: `Selected Coordinates`,
        crop: currentFarmData ? currentFarmData.crop : "Field Crops",
        area: "Sampled Zone",
        stage: "Active Scan",
        lat: lat,
        lng: lng,
        ndvi: sampledNDVI,
        ndwi: sampledNDWI,
        savi: sampledSAVI,
        healthScore: healthScore,
        healthStatus: status,
        cloudCover: "0.6%",
        weather: {
            temp: `${(26 + pseudoRandom * 6).toFixed(1)}°C`,
            humidity: `${Math.round(45 + pseudoRandom * 30)}%`,
            soilMoisture: `${Math.round(20 + pseudoRandom * 25)}%`,
            et: `${(3.5 + pseudoRandom * 1.8).toFixed(1)} mm/day`,
            wind: `${Math.round(6 + pseudoRandom * 8)} km/h`
        },
        submetrics: {
            chlorophyll: Math.min(96, Math.round(healthScore * 1.05)),
            water: Math.min(92, Math.round(40 + sampledNDWI * 80)),
            nitrogen: Math.min(94, Math.round(healthScore * 0.98))
        },
        advice: advice
    };

    currentMarker.bindPopup(`
        <div style="font-family:'Inter',sans-serif; padding:4px;">
            <strong style="font-size:12px;">Sampled Coordinate</strong><br>
            <span style="font-size:11px; color:#64748b;">${lat.toFixed(5)}, ${lng.toFixed(5)}</span><br>
            <div style="margin-top:6px; font-weight:700; color:#10b981;">NDVI: ${sampledNDVI} (${status})</div>
        </div>
    `).openPopup();

    applyDataToDashboard(clickedData);
    fetchLiveWeatherData(lat, lng);
    updateCropBotContext();

    // Try posting to backend /api/analyze if active
    try {
        await fetch(`${API_URL}/api/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude: lat, longitude: lng })
        });
    } catch (e) {
        // Standalone engine handles everything cleanly
    }
}

function updateCoordinatesDisplay(lat, lng) {
    const elem = document.getElementById("coordinates");
    if (elem) {
        elem.innerText = `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
}

/* ==========================================================================
   DASHBOARD TELEMETRY BINDINGS & ANIMATIONS
   ========================================================================== */

function applyDataToDashboard(data) {
    // KPI Values
    const ndvi = data.ndvi !== undefined ? data.ndvi : 0.80;
    const ndwi = data.ndwi !== undefined ? data.ndwi : 0.30;
    const savi = data.savi !== undefined ? data.savi : 0.72;

    setText("ndviValue", ndvi.toFixed(2));
    setText("ndwiValue", ndwi.toFixed(2));
    setText("saviValue", savi.toFixed(2));

    // Dynamic NDVI Delta (simulated vs previous pass using farm-seeded value)
    const prevNDVI = parseFloat((ndvi - (Math.sin(ndvi * 31.7) * 0.07)).toFixed(2));
    const delta = parseFloat((ndvi - prevNDVI).toFixed(2));
    const deltaElem = document.getElementById("ndviDelta");
    if (deltaElem) {
        deltaElem.innerText = `${delta >= 0 ? '+' : ''}${delta} vs last pass`;
        deltaElem.className = `kpi-delta ${delta >= 0 ? 'delta-pos' : 'delta-neg'}`;
    }

    // Dynamic NDWI Status
    let ndwiLabel = "Optimal Moisture";
    if (ndwi < 0.10) ndwiLabel = "Drought Risk";
    else if (ndwi < 0.20) ndwiLabel = "Moisture Deficit";
    else if (ndwi < 0.30) ndwiLabel = "Moderate Moisture";
    else if (ndwi >= 0.45) ndwiLabel = "Saturated Canopy";
    setText("ndwiStatus", ndwiLabel);

    // Dynamic SAVI Status
    let saviLabel = "High Density";
    if (savi < 0.40) saviLabel = "Low Biomass";
    else if (savi < 0.55) saviLabel = "Moderate Growth";
    else if (savi < 0.70) saviLabel = "Good Coverage";
    setText("saviStatus", saviLabel);

    // Weather & Microclimate
    if (data.weather) {
        setText("tempValue", data.weather.temp);
        setText("moistureValue", `Soil ${data.weather.soilMoisture}`);
        setText("etValue", `Daily ET: ${data.weather.et} | Wind: ${data.weather.wind}`);
    }

    // Health Score & Animated SVG Radial Gauge
    const score = data.healthScore || Math.round(ndvi * 100);
    setText("healthScore", score);

    // Animate Circular Gauge (circumference = 2 * PI * 70 ≈ 440)
    const circle = document.getElementById("gaugeCircle");
    if (circle) {
        const circumference = 440;
        const progress = Math.min(100, Math.max(0, score));
        const offset = circumference - (progress / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }

    // Health Status Badge
    const badge = document.getElementById("healthBadge");
    if (badge) {
        badge.innerText = `● ${data.healthStatus} Crops`;
        badge.className = `health-status-badge status-${data.healthStatus.toLowerCase()}`;
    }

    // Advice Box
    setText("healthTitle", `Condition: ${data.healthStatus}`);
    setText("healthText", data.advice || "Vegetation shows typical seasonal progression.");

    // Sub-metric Progress Bars
    if (data.submetrics) {
        setText("submetricChlorophyll", `${data.submetrics.chlorophyll}%`);
        setText("submetricWater", `${data.submetrics.water}%`);
        setText("submetricNitrogen", `${data.submetrics.nitrogen}%`);

        setBarWidth("fillChlorophyll", `${data.submetrics.chlorophyll}%`);
        setBarWidth("fillWater", `${data.submetrics.water}%`);
        setBarWidth("fillNitrogen", `${data.submetrics.nitrogen}%`);
    }

    // Orbital Timestamps
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
    const formattedTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
    setText("observationDate", formattedDate);
    setText("lastUpdate", `Today, ${formattedTime} UTC`);

    if (data.cloudCover) {
        setText("cloudCoverVal", `${data.cloudCover} (Clean)`);
    }

    // Update Historical Chart
    updateHistoricalChart(ndvi);
}

function setText(elementId, text) {
    const elem = document.getElementById(elementId);
    if (elem) elem.innerText = text;
}

function setBarWidth(elementId, width) {
    const elem = document.getElementById(elementId);
    if (elem) elem.style.width = width;
}

/* ==========================================================================
   HISTORICAL TIME-SERIES CHART (CHART.JS)
   ========================================================================== */

function generateTimeSeriesData(months, currentNDVI) {
    const labels = [];
    const ndviSeries = [];
    const ndwiSeries = [];

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();

    const pointsCount = months === 3 ? 6 : (months === 6 ? 12 : 16);

    for (let i = pointsCount - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * (months * 30 / pointsCount)));
        labels.push(`${monthNames[d.getMonth()]} ${d.getDate()}`);

        // Seasonal curve reaching towards currentNDVI
        const progress = (pointsCount - i) / pointsCount;
        const trend = currentNDVI - (0.28 * (1 - progress));
        const noise = (Math.sin(i * 1.5) * 0.03);

        const valNDVI = Math.min(0.95, Math.max(0.2, parseFloat((trend + noise).toFixed(2))));
        const valNDWI = parseFloat((valNDVI * 0.45 - 0.05).toFixed(2));

        ndviSeries.push(valNDVI);
        ndwiSeries.push(valNDWI);
    }

    return { labels, ndviSeries, ndwiSeries };
}

function updateHistoricalChart(currentNDVI) {
    const canvas = document.getElementById("ndviChart");
    if (!canvas || typeof Chart === "undefined") return;

    const ctx = canvas.getContext("2d");
    const timeData = generateTimeSeriesData(currentTimeframe, currentNDVI);

    if (ndviChart) {
        ndviChart.destroy();
    }

    // Green Gradient Fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, "rgba(16, 185, 129, 0.35)");
    gradient.addColorStop(1, "rgba(16, 185, 129, 0.0)");

    ndviChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: timeData.labels,
            datasets: [
                {
                    label: "NDVI (Vegetation Vigor)",
                    data: timeData.ndviSeries,
                    borderColor: "#10b981",
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.38,
                    borderWidth: 3,
                    pointBackgroundColor: "#10b981",
                    pointBorderColor: "#ffffff",
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: "NDWI (Canopy Moisture)",
                    data: timeData.ndwiSeries,
                    borderColor: "#06b6d4",
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.35,
                    borderWidth: 2,
                    pointBackgroundColor: "#06b6d4",
                    pointRadius: 3,
                    pointHoverRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: "index",
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                    labels: {
                        color: "#94a3b8",
                        font: { family: "'Inter', sans-serif", size: 11 },
                        usePointStyle: true,
                        boxWidth: 8
                    }
                },
                tooltip: {
                    backgroundColor: "rgba(14, 25, 17, 0.92)",
                    titleColor: "#f0fdf4",
                    bodyColor: "#cbd5e1",
                    borderColor: "rgba(52, 211, 153, 0.4)",
                    borderWidth: 1,
                    padding: 10,
                    boxPadding: 4,
                    usePointStyle: true
                }
            },
            scales: {
                x: {
                    grid: { color: "rgba(74, 222, 128, 0.06)" },
                    ticks: { color: "#64748b", font: { size: 10 } }
                },
                y: {
                    min: 0,
                    max: 1.0,
                    grid: { color: "rgba(74, 222, 128, 0.08)" },
                    ticks: {
                        stepSize: 0.2,
                        color: "#64748b",
                        font: { size: 10 },
                        callback: (v) => v.toFixed(1)
                    }
                }
            }
        }
    });
}

function setTimeframe(months, btn) {
    currentTimeframe = months;
    document.querySelectorAll(".time-btn").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");

    const activeNDVI = parseFloat(document.getElementById("ndviValue").innerText) || 0.82;
    updateHistoricalChart(activeNDVI);
}

/* ==========================================================================
   LOCATION SEARCH TOOL (OSM NOMINATIM GEOCODER)
   ========================================================================== */

async function searchLocation() {
    const input = document.getElementById("mapSearchInput");
    if (!input || !input.value.trim()) return;

    const query = input.value.trim();

    // Check if user entered raw latitude, longitude
    const coordMatch = query.match(/^([-+]?\d{1,2}\.?\d*)[,\s]+([-+]?\d{1,3}\.?\d*)$/);
    if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);
        map.flyTo([lat, lng], 15, { duration: 1.5 });
        handleMapCoordinateClick(lat, lng);
        input.value = "";
        return;
    }

    try {
        input.disabled = true;
        input.placeholder = "Searching satellite catalog...";

        const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const results = await resp.json();

        if (results && results.length > 0) {
            const first = results[0];
            const lat = parseFloat(first.lat);
            const lng = parseFloat(first.lon);

            map.flyTo([lat, lng], 14, { duration: 1.5 });
            handleMapCoordinateClick(lat, lng);
            input.value = "";
        } else {
            showAgriToast(`Location "${query}" not found. Try coordinates or a nearby city.`, "⚠️");
        }
    } catch (e) {
        showAgriToast("Search unavailable. Check internet connection.", "⚠️");
        console.error("Search failed:", e);
    } finally {
        input.disabled = false;
        input.placeholder = "🔍 Search field, city, coordinates...";
    }
}

/* ==========================================================================
   REFRESH BUTTON & RE-SYNC SIMULATION
   ========================================================================== */

function refreshDashboard() {
    const btn = document.getElementById("refreshBtn");
    if (btn) {
        btn.innerText = "↻ Orbiting...";
        btn.disabled = true;
    }

    setTimeout(() => {
        const select = document.getElementById("farmSelect");
        const farmId = select ? select.value : "farm1";
        loadFarmData(farmId);

        if (btn) {
            btn.innerText = "✓ Synced";
            setTimeout(() => {
                btn.innerText = "↻ Sync Pass";
                btn.disabled = false;
            }, 1200);
        }
    }, 700);
}

/* ==========================================================================
   BACKEND HEALTH CHECK & DUAL-MODE SYNC
   ========================================================================== */

async function checkBackendConnection() {
    const statusDot = document.getElementById("backendStatus");
    const statusText = document.getElementById("apiStatusText");

    try {
        const res = await fetch(`${API_URL}/`, { signal: AbortSignal.timeout(1500) });
        if (res.ok) {
            if (statusDot) statusDot.innerText = "FastAPI Backend Online";
            if (statusText) statusText.innerText = "Sentinel-2 & API: ACTIVE";
            return;
        }
    } catch (e) {
        // Standalone browser mode is active
    }

    if (statusDot) statusDot.innerText = "Standalone Satellite Engine";
    if (statusText) statusText.innerText = "Sentinel-2 Orbit: ACTIVE";
}

/* ==========================================================================
   EXPORT AGRONOMY REPORT MODAL
   ========================================================================== */

function openReportModal() {
    const modal = document.getElementById("reportModal");
    if (!modal) return;

    // Populate Report with active dashboard state
    const farmName = currentFarmData ? currentFarmData.name : "Active Field";
    const coords = document.getElementById("coordinates") ? document.getElementById("coordinates").innerText.replace("Coordinates: ", "") : "28.47440, 77.50400";
    const ndvi = document.getElementById("ndviValue") ? document.getElementById("ndviValue").innerText : "0.82";
    const ndwi = document.getElementById("ndwiValue") ? document.getElementById("ndwiValue").innerText : "0.34";
    const score = document.getElementById("healthScore") ? document.getElementById("healthScore").innerText : "84";
    const advice = document.getElementById("healthText") ? document.getElementById("healthText").innerText : "Optimal health.";
    const crop = currentFarmData ? `${currentFarmData.crop} (${currentFarmData.stage})` : "Wheat";
    const area = currentFarmData ? currentFarmData.area : "48.5 Ha";

    // Dynamic date
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

    setText("repFarmName", farmName);
    setText("repCoords", coords);
    setText("repDate", formattedDate);
    setText("repCrop", crop);
    setText("repArea", area);
    setText("repNDVI", `${ndvi} (Photosynthetic Vigor)`);
    setText("repNDWI", `${ndwi} (Canopy Moisture)`);
    setText("repScore", `${score} / 100`);
    setText("repAdvice", advice);

    modal.classList.add("active");
}

function closeReportModal() {
    const modal = document.getElementById("reportModal");
    if (modal) modal.classList.remove("active");
}

/* ==========================================================================
   MOBILE SIDEBAR & MODAL BACKDROP HELPERS
   ========================================================================== */

function toggleSidebar() {
    const sidebar = document.getElementById("dashSidebar");
    const overlay = document.getElementById("sidebarOverlay");
    if (sidebar) sidebar.classList.toggle("open");
    if (overlay) overlay.classList.toggle("active");
}

function closeSidebar() {
    const sidebar = document.getElementById("dashSidebar");
    const overlay = document.getElementById("sidebarOverlay");
    if (sidebar) sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("active");
}

function handleModalBackdropClick(event, modalId) {
    // Only close if click is directly on the overlay (not the card inside)
    if (event.target.id === modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove("active");
    }
}

/* ==========================================================================
   THEME TOGGLER
   ========================================================================== */

function toggleAppTheme() {
    document.body.classList.toggle("light-theme");
    const isLight = document.body.classList.contains("light-theme");
    localStorage.setItem("cropvision_theme", isLight ? "light" : "dark");
}

/* ==========================================================================
   DROPDOWN POPULATION & GEOMETRY GENERATORS
   ========================================================================== */

function populateFarmDropdown() {
    const select = document.getElementById("farmSelect");
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = "";

    Object.values(FARMS_DATABASE).forEach(farm => {
        const opt = document.createElement("option");
        opt.value = farm.id;
        opt.innerText = farm.name;
        select.appendChild(opt);
    });

    if (FARMS_DATABASE[currentVal]) {
        select.value = currentVal;
    }
}

/* ==========================================================================
   DELETE CUSTOM FARMS & CROPS
   ========================================================================== */

function deleteCustomFarm(farmId) {
    if (!farmId.startsWith("custom_farm_")) {
        showAgriToast("Built-in farm presets cannot be deleted.", "⚠️");
        return;
    }
    const farmName = FARMS_DATABASE[farmId] ? FARMS_DATABASE[farmId].name : farmId;
    delete FARMS_DATABASE[farmId];

    // Remove from localStorage
    try {
        const stored = localStorage.getItem("cropvision_custom_farms");
        if (stored) {
            const saved = JSON.parse(stored);
            delete saved[farmId];
            localStorage.setItem("cropvision_custom_farms", JSON.stringify(saved));
        }
    } catch (e) { console.error(e); }

    populateFarmDropdown();
    loadFarmData("farm1");
    const selectElem = document.getElementById("farmSelect");
    if (selectElem) selectElem.value = "farm1";
    renderAreaFilterPills();
    renderCropRegistry();
    showAgriToast(`Field "${farmName}" removed from registry.`, "🗑️");
}

function deleteCustomCrop(cropId) {
    const idx = CROPS_DATABASE.findIndex(c => c.id === cropId);
    if (idx === -1 || !cropId.startsWith("crop_custom_")) {
        showAgriToast("Built-in crop varieties cannot be deleted.", "⚠️");
        return;
    }
    const cropName = CROPS_DATABASE[idx].name;
    CROPS_DATABASE.splice(idx, 1);

    // Remove from localStorage
    try {
        const stored = localStorage.getItem("cropvision_custom_crops");
        if (stored) {
            const saved = JSON.parse(stored).filter(c => c.id !== cropId);
            localStorage.setItem("cropvision_custom_crops", JSON.stringify(saved));
        }
    } catch (e) { console.error(e); }

    populateCropDropdown();
    renderAreaFilterPills();
    renderCropRegistry();
    showAgriToast(`Crop "${cropName}" removed from catalog.`, "🗑️");
}

function deleteSelectedFarm() {
    const select = document.getElementById("farmSelect");
    if (!select) return;
    const farmId = select.value;
    deleteCustomFarm(farmId);
    const deleteBtn = document.getElementById("deleteFarmBtn");
    if (deleteBtn) deleteBtn.style.display = "none";
}

function populateCropDropdown() {
    const select = document.getElementById("newFieldCrop");
    if (!select) return;
    select.innerHTML = "";

    CROPS_DATABASE.forEach(crop => {
        const opt = document.createElement("option");
        opt.value = crop.name;
        opt.innerText = `${crop.icon || '🌾'} ${crop.name} (${crop.category})`;
        select.appendChild(opt);
    });
}

function generateFieldPolygon(lat, lng, areaHa) {
    const safeHa = Math.max(1, Math.min(500, parseFloat(areaHa) || 30));
    // Calculate degree offset scaled to field acreage
    const dLat = Math.max(0.002, Math.min(0.015, (Math.sqrt(safeHa * 10000) / 111000) / 2));
    const cosFactor = Math.max(0.2, Math.cos(lat * Math.PI / 180));
    const dLng = dLat / cosFactor;

    return {
        boundary: [
            [Number((lat - dLat).toFixed(5)), Number((lng - dLng).toFixed(5))],
            [Number((lat + dLat).toFixed(5)), Number((lng - dLng * 0.9).toFixed(5))],
            [Number((lat + dLat * 1.05).toFixed(5)), Number((lng + dLng).toFixed(5))],
            [Number((lat - dLat * 0.95).toFixed(5)), Number((lng + dLng * 0.95).toFixed(5))]
        ],
        dLat,
        dLng
    };
}

function generateFieldZones(lat, lng, dLat, dLng, baseNDVI) {
    const val = parseFloat(baseNDVI) || 0.80;
    const northNDVI = Number(Math.min(0.95, val + 0.04).toFixed(2));
    const southNDVI = Number(Math.max(0.35, val - 0.06).toFixed(2));

    return [
        {
            name: "Sector Alpha (North Block)",
            ndvi: northNDVI,
            color: northNDVI >= 0.70 ? "#10b981" : (northNDVI >= 0.50 ? "#34d399" : "#f59e0b"),
            coords: [
                [Number(lat.toFixed(5)), Number((lng - dLng * 0.95).toFixed(5))],
                [Number((lat + dLat).toFixed(5)), Number((lng - dLng * 0.9).toFixed(5))],
                [Number((lat + dLat * 1.05).toFixed(5)), Number((lng + dLng).toFixed(5))],
                [Number(lat.toFixed(5)), Number((lng + dLng * 0.98).toFixed(5))]
            ]
        },
        {
            name: "Sector Beta (South Block)",
            ndvi: southNDVI,
            color: southNDVI >= 0.70 ? "#34d399" : (southNDVI >= 0.50 ? "#f59e0b" : "#f43f5e"),
            coords: [
                [Number((lat - dLat).toFixed(5)), Number((lng - dLng).toFixed(5))],
                [Number(lat.toFixed(5)), Number((lng - dLng * 0.95).toFixed(5))],
                [Number(lat.toFixed(5)), Number((lng + dLng * 0.98).toFixed(5))],
                [Number((lat - dLat * 0.95).toFixed(5)), Number((lng + dLng * 0.95).toFixed(5))]
            ]
        }
    ];
}

/* ==========================================================================
   MODAL CONTROLS & COORDINATE HELPERS
   ========================================================================== */

function openAddFieldModal() {
    const modal = document.getElementById("addFieldModal");
    if (!modal) return;

    // Pre-populate coordinates if blank
    const latInput = document.getElementById("newFieldLat");
    const lngInput = document.getElementById("newFieldLng");
    if (latInput && !latInput.value) {
        if (lastClickedCoords) {
            latInput.value = lastClickedCoords.lat.toFixed(5);
            if (lngInput) lngInput.value = lastClickedCoords.lng.toFixed(5);
        } else if (currentFarmData) {
            latInput.value = currentFarmData.lat.toFixed(5);
            if (lngInput) lngInput.value = currentFarmData.lng.toFixed(5);
        }
    }

    // Set today's date if empty
    const dateInput = document.getElementById("newFieldSowingDate");
    if (dateInput && !dateInput.value) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    populateCropDropdown();
    modal.classList.add("active");
}

function closeAddFieldModal() {
    const modal = document.getElementById("addFieldModal");
    if (modal) modal.classList.remove("active");
}

function openAddCropModal() {
    const modal = document.getElementById("addCropModal");
    if (modal) modal.classList.add("active");
}

function closeAddCropModal() {
    const modal = document.getElementById("addCropModal");
    if (modal) modal.classList.remove("active");
}

function fillWithLastMapClick() {
    const latInput = document.getElementById("newFieldLat");
    const lngInput = document.getElementById("newFieldLng");

    if (lastClickedCoords && latInput && lngInput) {
        latInput.value = lastClickedCoords.lat.toFixed(5);
        lngInput.value = lastClickedCoords.lng.toFixed(5);
        showAgriToast(`Coordinates populated: ${latInput.value}, ${lngInput.value}`, "📍");
    } else if (currentMarker && latInput && lngInput) {
        const pos = currentMarker.getLatLng();
        latInput.value = pos.lat.toFixed(5);
        lngInput.value = pos.lng.toFixed(5);
        showAgriToast(`Coordinates set from active farm center`, "📍");
    } else {
        showAgriToast("Click anywhere on the satellite map first to sample coordinates", "💡");
    }
}

async function geocodeAreaLocation() {
    const locInput = document.getElementById("newFieldAreaLocation");
    const latInput = document.getElementById("newFieldLat");
    const lngInput = document.getElementById("newFieldLng");
    if (!locInput || !locInput.value.trim()) {
        showAgriToast("Enter an area or region name first", "⚠️");
        return;
    }

    const query = locInput.value.trim();

    // Instant local gazetteer for major agricultural hubs
    const localLookup = {
        "greater noida": [28.4744, 77.5040],
        "delhi": [28.6139, 77.2090],
        "pusa": [28.6139, 77.2090],
        "punjab": [30.9010, 75.8573],
        "ludhiana": [30.9010, 75.8573],
        "nashik": [20.0059, 73.7910],
        "dindori": [20.0059, 73.7910],
        "karnal": [29.6857, 76.9905],
        "haryana": [29.6857, 76.9905],
        "pune": [18.5204, 73.8567],
        "maharashtra": [19.7515, 75.7139],
        "uttar pradesh": [26.8467, 80.9462]
    };

    const lower = query.toLowerCase();
    for (const [key, coords] of Object.entries(localLookup)) {
        if (lower.includes(key)) {
            if (latInput) latInput.value = coords[0].toFixed(5);
            if (lngInput) lngInput.value = coords[1].toFixed(5);
            showAgriToast(`Area "${query}" resolved to ${coords[0]}, ${coords[1]}`, "🌍");
            return;
        }
    }

    // Fallback to OpenStreetMap Nominatim
    try {
        showAgriToast("Geocoding area via satellite database...", "🛰️");
        const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await resp.json();
        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            if (latInput) latInput.value = lat.toFixed(5);
            if (lngInput) lngInput.value = lon.toFixed(5);
            showAgriToast(`Area coordinates located: ${lat.toFixed(4)}, ${lon.toFixed(4)}`, "✓");
        } else {
            showAgriToast(`Could not auto-detect "${query}". Please enter coordinates manually.`, "⚠️");
        }
    } catch (e) {
        showAgriToast("Online geocoding unavailable. Enter coordinates manually.", "⚠️");
    }
}

/* ==========================================================================
   FORM SUBMISSION HANDLERS
   ========================================================================== */

function handleFieldFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById("newFieldName").value.trim();
    const areaLocation = document.getElementById("newFieldAreaLocation").value.trim();
    const sizeVal = parseFloat(document.getElementById("newFieldSize").value) || 35.0;
    const unit = document.getElementById("newFieldUnit").value;
    const cropName = document.getElementById("newFieldCrop").value;
    const stage = document.getElementById("newFieldStage").value;
    const sowingDateRaw = document.getElementById("newFieldSowingDate").value;
    const lat = parseFloat(document.getElementById("newFieldLat").value);
    const lng = parseFloat(document.getElementById("newFieldLng").value);
    const ndvi = parseFloat(document.getElementById("newFieldNDVI").value) || 0.80;

    if (!name || isNaN(lat) || isNaN(lng)) {
        showAgriToast("Please fill in valid field name and coordinates", "⚠️");
        return;
    }

    // Generate unique ID
    const farmId = "custom_farm_" + Date.now();

    // Calculate approximate area in Hectares for geometry scaling
    const areaHa = unit === "Acres" ? (sizeVal * 0.404686) : sizeVal;
    let boundary, zones;
    if (window.pendingDrawnBoundary && window.pendingDrawnBoundary.length >= 3) {
        boundary = window.pendingDrawnBoundary;
        window.pendingDrawnBoundary = null;
        const half = Math.ceil(boundary.length / 2);
        zones = [
            { name: "Sector A (North)", ndvi: parseFloat(Math.min(0.95, ndvi + 0.03).toFixed(2)), color: "#10b981", coords: boundary.slice(0, half + 1) },
            { name: "Sector B (South)", ndvi: parseFloat(Math.max(0.35, ndvi - 0.04).toFixed(2)), color: "#34d399", coords: boundary.slice(half - 1) }
        ];
    } else {
        const generated = generateFieldPolygon(lat, lng, areaHa);
        boundary = generated.boundary;
        zones = generateFieldZones(lat, lng, generated.dLat, generated.dLng, ndvi);
    }

    // Compute spectral metrics
    const ndwi = parseFloat((ndvi * 0.45 - 0.05).toFixed(2));
    const savi = parseFloat((ndvi * 0.90).toFixed(2));
    const healthScore = Math.round(ndvi * 100);

    let status = "Healthy";
    if (ndvi < 0.50) status = "Stressed";
    else if (ndvi < 0.70) status = "Moderate";

    // Format Sowing Date
    let formattedSowing = "Active Season";
    if (sowingDateRaw) {
        const d = new Date(sowingDateRaw);
        formattedSowing = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    }

    const newFarm = {
        id: farmId,
        name: name,
        locationName: areaLocation,
        lat: lat,
        lng: lng,
        crop: cropName,
        stage: stage,
        area: `${sizeVal} ${unit}`,
        sowingDate: formattedSowing,
        ndvi: ndvi,
        ndwi: ndwi,
        savi: savi,
        healthScore: healthScore,
        healthStatus: status,
        cloudCover: "0.6%",
        weather: {
            temp: "28.5°C",
            humidity: "52%",
            soilMoisture: "35%",
            et: "4.2 mm/day",
            wind: "9 km/h"
        },
        submetrics: {
            chlorophyll: Math.min(98, Math.round(healthScore * 1.04)),
            water: Math.min(95, Math.round(35 + ndwi * 80)),
            nitrogen: Math.min(96, Math.round(healthScore * 0.98))
        },
        advice: `Field parcel registered in ${areaLocation}. Monitored with Sentinel-2 MSI multispectral pass for ${cropName}. Photosynthetic canopy index is ${ndvi}.`,
        boundary: boundary,
        zones: zones
    };

    // Save to in-memory database
    FARMS_DATABASE[farmId] = newFarm;

    // Persist to localStorage
    try {
        let saved = {};
        const stored = localStorage.getItem("cropvision_custom_farms");
        if (stored) saved = JSON.parse(stored);
        saved[farmId] = newFarm;
        localStorage.setItem("cropvision_custom_farms", JSON.stringify(saved));
    } catch (err) {
        console.error("Storage error:", err);
    }

    // Connect this crop & area in CROPS_DATABASE
    const matchedCrop = CROPS_DATABASE.find(c => c.name.toLowerCase() === cropName.toLowerCase());
    if (matchedCrop) {
        if (!matchedCrop.areas.some(a => a.toLowerCase().includes(areaLocation.toLowerCase()))) {
            matchedCrop.areas.push(areaLocation);
        }
        if (!matchedCrop.farmId) {
            matchedCrop.farmId = farmId;
        }
    }

    // Refresh UI Components
    populateFarmDropdown();
    const selectElem = document.getElementById("farmSelect");
    if (selectElem) selectElem.value = farmId;

    loadFarmData(farmId);
    renderAreaFilterPills();
    renderCropRegistry();

    closeAddFieldModal();
    document.getElementById("addFieldForm").reset();

    showAgriToast(`Field site "${name}" created and plotted on satellite map!`, "🌱");

    // Optional sync to FastAPI backend if available
    try {
        fetch(`${API_URL}/api/farms`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newFarm)
        }).catch(() => { });
    } catch (e) { }
}

function handleCropFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById("newCropName").value.trim();
    const category = document.getElementById("newCropCategory").value;
    const season = document.getElementById("newCropSeason").value;
    const areasInput = document.getElementById("newCropAreas").value.trim();
    const water = document.getElementById("newCropWater").value;
    const duration = document.getElementById("newCropDuration").value.trim() || "120 - 140 Days";
    const ndviRange = document.getElementById("newCropNDVIRange").value.trim() || "0.70 - 0.85";
    const notes = document.getElementById("newCropNotes").value.trim() || "Optimal growth under recommended moisture.";

    if (!name || !areasInput) {
        showAgriToast("Please provide crop name and at least one suitable area", "⚠️");
        return;
    }

    const areas = areasInput.split(',').map(a => a.trim()).filter(Boolean);

    // Determine representative icon
    let icon = "🌾";
    if (category === "Oilseed") icon = "🌻";
    else if (category === "Horticulture") icon = "🍇";
    else if (category === "Cash Crop") icon = "🎋";
    else if (category === "Pulses") icon = "🌿";

    const cropId = "crop_custom_" + Date.now();

    const newCrop = {
        id: cropId,
        name: name,
        category: category,
        areas: areas,
        season: season,
        ndviRange: ndviRange,
        water: water,
        duration: duration,
        stage: "Registered Species",
        icon: icon,
        farmId: null,
        notes: notes
    };

    CROPS_DATABASE.push(newCrop);

    // Save to localStorage
    try {
        let savedCrops = [];
        const stored = localStorage.getItem("cropvision_custom_crops");
        if (stored) savedCrops = JSON.parse(stored);
        savedCrops.push(newCrop);
        localStorage.setItem("cropvision_custom_crops", JSON.stringify(savedCrops));
    } catch (err) {
        console.error("Storage error:", err);
    }

    populateCropDropdown();
    renderAreaFilterPills();
    renderCropRegistry();

    closeAddCropModal();
    document.getElementById("addCropForm").reset();

    showAgriToast(`Crop variety "${name}" registered in catalog!`, "🌾");

    // Optional sync to FastAPI backend
    try {
        fetch(`${API_URL}/api/crops`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCrop)
        }).catch(() => { });
    } catch (e) { }
}

/* ==========================================================================
   AREA-BASED CROP SEARCHING & REGISTRY ENGINE
   ========================================================================== */

function getActiveAreas() {
    const areasMap = new Map();

    // Extract from active farms
    Object.values(FARMS_DATABASE).forEach(farm => {
        if (farm.locationName) {
            const clean = farm.locationName.trim();
            areasMap.set(clean, (areasMap.get(clean) || 0) + 1);
        }
    });

    // Extract from crop suitability areas
    CROPS_DATABASE.forEach(crop => {
        if (crop.areas && Array.isArray(crop.areas)) {
            crop.areas.forEach(area => {
                const clean = area.trim();
                if (!areasMap.has(clean)) {
                    areasMap.set(clean, 0);
                }
            });
        }
    });

    return Array.from(areasMap.keys());
}

function renderAreaFilterPills() {
    const container = document.getElementById("areaFilterStrip");
    if (!container) return;

    const allAreas = getActiveAreas();
    const countLabel = document.getElementById("registryAreaCount");
    if (countLabel) countLabel.innerText = `${allAreas.length} Areas Active`;

    container.innerHTML = "";

    // "All Areas" Pill
    const allPill = document.createElement("button");
    allPill.className = `area-chip ${activeAreaFilter === 'all' ? 'active' : ''}`;
    allPill.innerHTML = `🌐 All Project Areas <span class="count">${CROPS_DATABASE.length}</span>`;
    allPill.onclick = () => setAreaFilter("all");
    container.appendChild(allPill);

    // Area-specific Pills
    allAreas.forEach(area => {
        // Count how many crops or fields match this area
        const matchingCrops = CROPS_DATABASE.filter(c => {
            return c.areas.some(a => a.toLowerCase().includes(area.toLowerCase()) || area.toLowerCase().includes(a.toLowerCase())) ||
                Object.values(FARMS_DATABASE).some(f => f.crop === c.name && f.locationName.toLowerCase().includes(area.toLowerCase()));
        }).length;

        const pill = document.createElement("button");
        pill.className = `area-chip ${activeAreaFilter === area ? 'active' : ''}`;
        pill.innerHTML = `📍 ${area} <span class="count">${matchingCrops}</span>`;
        pill.onclick = () => setAreaFilter(area);
        container.appendChild(pill);
    });
}

function setAreaFilter(area) {
    activeAreaFilter = area;
    renderAreaFilterPills();
    filterCropRegistry();
}

function filterCropRegistry() {
    const grid = document.getElementById("cropGrid");
    if (!grid) return;

    const searchInput = document.getElementById("cropSearchInput");
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

    const categorySelect = document.getElementById("cropCategoryFilter");
    const category = categorySelect ? categorySelect.value : "all";

    const sortSelect = document.getElementById("cropSortBy");
    const sortBy = sortSelect ? sortSelect.value : "name";

    // Filter Crops
    let filtered = CROPS_DATABASE.filter(crop => {
        // Area Match
        let matchesArea = true;
        if (activeAreaFilter !== "all") {
            const inCropAreas = crop.areas.some(a =>
                a.toLowerCase().includes(activeAreaFilter.toLowerCase()) ||
                activeAreaFilter.toLowerCase().includes(a.toLowerCase())
            );
            const inActiveFarms = Object.values(FARMS_DATABASE).some(f =>
                f.crop === crop.name && f.locationName.toLowerCase().includes(activeAreaFilter.toLowerCase())
            );
            matchesArea = inCropAreas || inActiveFarms;
        }

        // Category Match
        let matchesCategory = true;
        if (category !== "all") {
            matchesCategory = (crop.category === category);
        }

        // Query Match (Name, Area, or Category)
        let matchesQuery = true;
        if (query) {
            const inName = crop.name.toLowerCase().includes(query);
            const inCat = crop.category.toLowerCase().includes(query);
            const inAreas = crop.areas.some(a => a.toLowerCase().includes(query));
            matchesQuery = inName || inCat || inAreas;
        }

        return matchesArea && matchesCategory && matchesQuery;
    });

    // Sorting
    filtered.sort((a, b) => {
        if (sortBy === "name") {
            return a.name.localeCompare(b.name);
        } else if (sortBy === "area") {
            const countA = a.areas.length;
            const countB = b.areas.length;
            return countB - countA;
        } else if (sortBy === "ndvi") {
            const valA = parseFloat(a.ndviRange) || 0.7;
            const valB = parseFloat(b.ndviRange) || 0.7;
            return valB - valA;
        }
        return 0;
    });

    // Update Summary Statistics
    updateRegistryStatistics(filtered);

    // Render Cards
    grid.innerHTML = "";

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-crops-view">
                <div class="empty-icon">🌾</div>
                <h3>No Crops Found Matching Criteria</h3>
                <p style="margin-top: 6px; font-size: 0.85rem;">
                    No agricultural varieties found for area: <strong>${activeAreaFilter === 'all' ? 'All Areas' : activeAreaFilter}</strong>.
                </p>
                <div style="margin-top: 16px; display: flex; gap: 10px; justify-content: center;">
                    <button class="secondary-btn" onclick="resetCropFilters()">↺ Reset Filters</button>
                    <button class="primary-btn" onclick="openAddCropModal()">+ Register Crop for this Area</button>
                </div>
            </div>
        `;
        return;
    }

    filtered.forEach(crop => {
        // Check if there is an active farm site cultivating this crop
        const relatedFarm = Object.values(FARMS_DATABASE).find(f =>
            f.crop === crop.name || f.crop.toLowerCase().includes(crop.name.toLowerCase())
        );

        const card = document.createElement("div");
        card.className = "crop-card";

        const primaryArea = crop.areas && crop.areas.length > 0 ? crop.areas[0] : "Multiple Regions";

        card.innerHTML = `
            <div>
                <div class="crop-card-top">
                    <div class="crop-icon-title">
                        <div class="crop-avatar">${crop.icon || '🌾'}</div>
                        <div>
                            <h4 class="crop-name">${crop.name}</h4>
                            <span class="crop-category-pill">${crop.category}</span>
                        </div>
                    </div>
                </div>

                <div class="crop-area-badge">
                    <span>📍</span>
                    <span>${primaryArea}</span>
                </div>

                <div class="crop-details-list">
                    <div class="crop-detail-row">
                        <span class="label">Suitable Areas:</span>
                        <strong>${crop.areas.slice(0, 2).join(", ")}${crop.areas.length > 2 ? ' +' + (crop.areas.length - 2) : ''}</strong>
                    </div>
                    <div class="crop-detail-row">
                        <span class="label">Growing Season:</span>
                        <span>${crop.season}</span>
                    </div>
                    <div class="crop-detail-row">
                        <span class="label">Water Need:</span>
                        <span style="color: var(--satellite-cyan); font-weight: 600;">💧 ${crop.water}</span>
                    </div>
                    <div class="crop-detail-row">
                        <span class="label">Maturation Period:</span>
                        <span>${crop.duration}</span>
                    </div>
                    <div class="crop-detail-row">
                        <span class="label">Target NDVI Vigor:</span>
                        <strong style="color: var(--emerald-light);">${crop.ndviRange}</strong>
                    </div>
                    ${relatedFarm ? `
                    <div class="crop-detail-row" style="background: rgba(16, 185, 129, 0.08); padding: 4px 6px; border-radius: 4px; border: none; margin-top: 4px;">
                        <span class="label" style="color: var(--emerald-light);">Active Field Site:</span>
                        <strong style="color: var(--text-main); font-size: 0.78rem;">${relatedFarm.name}</strong>
                    </div>
                    ` : ''}
                </div>
            </div>

            <div class="crop-card-footer">
                ${relatedFarm ? `
                <button class="primary-btn" onclick="inspectCropOnMap('${relatedFarm.id}', '${primaryArea}')">
                    🗺️ Inspect Field Map
                </button>
                ` : `
                <button class="secondary-btn" onclick="inspectCropOnMap(null, '${primaryArea}')">
                    🔍 View Satellite Area
                </button>
                `}
                <button class="secondary-btn" onclick="openAddFieldWithCrop('${crop.name}', '${primaryArea}')" title="Add a field for this crop">
                    🌱 + Plant Field
                </button>
                ${crop.id.startsWith('crop_custom_') ? `
                <button class="delete-farm-btn" onclick="deleteCustomCrop('${crop.id}')" title="Remove this crop variety">
                    🗑️ Remove
                </button>
                ` : ''}
            </div>
        `;

        grid.appendChild(card);
    });
}

function updateRegistryStatistics(filteredCrops) {
    let totalHa = 0;
    let farmSitesCount = 0;
    let maxNDVI = 0.82;

    // Aggregate cultivated area from farms
    Object.values(FARMS_DATABASE).forEach(f => {
        let matches = true;
        if (activeAreaFilter !== "all") {
            matches = f.locationName.toLowerCase().includes(activeAreaFilter.toLowerCase());
        }
        if (matches) {
            farmSitesCount++;
            const ha = parseFloat(f.area) || 35.0;
            totalHa += ha;
            if (f.ndvi > maxNDVI) maxNDVI = f.ndvi;
        }
    });

    // If no farms in specific area, estimate from typical parcel size
    if (totalHa === 0 && filteredCrops.length > 0) {
        totalHa = filteredCrops.length * 32.5;
    }

    setText("statTotalAcreage", `${totalHa.toFixed(1)} Ha`);
    setText("statCropCount", `${filteredCrops.length} Varieties`);
    setText("statFarmCount", `${farmSitesCount} Sites`);
    setText("statAvgNDVI", `${maxNDVI.toFixed(2)} NDVI`);
}

function resetCropFilters() {
    activeAreaFilter = "all";
    const searchInput = document.getElementById("cropSearchInput");
    if (searchInput) searchInput.value = "";
    const categorySelect = document.getElementById("cropCategoryFilter");
    if (categorySelect) categorySelect.value = "all";
    const sortSelect = document.getElementById("cropSortBy");
    if (sortSelect) sortSelect.value = "name";

    renderAreaFilterPills();
    filterCropRegistry();
    showAgriToast("Registry filters reset", "↺");
}

function inspectCropOnMap(farmId, areaHint) {
    if (farmId && FARMS_DATABASE[farmId]) {
        const select = document.getElementById("farmSelect");
        if (select) select.value = farmId;
        loadFarmData(farmId);
        showAgriToast(`Panned satellite orbit to ${FARMS_DATABASE[farmId].name}`, "🛰️");
    } else if (areaHint) {
        // Geocode area and pan map
        const input = document.getElementById("mapSearchInput");
        if (input) input.value = areaHint;
        searchLocation();
        showAgriToast(`Scanning satellite coordinates for ${areaHint}`, "🛰️");
    }

    // Smooth scroll to map
    const mapSection = document.getElementById("mapSection");
    if (mapSection) {
        mapSection.scrollIntoView({ behavior: "smooth" });
    }
}

function openAddFieldWithCrop(cropName, areaName) {
    openAddFieldModal();

    // Small delay ensures modal is open before populating
    setTimeout(() => {
        const cropSelect = document.getElementById("newFieldCrop");
        if (cropSelect) cropSelect.value = cropName;

        const areaInput = document.getElementById("newFieldAreaLocation");
        if (areaInput && areaName) {
            areaInput.value = areaName;
            geocodeAreaLocation();
        }
    }, 120);
}

/* ==========================================================================
   TOAST NOTIFICATION ENGINE
   ========================================================================== */

let toastTimer = null;
function showAgriToast(message, icon = "✓") {
    const toast = document.getElementById("agriToast");
    const msgElem = document.getElementById("toastMsg");
    const iconElem = document.getElementById("toastIcon");
    if (!toast || !msgElem) return;

    msgElem.innerText = message;
    if (iconElem) iconElem.innerText = icon;

    toast.classList.add("show");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3600);
}

/* ==========================================================================
   1. LIVE WEATHER API INTEGRATION (OPEN-METEO REAL-TIME METRICS)
   ========================================================================== */

async function fetchLiveWeatherData(lat, lng) {
    if (isNaN(lat) || isNaN(lng)) return;

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&hourly=et0_fao_evapotranspiration&timezone=auto`;
        const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
        if (!res.ok) throw new Error("Open-Meteo HTTP error");
        const data = await res.json();

        if (data && data.current) {
            const cur = data.current;
            const temp = cur.temperature_2m;
            const humidity = cur.relative_humidity_2m;
            const wind = cur.wind_speed_10m;
            const rain = cur.precipitation || 0;

            // Daily ET sum approximation
            let dailyET = 4.2;
            if (data.hourly && data.hourly.et0_fao_evapotranspiration && data.hourly.et0_fao_evapotranspiration.length) {
                const daySlice = data.hourly.et0_fao_evapotranspiration.slice(0, 24);
                const sum = daySlice.reduce((a, b) => a + (b || 0), 0);
                if (sum > 0) dailyET = sum;
            }

            setText("tempValue", `${temp.toFixed(1)}°C`);
            setText("moistureValue", `Air Hum ${humidity}%`);
            setText("etValue", `Daily ET: ${dailyET.toFixed(1)} mm/day | Wind: ${wind.toFixed(1)} km/h`);

            // Evaluate Spraying Safety Window
            const sprayBadge = document.getElementById("sprayBadge");
            if (sprayBadge) {
                if (wind <= 12 && rain === 0) {
                    sprayBadge.className = "spray-pill badge-safe";
                    sprayBadge.innerText = "🟢 Safe Spray Window";
                } else if (wind <= 20 && rain === 0) {
                    sprayBadge.className = "spray-pill badge-warn";
                    sprayBadge.innerText = "🟡 Caution: Wind Drift Risk";
                } else {
                    sprayBadge.className = "spray-pill badge-danger";
                    sprayBadge.innerText = "🔴 Unfavorable: High Wind/Rain";
                }
            }

            const tag = document.getElementById("liveWeatherTag");
            if (tag) {
                tag.innerText = `● Open-Meteo Live (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
            }
        }
    } catch (err) {
        console.info("Using cached/simulated weather telemetry:", err.message);
        const sprayBadge = document.getElementById("sprayBadge");
        if (sprayBadge && !sprayBadge.innerText) {
            sprayBadge.className = "spray-pill badge-safe";
            sprayBadge.innerText = "🟢 Safe Spray Window";
        }
    }
}

/* ==========================================================================
   2. AI AGRONOMIST CHAT ("CROPBOT") INTERACTIVE ASSISTANT
   ========================================================================== */

let isCropBotOpen = false;

function toggleCropBot() {
    isCropBotOpen = !isCropBotOpen;
    const drawer = document.getElementById("cropBotDrawer");
    if (drawer) {
        drawer.style.display = isCropBotOpen ? "flex" : "none";
        if (isCropBotOpen) {
            updateCropBotContext();
            const input = document.getElementById("cropBotInput");
            if (input) input.focus();
        }
    }
}

function updateCropBotContext() {
    const textElem = document.getElementById("cropBotContextText");
    if (textElem && currentFarmData) {
        const shortName = currentFarmData.name.split(" - ")[1] || currentFarmData.name;
        textElem.innerText = `Context: ${shortName} • ${currentFarmData.crop} (NDVI: ${currentFarmData.ndvi})`;
    }
}

function askCropBotPrompt(promptText) {
    const input = document.getElementById("cropBotInput");
    if (input) {
        input.value = promptText;
        handleCropBotSubmit();
    }
}

function handleCropBotSubmit(e) {
    if (e) e.preventDefault();
    const input = document.getElementById("cropBotInput");
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;

    input.value = "";
    appendCropBotMessage("user", query);

    // Simulated agronomist neural reasoning delay
    setTimeout(() => {
        const reply = generateAgronomistAnswer(query);
        appendCropBotMessage("bot", reply);
    }, 450);
}

function appendCropBotMessage(sender, text) {
    const box = document.getElementById("cropBotMessages");
    if (!box) return;
    const msg = document.createElement("div");
    msg.className = `cropbot-msg ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
    if (sender === 'user') {
        msg.innerHTML = `<strong>You</strong><p>${escapeHtml(text)}</p>`;
    } else {
        msg.innerHTML = `<strong>🌱 CropBot Agronomist</strong><p>${text}</p>`;
    }
    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;
}

function generateAgronomistAnswer(query) {
    const q = query.toLowerCase();
    const farm = currentFarmData || FARMS_DATABASE["farm1"];
    const crop = farm.crop;
    const ndvi = farm.ndvi;
    const stage = farm.stage;

    if (q.includes("ndvi") || q.includes("vigor") || q.includes("health") || q.includes("canopy")) {
        if (ndvi >= 0.75) {
            return `Your <b>${crop}</b> has a satellite NDVI score of <b>${ndvi}</b>. This signifies dense photosynthetic biomass absorption in the <i>${stage}</i> stage. Uniform greenness indicates healthy tillering and minimal weed competition.`;
        } else if (ndvi >= 0.60) {
            return `Your <b>${crop}</b> has an NDVI of <b>${ndvi}</b> (Moderate vigor). Canopy cover is standard, but spectral sensors detect slight moisture deficit in western sectors. Schedule supplemental irrigation to preserve seed filling.`;
        } else {
            return `Alert: Current NDVI of <b>${ndvi}</b> signals crop stress or low canopy density. Perform field scouting immediately to check for root moisture deficit, salinity, or pest vectors.`;
        }
    }

    if (q.includes("fertilizer") || q.includes("urea") || q.includes("npk") || q.includes("nitrogen") || q.includes("nutrient")) {
        const nScore = farm.submetrics ? farm.submetrics.nitrogen : 80;
        return `For <b>${crop}</b> in <i>${stage}</i>: Leaf nitrogen concentration is currently <b>${nScore}%</b>. We recommend variable-rate top dressing of <b>30-35 kg Urea/Ha</b> with <b>0.5% Zinc Sulphate</b> foliar spray. Zone mapping can save up to 20% fertilizer by targeting only low-vigor zones.`;
    }

    if (q.includes("irrigation") || q.includes("water") || q.includes("moisture") || q.includes("drip")) {
        const et = farm.weather ? farm.weather.et : "4.2 mm/day";
        return `Canopy water saturation (NDWI) is <b>${farm.ndwi}</b> with daily evapotranspiration of <b>${et}</b>. For <b>${crop}</b> during <i>${stage}</i>, apply a light irrigation cycle in <b>3 to 4 days</b> before ear emergence or flowering.`;
    }

    if (q.includes("spray") || q.includes("pesticide") || q.includes("weather") || q.includes("wind")) {
        const windVal = farm.weather ? farm.weather.wind : "8 km/h";
        return `Live wind speed at ${farm.locationName} is <b>${windVal}</b>. For foliar micronutrients or biological crop protection, the best spraying window is early morning (6:00 AM – 9:30 AM) when wind speeds remain below 12 km/h and evaporation loss is minimal.`;
    }

    if (q.includes("harvest") || q.includes("yield") || q.includes("mandi") || q.includes("revenue") || q.includes("roi")) {
        return `With an NDVI of <b>${ndvi}</b> across ${farm.area}, yield projections are estimated at <b>+12% to +18% above regional baseline</b>. Scroll down to our interactive <b>Yield &amp; ROI Calculator</b> to see exact quintals and mandi revenue for your variety!`;
    }

    return `I've analyzed field telemetry for <b>${crop}</b> at <i>${farm.locationName}</i>. The satellite NDVI is <b>${ndvi}</b> during <i>${stage}</i> with an overall rating of <b>${farm.healthStatus}</b>. Ask me about NPK fertilizer, irrigation timing, or pest management anytime!`;
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

/* ==========================================================================
   3. SATELLITE VS. NDVI MAP SWIPE COMPARISON SLIDER
   ========================================================================== */

let isSwipeCompareActive = false;
let swipePositionPercent = 50;

function toggleSwipeCompare() {
    isSwipeCompareActive = !isSwipeCompareActive;
    const btn = document.getElementById("btnSwipeCompare");
    const divider = document.getElementById("mapSwipeDivider");

    if (btn) btn.classList.toggle("active", isSwipeCompareActive);

    if (isSwipeCompareActive) {
        if (currentBaseLayer !== "satellite") setMapBaseLayer("satellite");
        if (!isNDVIOverlayVisible) toggleNDVIOverlay();

        if (divider) {
            divider.style.display = "block";
            divider.style.left = "50%";
            swipePositionPercent = 50;
            applySwipeClip(50);
            initSwipeDrag();
        }
        showAgriToast("🌓 Swipe Compare Active: Drag slider across map to compare Satellite vs NDVI", "🌓");
    } else {
        if (divider) divider.style.display = "none";
        resetSwipeClip();
        showAgriToast("Exited swipe compare mode", "✓");
    }
}

function applySwipeClip(pct) {
    if (!map) return;
    const overlayPane = map.getPane("overlayPane");
    if (overlayPane) {
        // Reveals satellite on left and NDVI false-color heatmap on right
        overlayPane.style.clipPath = `polygon(${pct}% 0, 100% 0, 100% 100%, ${pct}% 100%)`;
    }
}

function resetSwipeClip() {
    if (!map) return;
    const overlayPane = map.getPane("overlayPane");
    if (overlayPane) {
        overlayPane.style.clipPath = "none";
    }
}

let swipeListenersAttached = false;
function initSwipeDrag() {
    if (swipeListenersAttached) return;
    swipeListenersAttached = true;

    const divider = document.getElementById("mapSwipeDivider");
    const mapWrap = document.getElementById("mapContainerWrap");
    if (!divider || !mapWrap) return;

    let isDragging = false;

    const onStart = (e) => {
        isDragging = true;
        e.preventDefault();
    };

    const onMove = (e) => {
        if (!isDragging || !isSwipeCompareActive) return;
        const rect = mapWrap.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let x = clientX - rect.left;
        let pct = (x / rect.width) * 100;
        pct = Math.max(5, Math.min(95, pct));
        swipePositionPercent = pct;
        divider.style.left = `${pct}%`;
        applySwipeClip(pct);
    };

    const onEnd = () => {
        isDragging = false;
    };

    divider.addEventListener("mousedown", onStart);
    divider.addEventListener("touchstart", onStart, { passive: false });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchend", onEnd);
}

/* ==========================================================================
   4. YIELD & HARVEST ROI CALCULATOR ENGINE
   ========================================================================== */

function runHarvestROICalculation() {
    const cropSelect = document.getElementById("calcCropSelect");
    const areaInput = document.getElementById("calcFieldArea");
    const irrigationSelect = document.getElementById("calcIrrigation");
    const priceInput = document.getElementById("calcMarketPrice");
    const ndviSlider = document.getElementById("calcNDVISlider");

    if (!cropSelect || !areaInput || !priceInput || !ndviSlider) return;

    const selectedOption = cropSelect.options[cropSelect.selectedIndex];
    const baseYield = parseFloat(selectedOption.getAttribute("data-base-yield")) || 40;
    const pricePerQtl = parseFloat(priceInput.value) || 2275;
    const areaHa = parseFloat(areaInput.value) || 40;
    const ndvi = parseFloat(ndviSlider.value) || 0.82;
    const irrigation = irrigationSelect ? irrigationSelect.value : "drip";

    // Irrigation efficiency multiplier
    let irrigMult = 1.12;
    let waterConservedPct = 22;
    let irrigTag = "Micro-Drip (+12%)";
    if (irrigation === "sprinkler") { irrigMult = 1.06; waterConservedPct = 14; irrigTag = "Sprinkler (+6%)"; }
    else if (irrigation === "canal") { irrigMult = 1.0; waterConservedPct = 0; irrigTag = "Surface / Flood"; }
    else if (irrigation === "rainfed") { irrigMult = 0.90; waterConservedPct = -10; irrigTag = "Rainfed (-10%)"; }

    // NDVI physiological biomass curve (0.65 is standard baseline)
    const ndviDelta = ndvi - 0.65;
    const ndviYieldMult = Math.max(0.60, Math.min(1.30, 1 + (ndviDelta * 0.75)));

    // Yield Calculations
    const yieldPerHa = parseFloat((baseYield * ndviYieldMult * irrigMult).toFixed(1));
    const totalYieldQtl = Math.round(yieldPerHa * areaHa);
    const totalYieldTonnes = (totalYieldQtl / 10).toFixed(1);

    // Revenue Calculations (Indian Rupee MSP format)
    const grossRevenue = Math.round(totalYieldQtl * pricePerQtl);
    const revPerHa = Math.round(grossRevenue / (areaHa || 1));

    // Variable-Rate Precision Fertilizer Savings
    const fertSavingRate = ndvi >= 0.70 ? 3800 : 2500;
    const fertSavings = Math.round(areaHa * fertSavingRate);
    const ureaSavedKg = Math.round(areaHa * 30);

    // Precision Water Requirement (m3)
    const waterBasePerHa = 4000;
    const waterTotal = Math.round(areaHa * waterBasePerHa * (irrigation === "drip" ? 0.78 : irrigation === "sprinkler" ? 0.88 : 1.0));

    // Efficiency delta badge
    const efficiencyDelta = Math.round((ndviYieldMult - 1) * 100);
    const effTag = document.getElementById("calcYieldEfficiencyTag");
    if (effTag) {
        effTag.innerText = `${efficiencyDelta >= 0 ? '+' : ''}${efficiencyDelta}% vs Baseline`;
        effTag.className = `roi-tag ${efficiencyDelta >= 0 ? 'badge-safe' : 'badge-danger'}`;
    }

    const waterTagElem = document.getElementById("calcWaterTag");
    if (waterTagElem) waterTagElem.innerText = irrigTag;

    setText("calcProjectedYield", `${totalYieldQtl.toLocaleString('en-IN')} <small>Quintals</small>`);
    setText("calcYieldPerHa", `${yieldPerHa} Quintals / Hectare (~${totalYieldTonnes} Tonnes total)`);
    setText("calcGrossRevenue", `₹${grossRevenue.toLocaleString('en-IN')}`);
    setText("calcRevenuePerHa", `~₹${revPerHa.toLocaleString('en-IN')} / Hectare`);
    setText("calcFertilizerSavings", `₹${fertSavings.toLocaleString('en-IN')}`);
    setText("calcUreaSaved", `~${ureaSavedKg.toLocaleString('en-IN')} kg Urea & DAP saved by zone mapping`);
    setText("calcWaterReq", `${waterTotal.toLocaleString('en-IN')} <small>m³</small>`);
    setText("calcWaterSavings", `~${waterConservedPct}% water conserved vs standard flood irrigation`);
}

function syncCalculatorWithCurrentFarm() {
    if (!currentFarmData) return;
    const cropSelect = document.getElementById("calcCropSelect");
    const areaInput = document.getElementById("calcFieldArea");
    const priceInput = document.getElementById("calcMarketPrice");
    const ndviSlider = document.getElementById("calcNDVISlider");
    const ndviVal = document.getElementById("calcNDVIVal");

    if (cropSelect) {
        for (let i = 0; i < cropSelect.options.length; i++) {
            if (currentFarmData.crop.toLowerCase().includes(cropSelect.options[i].value.toLowerCase())) {
                cropSelect.selectedIndex = i;
                const defaultPrice = cropSelect.options[i].getAttribute("data-price");
                if (priceInput && defaultPrice) priceInput.value = defaultPrice;
                break;
            }
        }
    }

    if (areaInput && currentFarmData.area) {
        const parsedArea = parseFloat(currentFarmData.area);
        if (!isNaN(parsedArea)) areaInput.value = parsedArea;
    }

    if (ndviSlider && currentFarmData.ndvi) {
        ndviSlider.value = currentFarmData.ndvi;
        if (ndviVal) ndviVal.innerText = currentFarmData.ndvi.toFixed(2);
    }

    runHarvestROICalculation();
    showAgriToast(`Synced calculator with ${currentFarmData.name}`, "💰");
}

/* ==========================================================================
   5. LEAFLET MAP POLYGON BOUNDARY DRAW TOOL
   ========================================================================== */

let isDrawingBoundary = false;
let drawnPoints = [];
let drawnMarkers = [];
let drawnPolygonLayer = null;

function toggleDrawBoundary() {
    isDrawingBoundary = !isDrawingBoundary;
    const btn = document.getElementById("btnDrawBoundary");
    const banner = document.getElementById("mapDrawBanner");
    const mapWrap = document.getElementById("mapContainerWrap");

    if (btn) btn.classList.toggle("active", isDrawingBoundary);

    if (isDrawingBoundary) {
        if (banner) banner.style.display = "flex";
        if (mapWrap) mapWrap.classList.add("map-crosshair-active");
        clearDrawnBoundary();
        showAgriToast("✏️ Click on map to plot field boundary corners. Add 3+ points then click Finish.", "✏️");
    } else {
        cancelDrawBoundary();
    }
}

function handleDrawMapClick(lat, lng) {
    if (!isDrawingBoundary || !map) return;
    drawnPoints.push([lat, lng]);

    // Place vertex pin marker
    const vertexIcon = L.divIcon({
        className: "drawn-vertex-pin",
        html: `<div style="width:14px; height:14px; border-radius:50%; background:#06b6d4; border:2px solid #ffffff; box-shadow:0 0 10px #06b6d4;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });
    const marker = L.marker([lat, lng], { icon: vertexIcon }).addTo(map);
    drawnMarkers.push(marker);

    // Update interactive polygon boundary
    if (drawnPolygonLayer) map.removeLayer(drawnPolygonLayer);

    if (drawnPoints.length >= 2) {
        drawnPolygonLayer = L.polygon(drawnPoints, {
            color: "#06b6d4",
            weight: 2.5,
            dashArray: "4, 4",
            fillColor: "#06b6d4",
            fillOpacity: 0.25
        }).addTo(map);
    }

    // Compute live spherical geodesic area in Hectares
    const areaHa = computePolygonAreaHectares(drawnPoints);
    const badge = document.getElementById("drawAreaBadge");
    if (badge) {
        badge.innerText = `${drawnPoints.length} points (${areaHa.toFixed(2)} Ha)`;
    }
}

function computePolygonAreaHectares(points) {
    if (points.length < 3) return 0;
    const R = 6378137; // Earth radius in meters
    let total = 0;
    const rad = Math.PI / 180;

    for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        total += (p2[1] * rad - p1[1] * rad) * (2 + Math.sin(p1[0] * rad) + Math.sin(p2[0] * rad));
    }
    const areaSqMeters = Math.abs(total * R * R / 2.0);
    return areaSqMeters / 10000; // 10,000 m2 = 1 Hectare
}

function finishDrawnBoundary() {
    if (drawnPoints.length < 3) {
        showAgriToast("Plot at least 3 points to form a closed field parcel", "⚠️");
        return;
    }

    const areaHa = computePolygonAreaHectares(drawnPoints);
    const centerLat = drawnPoints.reduce((sum, p) => sum + p[0], 0) / drawnPoints.length;
    const centerLng = drawnPoints.reduce((sum, p) => sum + p[1], 0) / drawnPoints.length;

    // Store custom boundary coordinates for when form is submitted
    window.pendingDrawnBoundary = [...drawnPoints];

    // Open Add Field Modal and prefill with drawn data
    openAddFieldModal();
    const latInput = document.getElementById("newFieldLat");
    const lngInput = document.getElementById("newFieldLng");
    const sizeInput = document.getElementById("newFieldSize");

    if (latInput) latInput.value = centerLat.toFixed(5);
    if (lngInput) lngInput.value = centerLng.toFixed(5);
    if (sizeInput) sizeInput.value = areaHa.toFixed(1);

    showAgriToast(`✅ Traced ${areaHa.toFixed(2)} Ha parcel! Form prefilled with coordinates.`, "🌱");
    exitDrawModeUI();
}

function cancelDrawBoundary() {
    clearDrawnBoundary();
    exitDrawModeUI();
    showAgriToast("Field drawing cancelled", "✕");
}

function exitDrawModeUI() {
    isDrawingBoundary = false;
    const btn = document.getElementById("btnDrawBoundary");
    const banner = document.getElementById("mapDrawBanner");
    const mapWrap = document.getElementById("mapContainerWrap");

    if (btn) btn.classList.remove("active");
    if (banner) banner.style.display = "none";
    if (mapWrap) mapWrap.classList.remove("map-crosshair-active");
}

function clearDrawnBoundary() {
    drawnPoints = [];
    drawnMarkers.forEach(m => { if (map) map.removeLayer(m); });
    drawnMarkers = [];
    if (drawnPolygonLayer && map) {
        map.removeLayer(drawnPolygonLayer);
        drawnPolygonLayer = null;
    }
    const badge = document.getElementById("drawAreaBadge");
    if (badge) badge.innerText = "0 points (0.00 Ha)";
}