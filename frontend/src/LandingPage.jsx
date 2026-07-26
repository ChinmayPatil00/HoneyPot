import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Activity, Globe, Terminal } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState("");
  const fullText = "Establishing secure connection to Threat Node... ACCESS GRANTED.";

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      setTypedText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) clearInterval(typingInterval);
    }, 50);
    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className="landing-container">
      {/* Dynamic Background */}
      <div className="landing-bg"></div>
      
      <div className="landing-content">
        <div className="hero-section">
          <div className="terminal-typing">
            <span className="prompt">$ </span>{typedText}<span className="cursor">_</span>
          </div>
          
          <div className="shield-icon-container">
            <ShieldCheck size={80} className="glow-icon" />
          </div>
          <h1 className="hero-title">Global Threat Intelligence</h1>
          <p className="hero-subtitle">
            A high-interaction Honeypot Network designed to intercept, analyze, and profile 
            unauthorized network intrusions in real-time.
          </p>
          
          <button 
            className="enter-btn pulse-btn" 
            onClick={() => navigate('/dashboard')}
          >
            <Activity size={20} /> Initialize Dashboard
          </button>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-panel">
            <Globe size={32} className="feature-icon text-blue" />
            <h3>Global Threat Mapping</h3>
            <p>Our embedded AI analyzes incoming packets and traces actor origins, plotting cyber-attacks on an interactive 3D global map in real-time to visualize worldwide intrusion trends.</p>
          </div>
          <div className="feature-card glass-panel">
            <Terminal size={32} className="feature-icon text-red" />
            <h3>Socket Interception</h3>
            <p>Raw TCP/UDP socket monitoring captures live payload execution, credential brute-forcing, and zero-day exploitation attempts against the honeypot for forensic analysis.</p>
          </div>
          <div className="feature-card glass-panel">
            <ShieldCheck size={32} className="feature-icon text-green" />
            <h3>Automated Lockdown</h3>
            <p>Dynamic firewall algorithms automatically profile high-volume threat actors and aggressively blacklist hostile IP ranges, instantly hardening the system infrastructure.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
