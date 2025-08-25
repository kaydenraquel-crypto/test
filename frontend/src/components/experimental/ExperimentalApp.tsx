import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { AppShell } from './AppShell';
import { Dashboard } from './pages/Dashboard';
import { Charts } from './pages/Charts';
import { Trading } from './pages/Trading';
import { Portfolio } from './pages/Portfolio';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Alerts } from './pages/Alerts';
import { News } from './pages/News';
import { SuperNova } from './pages/SuperNova';

// Import your existing App as a component
import App from '../../App';

export function ExperimentalApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle redirect from /experimental.html to root
  useEffect(() => {
    if (location.pathname === '/experimental.html') {
      window.history.replaceState(null, '', '/');
    }
  }, [location]);

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppShell 
        sidebarOpen={sidebarOpen} 
        onSidebarToggle={handleSidebarToggle}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/trading" element={<Trading />} />
          <Route path="/original" element={
            <Box sx={{ height: '100%', overflow: 'auto' }}>
              <App />
            </Box>
          } />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/news" element={<News />} />
          <Route path="/supernova" element={<SuperNova />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/settings" element={<Settings />} />
          {/* Catch-all route to redirect unmatched paths to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </Box>
  );
}