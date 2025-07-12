
import React from 'react';
import Routes from "./routes";
import ErrorBoundary from './components/ErrorBoundary';
import AppStatus from './components/AppStatus';

function App(): React.JSX.Element {
  return (
    <ErrorBoundary level="page" showRetry={true}>
      <Routes />
      <AppStatus />
    </ErrorBoundary>
  );
}

export default App;
