import React, { createContext, useContext, useState } from 'react';

export const COASTAL_REGIONS = [
  { id: 'mumbai', name: 'Mumbai Offshore', state: 'Maharashtra', lat: 18.922, lng: 72.8347, sea: 'Arabian Sea' },
  { id: 'goa', name: 'Goa Coastal Waters', state: 'Goa', lat: 15.4989, lng: 73.8278, sea: 'Arabian Sea' },
  { id: 'kochi', name: 'Kochi & Malabar Shelf', state: 'Kerala', lat: 9.9312, lng: 76.2673, sea: 'Arabian Sea' },
  { id: 'chennai', name: 'Chennai Coromandel Coast', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, sea: 'Bay of Bengal' },
  { id: 'vizag', name: 'Visakhapatnam Deep Coast', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185, sea: 'Bay of Bengal' },
  { id: 'odisha', name: 'Odisha Coast (Puri/Paradip)', state: 'Odisha', lat: 19.8135, lng: 85.8312, sea: 'Bay of Bengal' },
  { id: 'gujarat', name: 'Gujarat Coast (Veraval)', state: 'Gujarat', lat: 20.9077, lng: 70.3667, sea: 'Arabian Sea' },
  { id: 'andaman', name: 'Andaman & Nicobar (Port Blair)', state: 'Andaman', lat: 11.6234, lng: 92.7265, sea: 'Andaman Sea' }
];

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const [currentRegion, setCurrentRegion] = useState(COASTAL_REGIONS[0]); // Mumbai default
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  const selectRegionById = (regionId) => {
    const found = COASTAL_REGIONS.find((r) => r.id === regionId);
    if (found) {
      setCurrentRegion(found);
      setIsGpsActive(false);
      setGpsError(null);
    }
  };

  const setCustomLocation = (name, lat, lng) => {
    setCurrentRegion({
      id: 'custom_' + Date.now(),
      name: name || 'Selected Sector',
      state: 'Maritime Sector',
      lat: Number(lat),
      lng: Number(lng),
      sea: 'Indian Ocean'
    });
  };

  const useBrowserGeolocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentRegion({
          id: 'gps_device',
          name: 'Device GPS Location',
          state: 'Real-Time Position',
          lat: Number(latitude.toFixed(4)),
          lng: Number(longitude.toFixed(4)),
          sea: 'Local Waters'
        });
        setIsGpsActive(true);
        setGpsError(null);
      },
      (err) => {
        console.warn('Geolocation failed:', err.message);
        setGpsError('GPS access declined — continuing with default coastal station');
        setIsGpsActive(false);
      },
      { timeout: 8000 }
    );
  };

  return (
    <LocationContext.Provider
      value={{
        currentRegion,
        allRegions: COASTAL_REGIONS,
        selectRegionById,
        setCustomLocation,
        useBrowserGeolocation,
        isGpsActive,
        gpsError
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
