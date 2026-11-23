import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/index.css';

// HashRouter keeps deep links working on any static host. Swap for BrowserRouter once the host rewrites to index.html.
createRoot(document.getElementById('root')).render(<React.StrictMode><HashRouter><App /></HashRouter></React.StrictMode>);
