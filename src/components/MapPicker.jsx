import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

const pickerIcon = L.divIcon({
  className: 'custom-picker-marker',
  html: `
    <div style="
      background: #102A43;
      color: white;
      width: 34px;
      height: 34px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      border: 2px solid #D7263D;
    ">
      <div style="transform: rotate(45deg); font-size: 16px;">+</div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34]
});

function LocationMarker({ position, setPosition, onChange }) {
  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      onChange(e.latlng.lat, e.latlng.lng);
    }
  });

  return position ? (
    <Marker
      position={position}
      icon={pickerIcon}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const latLng = marker.getLatLng();
          const newPos = [latLng.lat, latLng.lng];
          setPosition(newPos);
          onChange(latLng.lat, latLng.lng);
        }
      }}
    />
  ) : null;
}

const MapPicker = ({ initialLat = 28.6139, initialLng = 77.2090, onChange }) => {
  const [position, setPosition] = useState([parseFloat(initialLat) || 28.6139, parseFloat(initialLng) || 77.2090]);

  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition([parseFloat(initialLat), parseFloat(initialLng)]);
    }
  }, [initialLat, initialLng]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setPosition([lat, lng]);
          onChange(lat, lng);
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
        }
      );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-1 font-medium text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-rose-500" /> Click or drag pin to select exact hospital coordinates
        </span>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800 font-semibold cursor-pointer underline"
        >
          <Navigation className="w-3 h-3" /> Detect My Location
        </button>
      </div>

      <div className="h-56 rounded-xl overflow-hidden border border-slate-300 relative z-10 shadow-sm">
        <MapContainer
          center={position}
          zoom={13}
          className="w-full h-full"
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} onChange={onChange} />
        </MapContainer>
      </div>

      <div className="flex gap-4 text-xs font-mono text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
        <div>Lat: <span className="font-semibold text-slate-800">{position[0]?.toFixed(5)}</span></div>
        <div>Lng: <span className="font-semibold text-slate-800">{position[1]?.toFixed(5)}</span></div>
      </div>
    </div>
  );
};

export default MapPicker;
