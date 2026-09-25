import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import AssistantPage from './pages/AssistantPage';
import MapPage from './pages/MapPage';
import FishingZonesPage from './pages/FishingZonesPage';
import MarineConditionsPage from './pages/MarineConditionsPage';
import RiskAnalysisPage from './pages/RiskAnalysisPage';
import DataSourcesPage from './pages/DataSourcesPage';
import AlertsPage from './pages/AlertsPage';
import AdminStatusPage from './pages/AdminStatusPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <Routes>
            {/* Public Landing & Authentication */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated Marine Portal Layout */}
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/fishing-zones" element={<FishingZonesPage />} />
              <Route path="/conditions" element={<MarineConditionsPage />} />
              <Route path="/risk" element={<RiskAnalysisPage />} />
              <Route path="/data-sources" element={<DataSourcesPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/admin" element={<AdminStatusPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
