import React, { useEffect, useState, useRef } from 'react';
import { LookerEmbedSDK } from '@looker/embed-sdk';
import './App.css';

function App() {
  const [dashboardUrl, setDashboardUrl] = useState('');
  const [exploreUrl, setExploreUrl] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const dashboardRef = useRef(null);
  const exploreRef = useRef(null);

  useEffect(() => {
    LookerEmbedSDK.init('https://sadasystems.looker.com');
    fetchEmbedUrls();
  }, []);

  const fetchEmbedUrls = async () => {
    try {
      const dashboardResponse = await fetch('http://localhost:3001/auth/dashboard', { credentials: 'include' });
      const exploreResponse = await fetch('http://localhost:3001/auth/explore', { credentials: 'include' });

      if (!dashboardResponse.ok || !exploreResponse.ok) {
        throw new Error(`HTTP error! status: ${dashboardResponse.status} ${exploreResponse.status}`);
      }

      const dashboardData = await dashboardResponse.json();
      const exploreData = await exploreResponse.json();

      console.log('Received dashboard URL:', dashboardData.url);
      console.log('Received explore URL:', exploreData.url);

      setDashboardUrl(dashboardData.url);
      setExploreUrl(exploreData.url);
    } catch (error) {
      console.error('Error fetching auth URLs:', error);
    }
  };

  const embedDashboard = (url) => {
    if (!dashboardRef.current) {
      LookerEmbedSDK.createDashboardWithUrl(url)
        .appendTo('#dashboard')
        .withClassName('looker-embed')
        .withTheme('Looker')
        .build()
        .connect()
        .then((embedded) => {
          console.log('Dashboard connected successfully');
          dashboardRef.current = embedded;
        })
        .catch((error) => console.error('Error connecting to Looker embed:', error));
    } else {
      dashboardRef.current.connect().catch((error) => console.error('Error reconnecting to dashboard:', error));
    }
  };

  const embedExplore = (url) => {
    if (!exploreRef.current) {
      LookerEmbedSDK.createExploreWithUrl(url)
        .appendTo('#explore')
        .withClassName('looker-embed')
        .withTheme('Looker')
        .build()
        .connect()
        .then((embedded) => {
          console.log('Explore connected successfully');
          exploreRef.current = embedded;
        })
        .catch((error) => console.error('Error connecting to Looker embed:', error));
    } else {
      exploreRef.current.connect().catch((error) => console.error('Error reconnecting to explore:', error));
    }
  };

  useEffect(() => {
    if (dashboardUrl && activeTab === 'dashboard') {
      embedDashboard(dashboardUrl);
    } else if (exploreUrl && activeTab === 'explore') {
      embedExplore(exploreUrl);
    }
  }, [dashboardUrl, exploreUrl, activeTab]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    // Instead of clearing content, we'll just hide/show the appropriate container
    document.getElementById('dashboard').style.display = tab === 'dashboard' ? 'block' : 'none';
    document.getElementById('explore').style.display = tab === 'explore' ? 'block' : 'none';
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Looker Embedded Content</h1>
      </header>
      <main style={{ height: 'calc(100vh - 100px)' }}>
        <div className="tabs">
          <button
            onClick={() => handleTabSwitch('dashboard')}
            className={activeTab === 'dashboard' ? 'active' : ''}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleTabSwitch('explore')}
            className={activeTab === 'explore' ? 'active' : ''}
          >
            Explore
          </button>
        </div>
        <div className="tab-content" style={{ height: 'calc(100% - 50px)' }}>
          <div id="dashboard" style={{ width: '100%', height: '100%', display: activeTab === 'dashboard' ? 'block' : 'none' }}></div>
          <div id="explore" style={{ width: '100%', height: '100%', display: activeTab === 'explore' ? 'block' : 'none' }}></div>
        </div>
      </main>
    </div>
  );
}

export default App;