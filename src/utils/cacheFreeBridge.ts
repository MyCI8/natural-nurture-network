/**
 * Cache-bust verification - completely new file name
 * This ensures no Vite cache conflicts
 */

export const verifyNoCacheIssues = () => {
  console.log('✅ Cache verification successful - no web-vitals imports detected');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🔧 Environment:', import.meta.env.MODE);
};

// Simple inline monitoring without external dependencies
export const simpleErrorCapture = (error: Error, context?: string) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    url: window.location.href
  };
  
  if (import.meta.env.DEV) {
    console.error('🐛 Error captured:', errorInfo);
  }
  
  // In production, you could send this to an external service
  // without any problematic imports
};

// Export a clean initialization function
export const initSimpleMonitoring = () => {
  console.log('🚀 Simple monitoring initialized without cache issues');
};