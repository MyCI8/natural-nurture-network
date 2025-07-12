
import { createRoot } from 'react-dom/client'
import { AppProviders } from './components/providers/AppProviders'
import App from './App.tsx'
import './index.css'

// Initialize monitoring with safe fallback to avoid cache issues
const initializeMonitoringAsync = async () => {
  try {
    // Use safe monitoring to avoid web-vitals cache issues
    const { initializeMonitoring } = await import('./utils/safeMonitoring');
    initializeMonitoring();
  } catch (error) {
    console.warn('Monitoring initialization failed:', error);
  }
};

// Start monitoring in the background (non-blocking)
setTimeout(initializeMonitoringAsync, 0);

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <App />
  </AppProviders>
);
