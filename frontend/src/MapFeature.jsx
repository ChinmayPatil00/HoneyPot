import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { ShieldCheck, MapPin } from "lucide-react";
import { io } from "socket.io-client";
import Navbar from "./Navbar";
import "./MapFeature.css";

const geoUrl = "/countries-110m.json";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

const MAJOR_CITIES = [
  [-74.006, 40.7128], [-0.1276, 51.5074], [139.6917, 35.6895], 
  [37.6173, 55.7558], [116.4074, 39.9042], [151.2093, -33.8688], 
  [2.3522, 48.8566], [-118.2437, 34.0522], [13.405, 52.52], 
  [-43.1729, -22.9068], [103.8198, 1.3521], [28.0473, -26.2041], 
  [-99.1332, 19.4326], [72.8777, 19.076], [55.2708, 25.2048]
];

const MapFeature = () => {
  const [attacks, setAttacks] = useState([]);
  const [blacklistedIPs, setBlacklistedIPs] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/attacks`)
      .then(res => res.json())
      .then(data => setAttacks(data))
      .catch(err => console.error("Failed to fetch historical attacks", err));

    const socket = io(BACKEND_URL);
    socket.on('new_attack', (attack) => {
      setAttacks(prev => [attack, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="dashboard-container defcon-1">
      <Navbar />
      
      <div className="map-page-layout">
        {/* Huge Full-Screen Map Container */}
        <div className="map-container glass-panel full-map">
          <ComposableMap projection="geoMercator" projectionConfig={{ scale: 130 }}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#1a1a24"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#2a2a35", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>
            {attacks.slice(0, 50).map((attack, index) => {
              const isBlocked = blacklistedIPs.includes(attack.ip);
              const jitterX = (index % 5) * 1.5 - 3.0;
              const jitterY = ((index * 3) % 5) * 1.5 - 3.0;
              return (
                <Marker key={index} coordinates={[attack.lon + jitterX, attack.lat + jitterY]}>
                  <circle r={6} fill={isBlocked ? "#666666" : "#FF4444"} className={isBlocked ? "" : "blink-marker"} />
                </Marker>
              );
            })}
          </ComposableMap>
        </div>

        {/* Dedicated Geolocation Feed */}
        <div className="geo-feed glass-panel">
          <h2><MapPin size={18} /> Live Geographic Targets</h2>
          <div className="geo-list">
            {attacks.map((attack, index) => (
              <div key={index} className="geo-item">
                <div className="geo-header">
                  <span className="geo-country">{attack.country || "Unknown Region"}</span>
                  <span className="geo-time">{new Date(attack.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="geo-details">
                  <span className="geo-city">{attack.city || "Unknown City"}</span>
                  <span className="geo-coords">[{attack.lat?.toFixed(2)}, {attack.lon?.toFixed(2)}]</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapFeature;
