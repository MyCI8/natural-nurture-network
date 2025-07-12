
import { createRoot } from 'react-dom/client'
import { AppProviders } from './components/providers/AppProviders'
import App from './App.tsx'
import './index.css'

// Temporary import verification for debugging
if (import.meta.env.DEV) {
  import('./utils/importVerification');
}

// Initialize monitoring with safe fallback to avoid cache issues
const initializeMonitoringAsync = async () => {
  try {
    // Use the renamed monitoring file directly
    const { initializeMonitoring } = await import('./utils/monitoring');
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
