# ORCA Hardcode Detection & De-Hardcoding Audit Report

**Generated:** 2026-09-26T06:26:02.914Z  
**Files Scanned:** 117 across `client/src` and `server/src`  
**Compliance Standard:** ORCA Specification Rule 49 & No Fake Live Data Protocol  

---

## 1. Executive Summary

| Category | Status | Unallowed Static Data | Legitimate Config / Fallback | Migration Assessment |
|:---|:---:|:---:|:---:|:---|
| **Weather & Hydrodynamics** | PASSED | 0 | 8 | Dynamic Open-Meteo & IMD API integration connected. |
| **PFZ Intelligence** | PASSED | 0 | 0 | INCOIS advisory ingestion + dynamic derived PFZ suitability model. |
| **Risk Analysis** | PASSED | 0 | 0 | Deterministic formula computed dynamically from live wave/wind/alerts. |
| **Alerts & Warnings** | PASSED | 0 | 1 | Live evaluated hazard thresholds + official bulletins. |
| **Route Optimization** | PASSED | 0 | 0 | Dynamic A* waypoint calculation avoiding live swell & geofences. |
| **Geospatial Coordinates** | PASSED | 0 | 0 | OpenStreetMap Nominatim geocoder + user map click selection. |
| **Marine Telemetry Charts** | PASSED | 0 | 0 | Charts dynamically stream from `/api/marine/forecast` hourly series. |

---

## 2. Core Rule Compliance Verification

### Rule 3: Zero Fake Live Data
- **Verified:** Every endpoint and UI component stamps `dataMode` (`LIVE`, `HYBRID`, or `DEMO`) and `source`.
- **Verified:** No hardcoded numbers are ever presented as live satellite or in-situ readings.
- **Verified:** When live external feeds are unreachable or credentials are unconfigured, the UI clearly displays `HYBRID DATA MODE` or `LIVE DATA UNAVAILABLE`.

### Rule 10 & 11: Official INCOIS PFZ vs. Derived PFZ Analytics
- **Verified:** INCOIS official advisories retain attribution (`Source: INCOIS`, sector, advisory date).
- **Verified:** If official feeds are unconfigured or local bulletin files are absent, the system executes secondary `PFZ ANALYTICS MODE` and explicitly tags the output:
  > `ORCA DERIVED PFZ SUITABILITY — NOT OFFICIAL INCOIS PFZ ADVISORY`

### Rule 21: Deterministic Dynamic Risk Engine
- **Verified:** Gemini LLM is never prompted to fabricate risk numbers.
- **Verified:** Formula uses calibrated weights in `server/src/config/riskConfig.js` applied to dynamically retrieved wave height, wind speed, visibility, and active alerts.

### Rule 20: Dynamic Route Optimization
- **Verified:** No static GeoJSON routes in React components.
- **Verified:** Backend generates LineString routes dynamically via `routeOptimizerService.js` utilizing live marine wave thresholds and Turf.js geofence clearance.

---

## 3. Allowed Legitimate Configurations & Fallback Baselines

The audit identified 9 legitimate baseline configuration patterns safely encapsulated in:
- `server/src/config/dataSources.js` (central API endpoints and timeouts)
- `server/src/config/riskConfig.js` (deterministic mathematical weights)
- `server/src/data/geofences/marineGeofences.json` (GeoJSON polygons for marine protected areas and offshore defense zones)
- `server/src/dataSources/BaseDataSource.js` (offline zero-crash failover baseline when both primary and secondary APIs fail)
- `client/src/context/LocationContext.jsx` (initial default view center for Indian coastline)


## 4. Flagged Findings
**Zero suspicious or unallowed hardcoded marine data detected.** All frontend components consume data from API services.


---

## 5. Certification

The ORCA codebase is certified as **API-Driven, Time-Aware, Location-Aware, and Explainable**.
