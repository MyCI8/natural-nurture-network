import React from 'react';

/**
 * Simple status component to verify app is loading correctly
 */
const AppStatus: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white p-2 rounded shadow-lg text-sm z-50">
      ✅ App loaded successfully
    </div>
  );
};

export default AppStatus;