'use client';

import { useState } from 'react';
import { apiService } from '@/lib/api';

export default function TestApiPage() {
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const testApi = async () => {
        setLoading(true);
        setResult('Testing API...');

        try {
            // Test 1: Check if API is reachable
            const response = await apiService.get('/notifications/preferences');
            setResult(`✅ API working! Status: ${response.status}`);
        } catch (error: any) {
            if (error.response) {
                // Server responded with error status
                setResult(`❌ API Error: ${error.response.status} - ${error.response.statusText}\n\nDetails: ${JSON.stringify(error.response.data, null, 2)}`);
            } else if (error.request) {
                // Request was made but no response
                setResult(`❌ Network Error: No response from server\n\nDetails: ${error.message}`);
            } else {
                // Something else happened
                setResult(`❌ Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const testAuth = () => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        setResult(`🔑 Auth Check:\n\nToken: ${token ? 'Present' : 'Missing'}\nUser: ${user ? 'Present' : 'Missing'}\n\nToken preview: ${token ? token.substring(0, 20) + '...' : 'None'}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">API Test Page</h1>

                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">API Tests</h2>

                    <div className="space-y-4">
                        <button
                            onClick={testApi}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Testing...' : 'Test API Connection'}
                        </button>

                        <button
                            onClick={testAuth}
                            className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            Check Authentication
                        </button>
                    </div>

                    {result && (
                        <div className="mt-4 p-4 bg-gray-100 rounded-md">
                            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                        </div>
                    )}
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Environment Info</h2>
                    <div className="space-y-2">
                        <div>
                            <span className="font-medium">API URL:</span>
                            <span className="ml-2">{process.env.NEXT_PUBLIC_API_URL || 'Not set'}</span>
                        </div>
                        <div>
                            <span className="font-medium">Current URL:</span>
                            <span className="ml-2">{typeof window !== 'undefined' ? window.location.href : 'Server side'}</span>
                        </div>
                        <div>
                            <span className="font-medium">User Agent:</span>
                            <span className="ml-2">{typeof window !== 'undefined' ? window.navigator.userAgent : 'Server side'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
