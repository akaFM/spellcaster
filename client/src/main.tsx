import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// this is the main entry point for the react app
// we just render <App /> into the root div from index.html
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

