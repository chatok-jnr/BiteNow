import { useState } from 'react';
import { getAllRestaurants } from '../utils/restaurantService';

/**
 * Simple test component to verify API connection
 * Visit this page to test if the backend is connected
 */
const APIConnectionTest = () => {
  const [status, setStatus] = useState('Not tested');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setStatus('Testing...');
    setError(null);
    setResponse(null);

    try {
      const result = await getAllRestaurants({ limit: 1 });
      
      setStatus('✅ Connected Successfully!');
      setResponse(result);
      console.log('API Response:', result);
    } catch (err) {
      setStatus('❌ Connection Failed');
      setError(err.response?.data?.message || err.message);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">
          🔌 API Connection Test
        </h1>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            This page tests the connection between your frontend and the BiteNow backend.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm">
              <strong>API URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}
            </p>
            <p className="text-sm mt-2">
              <strong>Endpoint:</strong> /api/v1/restaurants
            </p>
          </div>
        </div>

        <button
          onClick={testConnection}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition mb-6"
        >
          {loading ? '⏳ Testing Connection...' : '🚀 Test API Connection'}
        </button>

        {/* Status */}
        <div className={`p-4 rounded-lg mb-4 text-center font-bold text-lg ${
          status === '✅ Connected Successfully!' 
            ? 'bg-green-100 text-green-800'
            : status === '❌ Connection Failed'
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {status}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-300 rounded p-4 mb-4">
            <h3 className="font-bold text-red-800 mb-2">Error Details:</h3>
            <p className="text-red-700 text-sm">{error}</p>
            <div className="mt-4 text-sm text-gray-700">
              <p className="font-bold mb-2">Troubleshooting:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Make sure the backend server is running on port 8000</li>
                <li>Check if MongoDB is connected</li>
                <li>Verify CORS settings in backend</li>
                <li>Check backend console for errors</li>
              </ul>
            </div>
          </div>
        )}

        {/* Success Response */}
        {response && (
          <div className="bg-green-50 border border-green-300 rounded p-4">
            <h3 className="font-bold text-green-800 mb-2">✅ API Response:</h3>
            <div className="bg-white p-3 rounded border border-green-200 overflow-auto max-h-64">
              <pre className="text-xs text-gray-800">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
            <div className="mt-4 text-sm text-green-800">
              <p className="font-bold">✨ Backend is connected and working!</p>
              <p className="mt-2">You can now use all API services in your components.</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
          <h3 className="font-bold mb-2">📝 How to Start Backend:</h3>
          <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm">
            cd backend<br />
            npm start
          </code>
          <p className="text-sm text-gray-600 mt-2">
            Make sure MongoDB is running and .env file is configured properly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default APIConnectionTest;
