import React, { useEffect, memo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { WorkerProfile } from "../types";
import { Star, ShieldCheck, Navigation } from "lucide-react";

// Fix Leaflet marker icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Create custom Worker Marker Icon
const createWorkerIcon = (_categorySlug?: string, isLiveTracking = false) => {
  const color = isLiveTracking ? "#10B981" : "#0c8fe9";
  return L.divIcon({
    className: "custom-worker-marker",
    html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 13px;
        transform: translate(-50%, -50%);
        animation: ${isLiveTracking ? "pulse 1.5s infinite" : "none"};
      ">
        🛠️
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const createCustomerIcon = () => {
  return L.divIcon({
    className: "custom-customer-marker",
    html: `
      <div style="
        background: #F97316;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 15px;
        transform: translate(-50%, -50%);
      ">
        🏠
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

// Map Recenter Controller component
const RecenterMap: React.FC<{ lat: number; lng: number; zoom?: number }> = ({ lat, lng, zoom = 13 }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom);
  }, [lat, lng, zoom, map]);
  return null;
};

interface InteractiveMapProps {
  centerLat: number;
  centerLng: number;
  radiusKm?: number;
  workers?: (WorkerProfile & { distance_km?: number })[];
  onSelectWorker?: (worker: WorkerProfile) => void;
  onBookWorker?: (worker: WorkerProfile) => void;
  liveWorkerLat?: number;
  liveWorkerLng?: number;
  customerLat?: number;
  customerLng?: number;
  isTrackingMode?: boolean;
  className?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = memo(({
  centerLat,
  centerLng,
  radiusKm = 10,
  workers = [],
  onSelectWorker,
  onBookWorker,
  liveWorkerLat,
  liveWorkerLng,
  customerLat,
  customerLng,
  isTrackingMode = false,
  className = "h-[450px] w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800",
}) => {
  const activeLat = isTrackingMode && liveWorkerLat ? liveWorkerLat : centerLat;
  const activeLng = isTrackingMode && liveWorkerLng ? liveWorkerLng : centerLng;

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={[activeLat, activeLng]}
        zoom={isTrackingMode ? 14 : 13}
        scrollWheelZoom={false}
        preferCanvas={true}
        className="h-full w-full z-0"
      >
        <RecenterMap lat={activeLat} lng={activeLng} zoom={isTrackingMode ? 14 : 13} />

        {/* OpenStreetMap Fast Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Service Radius Filter Circle */}
        {!isTrackingMode && radiusKm && (
          <Circle
            center={[centerLat, centerLng]}
            radius={radiusKm * 1000}
            pathOptions={{
              color: "#0c8fe9",
              fillColor: "#0c8fe9",
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: "4, 6",
            }}
          />
        )}

        {/* Customer Location Pin */}
        <Marker
          position={[customerLat || centerLat, customerLng || centerLng]}
          icon={createCustomerIcon()}
        >
          <Popup>
            <div className="p-1 text-xs">
              <span className="font-bold text-orange-600">🏠 Your Location</span>
              <p className="text-slate-600 mt-0.5">Selected service address</p>
            </div>
          </Popup>
        </Marker>

        {/* Live Tracking Path and Live Worker Pin */}
        {isTrackingMode && liveWorkerLat && liveWorkerLng && customerLat && customerLng && (
          <>
            <Polyline
              positions={[
                [liveWorkerLat, liveWorkerLng],
                [customerLat, customerLng],
              ]}
              pathOptions={{
                color: "#10B981",
                weight: 4,
                dashArray: "8, 8",
              }}
            />
            <Marker
              position={[liveWorkerLat, liveWorkerLng]}
              icon={createWorkerIcon(undefined, true)}
            >
              <Popup>
                <div className="p-2 text-xs">
                  <div className="flex items-center space-x-1 text-emerald-600 font-bold">
                    <Navigation className="w-3.5 h-3.5 animate-spin" />
                    <span>Worker En Route</span>
                  </div>
                  <p className="text-slate-500 mt-1">Live tracking active</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Normal Worker Markers */}
        {!isTrackingMode &&
          workers.map((worker) => (
            <Marker
              key={worker.id}
              position={[worker.lat, worker.lng]}
              icon={createWorkerIcon()}
            >
              <Popup>
                <div className="p-2 w-56 text-slate-800">
                  <div className="flex items-center space-x-2.5 mb-2">
                    <img
                      src={worker.user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=75"}
                      alt={worker.user?.name}
                      loading="lazy"
                      className="w-10 h-10 rounded-full object-cover border border-brand-500"
                    />
                    <div>
                      <div className="flex items-center space-x-1">
                        <span className="font-bold text-xs">{worker.user?.name}</span>
                        {worker.is_approved && (
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-[11px] text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{worker.rating}</span>
                        <span className="text-slate-400 font-normal">({worker.review_count})</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 mb-2">
                    <div className="flex items-center justify-between">
                      <span>Rate:</span>
                      <span className="font-bold text-slate-900">₹{worker.hourly_rate}/hr</span>
                    </div>
                    {worker.distance_km !== undefined && (
                      <div className="flex items-center justify-between mt-0.5 text-brand-600 font-semibold">
                        <span>Distance:</span>
                        <span>{worker.distance_km} km away</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => onSelectWorker?.(worker)}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-semibold transition-colors"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => onBookWorker?.(worker)}
                      className="flex-1 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-[11px] font-bold shadow transition-colors"
                    >
                      Hire Now
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Floating map legend */}
      <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md text-[11px] flex items-center space-x-3 z-[400]">
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
          <span className="text-slate-700 dark:text-slate-300">Your Location</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block"></span>
          <span className="text-slate-700 dark:text-slate-300">Verified Pros</span>
        </div>
        {!isTrackingMode && (
          <div className="text-slate-400 font-medium">Radius: {radiusKm} km</div>
        )}
      </div>
    </div>
  );
});
