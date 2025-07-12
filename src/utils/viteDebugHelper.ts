/**
 * Vite Cache Debug Helper
 * This file helps diagnose and resolve Vite cache issues
 */

export const cacheDebugInfo = {
  timestamp: new Date().toISOString(),
  nodeEnv: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  viteCacheVersion: '74bf0bfb', // This should change after cache clear
};

export const logCacheStatus = () => {
  console.group('🔍 Vite Cache Debug Info');
  console.log('📅 Build timestamp:', cacheDebugInfo.timestamp);
  console.log('🔧 Environment:', cacheDebugInfo.nodeEnv);
  console.log('🏗️ Is development:', cacheDebugInfo.isDev);
  console.log('🚀 Is production:', cacheDebugInfo.isProd);
  console.log('💾 Cache version detected:', cacheDebugInfo.viteCacheVersion);
  console.groupEnd();
  
  return cacheDebugInfo;
};

export const cacheResolutionSteps = [
  '1. Stop the development server (Ctrl+C)',
  '2. Run: rm -rf node_modules/.vite',
  '3. Run: npm run dev -- --force',
  '4. The app should load without web-vitals errors'
];

export const printCacheResolutionSteps = () => {
  console.group('🛠️ Manual Cache Resolution Steps');
  cacheResolutionSteps.forEach(step => console.log(step));
  console.groupEnd();
};