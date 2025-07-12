
import { createRoot } from 'react-dom/client'
import { AppProviders } from './components/providers/AppProviders'
import App from './App.tsx'
import './index.css'

// Removed all monitoring imports to avoid Vite cache issues
// Testing cache resolution with simple console log
console.log('🚀 App starting without monitoring imports - cache issue should be resolved');

// Test the cache-free bridge and debug info
setTimeout(async () => {
  try {
    const { verifyNoCacheIssues } = await import('./utils/cacheFreeBridge');
    const { logCacheStatus, printCacheResolutionSteps } = await import('./utils/viteDebugHelper');
    
    verifyNoCacheIssues();
    logCacheStatus();
    
    // Show manual resolution steps if needed
    console.log('ℹ️ If you still see web-vitals errors, run these steps:');
    printCacheResolutionSteps();
  } catch (error) {
    console.warn('Cache verification failed, but app continues:', error);
    console.log('🛠️ Manual fix: rm -rf node_modules/.vite && npm run dev -- --force');
  }
}, 1000);

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <App />
  </AppProviders>
);
