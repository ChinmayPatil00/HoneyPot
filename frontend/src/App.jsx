import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import Dashboard, { AttackerPortal } from './Dashboard';
import MapFeature from './MapFeature';
import './App.css'; // Just keeping global resets

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/map" element={<MapFeature />} />
        <Route path="/attack" element={<AttackerPortal />} />
      </Routes>
    </Router>
  );
};

export default App;
