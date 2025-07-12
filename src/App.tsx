
import React from 'react';
import Routes from "./routes";
import ErrorBoundary from './components/ErrorBoundary';

function App(): React.JSX.Element {
  return (
    <ErrorBoundary level="page" showRetry={true}>
      <Routes />
    </ErrorBoundary>
  );
}

export default App;
