import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/container-queries.css';
import './styles/reduced-motion.css';
import './styles/mobile-enhancements.css';
import App from './App';
import { QueryProvider } from './providers/QueryProvider';
import reportWebVitals from './reportWebVitals';
import { measureWebVitals, observeExecutiveDysfunctionMetrics } from './utils/performance';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </React.StrictMode>
);

// Initialize performance monitoring
observeExecutiveDysfunctionMetrics();

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(measureWebVitals);
