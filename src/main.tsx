
import { createRoot } from 'react-dom/client'
import { AppProviders } from './components/providers/AppProviders'
import App from './App.tsx'
import './index.css'

// Initialize clean monitoring system - force cache refresh
import { initializeMonitoring } from './utils/cleanMonitoring'

console.log('🚀 App starting with clean monitoring setup');

// Initialize monitoring safely
initializeMonitoring();

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <App />
  </AppProviders>
);
