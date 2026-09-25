# ORCA — Architecture & Collaborative Multi-Agent Reasoning

**ORCA (Marine EcOsystem Reasoning with Collaborative Agents)** is an intelligent, full-stack marine intelligence platform engineered for the **Smart India Hackathon (SIH)**.

---

## 1. System Architecture Overview

ORCA unites Earth Observation (EO) satellite telemetry, in-situ oceanographic buoys, and atmospheric mesoscale forecasts into a unified decision engine.

```
                              ┌────────────────────────────────────────┐
                              │            Client Interface            │
                              │    (React, Vite, Leaflet, Tailwind)    │
                              └───────────────────┬────────────────────┘
                                                  │ REST / JSON (JWT Auth)
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │          Express Backend & API         │
                              │   (Middleware, Rate Limiting, Routes)  │
                              └───────────────────┬────────────────────┘
                                                  │
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │           Coordinator Agent            │
                              │      - Query Intent Classification     │
                              │      - Geospatial Resolution           │
                              │      - Parallel Domain Delegation      │
                              │      - Reasoning Synthesis             │
                              └───────┬────────────────────────┬───────┘
                                      │                        │
         ┌────────────────────────────┼────────────────────────┼────────────────────────────┐
         ▼                            ▼                        ▼                            ▼
┌──────────────────┐        ┌──────────────────┐     ┌──────────────────┐         ┌──────────────────┐
│  Weather Agent   │        │   Ocean Agent    │     │     EO Agent     │         │ Geospatial Agent │
│ (WRF Winds/Rain) │        │(SST, Waves, Tide)│     │(Chlorophyll, OCM)│         │(Haversine/Bounds)│
└────────┬─────────┘        └─────────┬────────┘     └─────────┬────────┘         └─────────┬────────┘
         │                            │                        │                            │
         └────────────────────────────┼────────────────────────┼────────────────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │    Fishing Zone Agent     │
                        │ (PFZ Habitat Suitability) │
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │        Risk Agent         │
                        │ (Seaworthiness & Hazards) │
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │      Evidence Agent       │
                        │(Data Lineage Attribution) │
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │     AI Reasoner Node      │
                        │(Gemini / Offline Heuristic│
                        └───────────────────────────┘
```

---

## 2. Multi-Agent Responsibilities

| Agent Name | Primary Responsibility | Input Parameters | Output Indicators |
|---|---|---|---|
| **Coordinator Agent** | Orchestrates query pipeline, routes tasks, fuses evidence | User query string, origin coordinates | Final verified response JSON, execution audit log |
| **Weather Agent** | Analyzes atmospheric wind, visibility, and precipitation | Latitude, Longitude, Date | Surface wind speed/dir, visibility (km), squall condition |
| **Ocean Agent** | Analyzes hydrodynamic ocean parameters | Latitude, Longitude, Date | SST (°C), Significant Wave Height (m), Tide state |
| **Earth Observation Agent** | Remote sensing radiometry and algal bloom detection | Coastal sector coordinates | Chlorophyll-a (mg/m³), Thermal gradient (°C/km) |
| **Fishing Zone Agent** | Evaluates pelagic habitat suitability | SST, Chlorophyll, Wave height, Wind | Suitability (HIGH/MEDIUM/LOW), Confidence, Hotspots |
| **Geospatial Agent** | Spatial indexing, nearest port resolution, distance | Latitude, Longitude, Query tokens | Nearest coastal baseline, Haversine distances |
| **Risk Agent** | Maritime seaworthiness and vessel hazard evaluation | Hydro-meteorological vectors | Risk Level (LOW/MODERATE/HIGH), Risk Score (0-100) |
| **Evidence Agent** | Aggregates data provenance, sensor timestamps, citations | Contributing agent telemetry | Traceable Evidence Array for user verification |

---

## 3. Resilient Dual-Mode Design

ORCA strictly enforces an **Offline-First Resilience Principle**:
- **DEMO MODE (Default)**: Employs mathematically calibrated simulated baselines for 8 key Indian coastal waters (Mumbai, Goa, Kochi, Chennai, Visakhapatnam, Odisha, Veraval, Port Blair). Runs with 0 external API dependencies and never crashes if an external service drops.
- **LIVE PROVIDER MODE**: Extends `BaseWeatherProvider`, `BaseOceanProvider`, and `BaseEarthObservationProvider` adapters to integrate operational satellite feeds when credentials exist in `.env`.
