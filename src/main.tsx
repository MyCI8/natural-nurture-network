
import { createRoot } from 'react-dom/client'
import { AppProviders } from './components/providers/AppProviders'
import App from './App.tsx'
import './index.css'

// Initialize app monitoring system - complete cache reset
import { initializeMonitoring } from './utils/appMonitoring'
import { log } from './utils/logger'

log.info('🚀 App starting with clean monitoring setup');

// Initialize monitoring safely
initializeMonitoring();

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <App />
  </AppProviders>
);
