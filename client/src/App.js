import React, { useState, useRef, useEffect } from 'react';
import { LookerEmbedSDK } from '@looker/embed-sdk';
import { FaHeart } from 'react-icons/fa';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeDashboardId, setActiveDashboardId] = useState(null);
  const dashboardRef = useRef(null);
  const exploreRef = useRef(null);

  useEffect(() => {
    LookerEmbedSDK.init('https://sadasystems.looker.com');
  }, []);

  const handleDashboardClick = (dashboardId) => {
    setActiveTab('dashboard');
    setActiveDashboardId(dashboardId);
    embedDashboard(dashboardId);
  };

  const embedDashboard = async (dashboardId) => {
    if (dashboardRef.current) {
      dashboardRef.current.loadDashboard(dashboardId);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/auth/dashboard/${dashboardId}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const { url } = await response.json();

      LookerEmbedSDK.createDashboardWithId(dashboardId)
        .appendTo('#dashboard')
        .withClassName('looker-embed')
        .withUrl(url)
        .build()
        .connect()
        .then((embed) => {
          console.log('Dashboard loaded successfully');
          dashboardRef.current = embed;
        })
        .catch((error) => console.error('Error loading dashboard:', error));
    } catch (error) {
      console.error('Error fetching dashboard URL:', error);
    }
  };

  const embedExplore = async () => {
    if (exploreRef.current) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/auth/explore', { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const { url } = await response.json();

      LookerEmbedSDK.createExploreWithUrl(url)
        .appendTo('#explore')
        .withClassName('looker-embed')
        .build()
        .connect()
        .then((embed) => {
          console.log('Explore loaded successfully');
          exploreRef.current = embed;
        })
        .catch((error) => console.error('Error loading explore:', error));
    } catch (error) {
      console.error('Error fetching explore URL:', error);
    }
  };

  const renderDashboardLinks = (title, dashboards, isFavorite = false) => (
    <div className="dashboard-section">
      <h2>
        {isFavorite && <FaHeart className="favorite-icon" />}
        {title}
      </h2>
      <div className="dashboard-grid">
        {dashboards.map(dashboard => (
          <div key={dashboard.id} className="dashboard-item">
            <button onClick={() => handleDashboardClick(dashboard.id)} className="image-button">
              <img src='thumbnail.jpg' alt={dashboard.title} />
            </button>
            <button onClick={() => handleDashboardClick(dashboard.id)}>{dashboard.title}</button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>Looker Embedded Content</h1>
      </header>
      <main>
        <div className="tabs">
          <button
            onClick={() => setActiveTab('home')}
            className={activeTab === 'home' ? 'active' : ''}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={activeTab === 'dashboard' ? 'active' : ''}
          >
            Dashboard
          </button>
          <button
            onClick={() => { setActiveTab('explore'); embedExplore(); }}
            className={activeTab === 'explore' ? 'active' : ''}
          >
            Explore
          </button>
        </div>
        <div className="tab-content">
          <div id="home" style={{ display: activeTab === 'home' ? 'block' : 'none' }}>
            <h1 className="welcome-message">Welcome, Prabha Arivalagan</h1>
            <div className="sections-container">
              {renderDashboardLinks('Favorites', [
                { id: 'favorite1', title: 'Favorite 1' },
                { id: 'favorite2', title: 'Favorite 2' },
                { id: 'favorite3', title: 'Favorite 3' },
              ], true)}
              {renderDashboardLinks('Sales', [
                { id: 116, title: 'Dashboard 116' },
                { id: 117, title: 'Dashboard 117' },
                { id: 118, title: 'Dashboard 118' },
                { id: 119, title: 'Dashboard 119' }
              ])}
              {renderDashboardLinks('Marketing', [
                { id: 300, title: 'Dashboard 300' },
                { id: 301, title: 'Dashboard 301' },
                { id: 302, title: 'Dashboard 302' },
                { id: 303, title: 'Dashboard 303' },
                { id: 304, title: 'Dashboard 304' },
                { id: 305, title: 'Dashboard 305' },
                { id: 306, title: 'Dashboard 306' },
                { id: 307, title: 'Dashboard 307' }
              ])}
              {renderDashboardLinks('Operations', [
                { id: 200, title: 'Dashboard 200' },
                { id: 203, title: 'Dashboard 203' }
              ])}
            </div>
          </div>
          <div id="dashboard" style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}></div>
          <div id="explore" style={{ display: activeTab === 'explore' ? 'block' : 'none' }}></div>
        </div>
      </main>
    </div>
  );
}

export default App;