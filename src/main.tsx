
import { createRoot } from 'react-dom/client'
import { AppProviders } from './components/providers/AppProviders'
import App from './App.tsx'
import './index.css'

// Initialize monitoring asynchronously without blocking
const initializeMonitoringAsync = async () => {
  try {
    const { initializeMonitoring } = await import('./utils/monitoring');
    initializeMonitoring();
    // trackWebVitals temporarily removed due to Vite caching issues
  } catch (error) {
    console.warn('Monitoring utilities not available:', error);
  }
};

// Start monitoring in the background
initializeMonitoringAsync();

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <App />
  </AppProviders>
);
