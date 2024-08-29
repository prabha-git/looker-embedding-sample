import React, { useEffect, useState, useRef } from 'react';
import { LookerEmbedSDK } from '@looker/embed-sdk';
import './App.css';

function App() {
  const [dashboardUrl, setDashboardUrl] = useState('');
  const [dashboard1Url, setDashboard1Url] = useState('');
  const [exploreUrl, setExploreUrl] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const dashboardRef = useRef(null);
  const dashboard1Ref = useRef(null);
  const exploreRef = useRef(null);

  useEffect(() => {
    LookerEmbedSDK.init('https://sadasystems.looker.com');
    fetchEmbedUrls();
  }, []);

  const fetchEmbedUrls = async () => {
    try {
      const dashboardResponse = await fetch('http://localhost:3001/auth/dashboard', { credentials: 'include' });
      const dashboard1Response = await fetch('http://localhost:3001/auth/dashboard1', { credentials: 'include' });
      const exploreResponse = await fetch('http://localhost:3001/auth/explore', { credentials: 'include' });

      if (!dashboardResponse.ok || !dashboard1Response.ok || !exploreResponse.ok) {
        throw new Error(`HTTP error! status: ${dashboardResponse.status} ${dashboard1Response.status} ${exploreResponse.status}`);
      }

      const dashboardData = await dashboardResponse.json();
      const dashboard1Data = await dashboard1Response.json();
      const exploreData = await exploreResponse.json();

      setDashboardUrl(dashboardData.url);
      setDashboard1Url(dashboard1Data.url);
      setExploreUrl(exploreData.url);
    } catch (error) {
      console.error('Error fetching auth URLs:', error);
    }
  };

  const clearEmbedContainer = (containerId) => {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }
  };

  const embedDashboard = async (url, containerId, ref) => {
    if (ref.current) {
      console.log(`${containerId} iframe already exists, reusing it.`);
      return;
    }
    console.log(`Embedding ${containerId} with URL:`, url);

    clearEmbedContainer(containerId);

    LookerEmbedSDK.createDashboardWithUrl(url)
      .appendTo(`#${containerId}`)
      .withClassName('looker-embed')
      .withTheme('Looker')
      .build()
      .connect()
      .then((embedded) => {
        console.log(`${containerId} connected successfully`);
        ref.current = embedded;
      })
      .catch((error) => console.error(`Error connecting to Looker embed for ${containerId}:`, error));
  };

  const embedExplore = async (url) => {
    if (exploreRef.current) {
      console.log('Explore iframe already exists, reusing it.');
      return;
    }
    console.log('Embedding explore with URL:', url);

    clearEmbedContainer('explore');

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
  };

  useEffect(() => {
    if (activeTab === 'dashboard' && dashboardUrl) {
      embedDashboard(dashboardUrl, 'dashboard', dashboardRef);
    } else if (activeTab === 'dashboard1' && dashboard1Url) {
      embedDashboard(dashboard1Url, 'dashboard1', dashboard1Ref);
    } else if (activeTab === 'explore' && exploreUrl) {
      embedExplore(exploreUrl);
    }
  }, [activeTab, dashboardUrl, dashboard1Url, exploreUrl]);

  const handleTabSwitch = (tab) => {
    console.log('Switching tab to:', tab);
    setActiveTab(tab);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Looker Embedded Content</h1>
      </header>
      <div className="content">
        <nav className="side-nav">
          <button
            onClick={() => handleTabSwitch('dashboard')}
            className={activeTab === 'dashboard' ? 'active' : ''}
          >
            Sales Overview
          </button>
          <button
            onClick={() => handleTabSwitch('dashboard1')}
            className={activeTab === 'dashboard1' ? 'active' : ''}
          >
            Brand Lookup
          </button>
          <button
            onClick={() => handleTabSwitch('explore')}
            className={activeTab === 'explore' ? 'active' : ''}
          >
            Explore
          </button>
        </nav>
        <main>
          <div id="dashboard" style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}></div>
          <div id="dashboard1" style={{ display: activeTab === 'dashboard1' ? 'block' : 'none' }}></div>
          <div id="explore" style={{ display: activeTab === 'explore' ? 'block' : 'none' }}></div>
        </main>
      </div>
    </div>
  );
}

export default App;