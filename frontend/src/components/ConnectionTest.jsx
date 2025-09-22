import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [backendData, setBackendData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('Testing...');
      setError(null);
      
      // Test basic connection
      const response = await api.testConnection();
      setBackendData(response);
      setConnectionStatus('✅ Connected');
    } catch (err) {
      setError(err.message);
      setConnectionStatus('❌ Failed');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Backend Connection Test</h2>
      
      <div className="space-y-2">
        <p className="text-sm">
          <span className="font-medium">Status:</span> {connectionStatus}
        </p>
        
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {backendData && (
          <div className="text-green-700 text-sm bg-green-50 p-2 rounded">
            <strong>Backend Response:</strong>
            <pre className="mt-1 text-xs">
              {JSON.stringify(backendData, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <button 
        onClick={testConnection}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
      >
        Test Connection Again
      </button>
      
      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Frontend URL:</strong> {window.location.origin}</p>
        <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_URL || '/api'}</p>
        <p><strong>Backend URL:</strong> {import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}</p>
      </div>
    </div>
  );
};

export default ConnectionTest;