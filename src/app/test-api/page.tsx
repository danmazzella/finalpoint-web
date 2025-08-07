'use client';

import { useState } from 'react';
import { notificationsAPI } from '@/lib/api';

export default function TestAPIPage() {
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const testNotificationPreferences = async () => {
        setLoading(true);
        setResult('Testing...');

        try {
            console.log('🧪 Testing notification preferences...');

            // Test GET preferences
            console.log('📋 Testing GET /notifications/preferences...');
            const getResponse = await notificationsAPI.getPreferences();
            console.log('✅ GET response:', getResponse.data);

            // Test PUT preferences
            console.log('📝 Testing PUT /notifications/preferences...');
            const preferences = {
                emailReminders: true,
                emailScoreUpdates: false,
                pushReminders: true,
                pushScoreUpdates: false
            };

            const putResponse = await notificationsAPI.updatePreferences(preferences);
            console.log('✅ PUT response:', putResponse.data);

            setResult('✅ Both GET and PUT requests successful! Check console for details.');

        } catch (error: any) {
            console.error('❌ Test failed:', error);
            setResult(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">API Test Page</h1>

            <button
                onClick={testNotificationPreferences}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
                {loading ? 'Testing...' : 'Test Notification Preferences'}
            </button>

            <div className="mt-4 p-4 bg-gray-100 rounded">
                <h2 className="font-bold mb-2">Result:</h2>
                <pre className="whitespace-pre-wrap">{result}</pre>
            </div>

            <div className="mt-4 p-4 bg-yellow-100 rounded">
                <h2 className="font-bold mb-2">Instructions:</h2>
                <p>1. Open browser developer console (F12)</p>
                <p>2. Click the test button above</p>
                <p>3. Check the console for detailed logs</p>
                <p>4. Check the result display above</p>
            </div>
        </div>
    );
}
