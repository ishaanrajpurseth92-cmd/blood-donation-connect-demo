import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Phone, Clock, AlertTriangle } from 'lucide-react';

// Fix for default Leaflet marker icons in React
const createCustomIcon = (isStale) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background: ${isStale ? '#F59E0B' : '#D7263D'};
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <div style="transform: rotate(45deg); font-weight: bold; font-size: 13px;">+</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

// Component to dynamically re-center map when coordinates change
const RecenterMap = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 12);
    }
  }, [center, zoom, map]);
  return null;
};

const HospitalMap = ({ hospitals = [], center = [28.6139, 77.2090], zoom = 11, selectedHospitalId }) => {
  const defaultPos = center[0] && center[1] ? center : [28.6139, 77.2090];

  return (
    <div className="w-full h-full min-h-[380px] rounded-2xl overflow-hidden shadow-inner border border-white/60 relative z-10">
      <MapContainer
        center={defaultPos}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
        style={{ minHeight: '380px', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={defaultPos} zoom={zoom} />

        {hospitals.map((h) => {
          if (!h.latitude || !h.longitude) return null;
          const pos = [parseFloat(h.latitude), parseFloat(h.longitude)];
          const isStale = Boolean(h.isStale);

          return (
            <Marker key={h.hospitalId || h.id} position={pos} icon={createCustomIcon(isStale)}>
              <Popup className="custom-hospital-popup">
                <div className="p-1 min-w-[220px]">
                  <div className="font-bold text-slate-900 text-sm mb-1">{h.hospitalName || h.name}</div>
                  <p className="text-xs text-slate-600 mb-2">{h.address}, {h.city} - {h.pinCode || h.pin_code}</p>

                  {isStale && (
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-800 text-[11px] p-1.5 rounded mb-2 border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Unverified / Stale Inventory</span>
                    </div>
                  )}

                  {h.distanceKm !== undefined && h.distanceKm !== null && (
                    <div className="text-xs font-semibold text-teal-700 mb-1">
                      Distance: ~{h.distanceKm} km away
                    </div>
                  )}

                  {h.contactNumber && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 mb-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{h.contactNumber}</span>
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t border-slate-100 flex gap-2">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${pos[0]},${pos[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
                    >
                      <Navigation className="w-3 h-3" />
                      Directions
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default HospitalMap;
