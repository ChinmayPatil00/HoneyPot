import React, { useState, useEffect, useMemo } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { io } from "socket.io-client";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ShieldAlert, Activity, Globe, MapPin, X, ShieldCheck } from "lucide-react";
import "./App.css";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";
const socket = io(BACKEND_URL);

// Colors for Pie Chart
const COLORS = ['#FF4444', '#FF8800', '#FFCC00', '#00C851', '#33B5E5'];

function App() {
  const [attacks, setAttacks] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/attacks`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAttacks(data);
        }
      })
      .catch(err => console.error("Error fetching past attacks:", err));
  }, []);

  useEffect(() => {
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("new_attack", (data) => {
      setAttacks((prevAttacks) => [data, ...prevAttacks].slice(0, 100));
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("new_attack");
    };
  }, []);

  // Compute Top 5 Passwords
  const topPasswords = useMemo(() => {
    const counts = {};
    attacks.forEach(a => counts[a.passwordTried] = (counts[a.passwordTried] || 0) + 1);
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [attacks]);

  // Compute Top 5 Countries
  const topCountries = useMemo(() => {
    const counts = {};
    attacks.forEach(a => {
      const country = a.country || "Unknown";
      counts[country] = (counts[country] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [attacks]);

  const handleSimulateAttack = async () => {
    setIsSimulating(true);
    
    const global_ips = [
      "46.17.40.1", "176.12.34.12", "95.108.1.1", 
      "114.114.114.114", "220.181.38.148", "211.162.240.1",
      "177.20.10.1", "187.10.20.30",
      "192.200.1.1", "64.233.160.1", "198.51.100.1",
      "144.76.10.1", "88.198.50.1",
      "212.58.244.20", "81.134.202.29",
      "133.1.2.3", "124.83.159.212"
    ];
    const passwords = ["123456", "admin", "root", "password", "qwerty", "12345678", "hacker123", "letmein"];
    const usernames = ["root", "admin", "postgres", "ubuntu", "test"];

    const payload = {
      ip: global_ips[Math.floor(Math.random() * global_ips.length)],
      username: usernames[Math.floor(Math.random() * usernames.length)],
      passwordTried: passwords[Math.floor(Math.random() * passwords.length)]
    };

    try {
      await fetch(`${BACKEND_URL}/api/attack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Simulation failed", e);
    }
    
    // Add small delay to let the animation show
    setTimeout(() => setIsSimulating(false), 800);
  };

  return (
    <div className="dashboard-container">
      <header className="header glass-panel">
        <div className="header-title">
          <ShieldCheck size={32} color="#00C851" />
          <h1>Global Threat Intelligence Network</h1>
        </div>
        <div className="header-actions">
          <div className="status-badge">
             {isConnected ? <span className="connected">🟢 Live</span> : <span className="disconnected">🔴 Offline</span>}
          </div>
          <button 
            className={`simulate-btn ${isSimulating ? 'simulating' : ''}`} 
            onClick={handleSimulateAttack}
            disabled={isSimulating}
          >
            <ShieldAlert size={18} />
            {isSimulating ? 'Launching...' : 'Simulate Cyberattack'}
          </button>
        </div>
      </header>

      {/* Analytics Row */}
      <div className="analytics-row">
        <div className="chart-card glass-panel">
          <h3><Activity size={18} /> Top 5 Passwords Guessed</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPasswords} layout="vertical" margin={{ left: 30, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#1a1a24', border: '1px solid #333', borderRadius: '8px'}} />
                <Bar dataKey="count" fill="#FF4444" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card glass-panel">
          <h3><Globe size={18} /> Top Attacking Countries</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={topCountries} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                  {topCountries.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{backgroundColor: '#1a1a24', border: '1px solid #333', borderRadius: '8px', color: '#fff'}} itemStyle={{color: '#fff'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="stats-card glass-panel">
           <div className="stat-box">
             <h4>Total Intercepts</h4>
             <span className="stat-value">{attacks.length}</span>
           </div>
           <div className="stat-box">
             <h4>Unique IPs</h4>
             <span className="stat-value">{new Set(attacks.map(a => a.ip)).size}</span>
           </div>
        </div>
      </div>

      <div className="main-content">
        <div className="map-container glass-panel">
          <ComposableMap projection="geoMercator" projectionConfig={{ scale: 130 }}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#1e1e28"
                    stroke="#2a2a35"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#3a3a45", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>
            {attacks.map((attack, index) => (
              <Marker key={index} coordinates={[attack.lon, attack.lat]}>
                <circle r={4} fill="#FF4444" />
                <circle r={14} fill="none" stroke="#FF4444" strokeWidth="2" className="pulse-marker" />
              </Marker>
            ))}
          </ComposableMap>
        </div>

        <div className="feed-container glass-panel">
          <h2><Activity size={18} /> Live Attack Feed</h2>
          <div className="attack-list">
            {attacks.length === 0 ? (
              <p className="waiting-msg">System Active. Waiting for attacks...</p>
            ) : (
              attacks.map((attack, i) => (
                <div key={i} className="attack-card" onClick={() => setSelectedThreat(attack)}>
                  <div className="attack-header">
                    <span className="ip">{attack.ip}</span>
                    <span className="time">{new Date(attack.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="attack-details">
                    <p><span>User:</span> {attack.username}</p>
                    <p><span>Pass:</span> <span className="password">{attack.passwordTried}</span></p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Interactive Threat Modal */}
      {selectedThreat && (
        <div className="modal-overlay" onClick={() => setSelectedThreat(null)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedThreat(null)}><X size={20} /></button>
            <div className="modal-header">
              <ShieldAlert size={32} color="#FF4444" />
              <h2>Threat Analysis Report</h2>
            </div>
            <div className="modal-body">
              <div className="info-row"><MapPin size={16}/> <strong>Origin:</strong> {selectedThreat.city}, {selectedThreat.country}</div>
              <div className="info-row"><Globe size={16}/> <strong>IP Address:</strong> <span className="ip-highlight">{selectedThreat.ip}</span></div>
              <div className="info-row"><Activity size={16}/> <strong>Coordinates:</strong> {selectedThreat.lat.toFixed(4)}, {selectedThreat.lon.toFixed(4)}</div>
              
              <div className="threat-box">
                <h4>Attack Vector</h4>
                <p><strong>Method:</strong> SSH Brute Force (Port 22)</p>
                <p><strong>Username Tried:</strong> {selectedThreat.username}</p>
                <p><strong>Password Tried:</strong> {selectedThreat.passwordTried}</p>
                <div className="risk-score">
                   Risk Score: <span className="critical">CRITICAL (98/100)</span>
                </div>
              </div>
              <p className="timestamp-footer">Intercepted at {new Date(selectedThreat.timestamp).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
