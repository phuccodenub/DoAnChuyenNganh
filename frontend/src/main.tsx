import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n'; // Initialize i18n
import { setupInterceptors } from '@/services/http/interceptors';

// Ensure interceptors are installed before any auth initialization runs.
setupInterceptors();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
