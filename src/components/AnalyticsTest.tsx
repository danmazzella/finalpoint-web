'use client';

import { useEffect } from 'react';
import { useAnalytics } from '@/lib/analytics';

const AnalyticsTest: React.FC = () => {
    const analytics = useAnalytics();

    useEffect(() => {
        // Test analytics on component mount
        analytics.pageView('analytics_test', 'Analytics Test Page');
    }, [analytics]);

    const handleTestEvent = () => {
        analytics.buttonClick('test_analytics_button', 'analytics_test_page');
        console.log('Test analytics event sent!');
    };

    const handleCustomEvent = () => {
        analytics.logEvent('custom_test_event', {
            test_parameter: 'test_value',
            timestamp: new Date().toISOString()
        });
        console.log('Custom analytics event sent!');
    };

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Analytics Test</h2>

            <div className="space-y-4">
                <button
                    onClick={handleTestEvent}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Test Button Click Event
                </button>

                <button
                    onClick={handleCustomEvent}
                    className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    Test Custom Event
                </button>

                <div className="text-sm text-gray-600 text-center">
                    Check browser console and Firebase Analytics dashboard for events
                </div>
            </div>
        </div>
    );
};

export default AnalyticsTest;
