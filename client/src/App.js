import React, { useEffect, useState } from 'react';
import { LookerEmbedSDK } from '@looker/embed-sdk';
import './App.css';

function App() {
  const [dashboardUrl, setDashboardUrl] = useState('');
  const [exploreUrl, setExploreUrl] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    LookerEmbedSDK.init('https://sadasystems.looker.com', '/auth');
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

  useEffect(() => {
    if (dashboardUrl && activeTab === 'dashboard') {
      embedContent(dashboardUrl, 'dashboard');
    } else if (exploreUrl && activeTab === 'explore') {
      embedContent(exploreUrl, 'explore');
    }
  }, [dashboardUrl, exploreUrl, activeTab]);

  const embedContent = (url, elementId) => {
    LookerEmbedSDK.createDashboardWithUrl(url)
      .appendTo(`#${elementId}`)
      .withClassName('looker-embed')
      .build()
      .connect()
      .then(() => console.log(`${elementId} connected successfully`))
      .catch((error) => {
        console.error(`Error connecting to Looker embed for ${elementId}:`, error);
        console.error('Full error object:', JSON.stringify(error, null, 2));
      });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Looker Embedded Content</h1>
      </header>
      <main>
        <div className="tabs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={activeTab === 'dashboard' ? 'active' : ''}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={activeTab === 'explore' ? 'active' : ''}
          >
            Explore
          </button>
        </div>
        <div className="tab-content">
          <div id="dashboard" style={{ width: '100%', height: '600px', display: activeTab === 'dashboard' ? 'block' : 'none' }}>
            {dashboardUrl && <iframe src={dashboardUrl} width="100%" height="100%" frameBorder="0"></iframe>}
          </div>
          <div id="explore" style={{ width: '100%', height: '600px', display: activeTab === 'explore' ? 'block' : 'none' }}>
            {exploreUrl && <iframe src={exploreUrl} width="100%" height="100%" frameBorder="0"></iframe>}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;