import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; // Just keeping global resets

const LandingPage = lazy(() => import('./LandingPage'));
const Dashboard = lazy(() => import('./Dashboard'));
const AttackerPortal = lazy(() => import('./Dashboard').then(module => ({ default: module.AttackerPortal })));
const MapFeature = lazy(() => import('./MapFeature'));

const App = () => {
  return (
    <Router>
      <Suspense fallback={<div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', color:'#888', background:'#0a0a0f'}}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<MapFeature />} />
          <Route path="/attack" element={<AttackerPortal />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
