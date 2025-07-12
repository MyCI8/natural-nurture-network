
import { createRoot } from 'react-dom/client'
import { AppProviders } from './components/providers/AppProviders'
import App from './App.tsx'
import './index.css'

// Initialize clean monitoring without external dependencies - cache bust
import { initializeMonitoring } from './utils/monitoring'

console.log('🚀 App starting with clean monitoring setup');

// Initialize monitoring safely
initializeMonitoring();

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <App />
  </AppProviders>
);
