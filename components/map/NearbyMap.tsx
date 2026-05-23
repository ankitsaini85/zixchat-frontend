"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

/* 🔧 Fix default marker icons */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

type Props = {
  center: [number, number];
  users: {
    userId: string;
    name: string;
    gender: string;
    photo?: string | null;
    distanceKm: number;
    lat: number;
    lng: number;
  }[];
};

export default function NearbyMap({ center, users }: Props) {
  return (
    <MapContainer
      center={center}
      zoom={11}
      scrollWheelZoom={false}
      className="h-full w-full rounded-2xl overflow-hidden shadow-lg relative z-0"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 🔴 YOU */}
      <Marker position={center}>
        <Popup>You are here</Popup>
      </Marker>

      {/* 🟣 NEARBY USERS */}
      {users.map(u => (
        <Marker key={u.userId} position={[u.lat, u.lng]}>
          <Popup>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '150px' }}>
              {u.photo ? (
                <img
                  src={u.photo}
                  alt={u.name}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  {u.name.charAt(0)}
                </div>
              )}
              <div>
                <strong>{u.name}</strong>
                <br />
                <span style={{ fontSize: '12px', color: '#666' }}>{u.gender}</span>
                <br />
                <span style={{ fontSize: '12px', color: '#888' }}>{u.distanceKm} km away</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
