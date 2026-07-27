import React, { useState, useEffect, useMemo } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { ShieldCheck, MapPin } from "lucide-react";
import { io } from "socket.io-client";
import Navbar from "./Navbar";
import "./MapFeature.css";
import "./Dashboard.css";

const geoUrl = "/countries-110m.json";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

const MapBaseLayer = React.memo(() => (
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
));

const MapFeature = () => {
  const [attacks, setAttacks] = useState([]);
  const [blacklistedIPs, setBlacklistedIPs] = useState([]);
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    let interval;
    if (isAutoSimulating) {
      interval = setInterval(() => {
        const randomIP = `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
        const randomCities = [
          {c:"Moscow", co:"Russia", lat: 55.75, lon: 37.61}, 
          {c:"Beijing", co:"China", lat: 39.9, lon: 116.4},
          {c:"Pyongyang", co:"North Korea", lat: 39.02, lon: 125.75},
          {c:"Tehran", co:"Iran", lat: 35.68, lon: 51.38},
          {c:"New York", co:"USA", lat: 40.71, lon: -74.00},
          {c:"London", co:"UK", lat: 51.50, lon: -0.12},
          {c:"Mumbai", co:"India", lat: 19.07, lon: 72.87},
          {c:"Tokyo", co:"Japan", lat: 35.67, lon: 139.65},
          {c:"Sydney", co:"Australia", lat: -33.86, lon: 151.20},
          {c:"Sao Paulo", co:"Brazil", lat: -23.55, lon: -46.63}
        ];
        const rc = randomCities[Math.floor(Math.random()*randomCities.length)];
        
        const newAttack = {
          ip: randomIP,
          username: "admin",
          passwordTried: "123456",
          city: rc.c,
          country: rc.co,
          lat: rc.lat,
          lon: rc.lon,
          timestamp: new Date().toISOString()
        };
        
        setAttacks(prev => [newAttack, ...prev].slice(0, 100));
      }, 1500); 
    }
    return () => clearInterval(interval);
  }, [isAutoSimulating]);

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
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 120,
              center: [0, 20]
            }}
            style={{ width: "100%", height: "100%" }}
          >
            <MapBaseLayer />
            {attacks.slice(0, 50).map((attack, index) => {
              const isBlocked = blacklistedIPs.includes(attack.ip);
              const jitterX = (index % 5) * 1.5 - 3.0;
              const jitterY = ((index * 3) % 5) * 1.5 - 3.0;
              return (
                <Marker key={attack._id || `${attack.timestamp}-${attack.ip}-${index}`} coordinates={[attack.lon + jitterX, attack.lat + jitterY]}>
                  <circle r={6} fill={isBlocked ? "#666666" : "#FF4444"} className={isBlocked ? "" : "blink-marker"} />
                </Marker>
              );
            })}
          </ComposableMap>
        </div>

        {/* Dedicated Geolocation Feed */}
        <div className="geo-feed glass-panel">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px'}}>
            <h2 style={{margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '1.1rem'}}>
              <MapPin size={18} /> Live Geographic Targets
            </h2>
            <button 
              className={`simulate-btn ${isAutoSimulating ? 'active' : ''}`}
              onClick={() => setIsAutoSimulating(!isAutoSimulating)}
              style={{padding: '4px 10px', fontSize: '0.8rem'}}
            >
              {isAutoSimulating ? "Stop Simulation" : "Auto-Simulate Traffic"}
            </button>
          </div>
          <div className="geo-list">
            {attacks.length === 0 ? (
              <p className="waiting-msg" style={{padding: '20px', textAlign: 'center', color: '#888'}}>System Active. Waiting for attacks...</p>
            ) : (
              <>
                {attacks.slice(0, visibleCount).map((attack, index) => {
                  const isBlocked = blacklistedIPs.includes(attack.ip);
                  return (
                    <div key={attack._id || `${attack.timestamp}-${attack.ip}-${index}`} className={`attack-card ${isBlocked ? 'blocked-card' : ''}`}>
                      <div className="attack-header">
                        <span className="ip">{attack.country || "Unknown Region"}</span>
                        <span className="time">{new Date(attack.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="attack-details">
                        <p><span>City:</span> {attack.city || "Unknown City"}</p>
                        <p><span>Coords:</span> <span className="password">[{attack.lat?.toFixed(2)}, {attack.lon?.toFixed(2)}]</span></p>
                      </div>
                    </div>
                  );
                })}
                {attacks.length > visibleCount && (
                  <button 
                    className="simulate-btn" 
                    onClick={() => setVisibleCount(prev => prev + 10)}
                    style={{width: '100%', marginTop: '10px', textAlign: 'center', justifyContent: 'center'}}
                  >
                    Load More Targets ({attacks.length - visibleCount} remaining)
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapFeature;
