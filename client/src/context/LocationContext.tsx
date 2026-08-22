import React, { createContext, useContext, useState, useEffect } from "react";

export interface CityInfo {
  name: string;
  state: string;
  lat: number;
  lng: number;
}

export const INDIAN_CITIES: CityInfo[] = [
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777 },
  { name: "Delhi NCR", state: "Delhi", lat: 28.6139, lng: 77.2090 },
  { name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 },
  { name: "Chandigarh", state: "Punjab/Haryana", lat: 30.7333, lng: 76.7794 },
  { name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376 },
  { name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245 },
  { name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577 },
];

export const DISTANCE_OPTIONS = [2, 5, 10, 20, 50]; // km

interface LocationContextType {
  lat: number;
  lng: number;
  cityName: string;
  addressText: string;
  radiusKm: number;
  setRadiusKm: (radius: number) => void;
  selectCity: (city: CityInfo) => void;
  detectCurrentLocation: () => Promise<void>;
  isDetecting: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lat, setLat] = useState<number>(12.9716); // Default Bengaluru
  const [lng, setLng] = useState<number>(77.5946);
  const [cityName, setCityName] = useState<string>("Bengaluru");
  const [addressText, setAddressText] = useState<string>("Indiranagar, Bengaluru, Karnataka");
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  // Load from local storage if saved
  useEffect(() => {
    const savedCity = localStorage.getItem("homeease_city");
    if (savedCity) {
      const match = INDIAN_CITIES.find((c) => c.name === savedCity);
      if (match) {
        selectCity(match);
      }
    }
  }, []);

  const selectCity = (city: CityInfo) => {
    setLat(city.lat);
    setLng(city.lng);
    setCityName(city.name);
    setAddressText(`${city.name}, ${city.state}`);
    localStorage.setItem("homeease_city", city.name);
  };

  const detectCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setAddressText("Current Detected GPS Location");
        setIsDetecting(false);
      },
      (err) => {
        console.warn("Geolocation detection skipped/denied:", err.message);
        setIsDetecting(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <LocationContext.Provider
      value={{
        lat,
        lng,
        cityName,
        addressText,
        radiusKm,
        setRadiusKm,
        selectCity,
        detectCurrentLocation,
        isDetecting,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocationContext must be used within LocationProvider");
  return context;
};
