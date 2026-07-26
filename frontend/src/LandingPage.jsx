import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Activity, Globe, Terminal } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Dynamic Background */}
      <div className="landing-bg"></div>
      
      <div className="landing-content">
        <div className="hero-section">
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
            <h3>Global Mapping</h3>
            <p>Real-time geographic threat plotting and actor origin tracing via embedded AI analysis.</p>
          </div>
          <div className="feature-card glass-panel">
            <Terminal size={32} className="feature-icon text-red" />
            <h3>Socket Interception</h3>
            <p>Raw TCP/UDP socket monitoring capturing live payload execution and brute force attempts.</p>
          </div>
          <div className="feature-card glass-panel">
            <ShieldCheck size={32} className="feature-icon text-green" />
            <h3>Automated Lockdown</h3>
            <p>Dynamic firewall rules automatically blacklisting high-volume attackers globally.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
