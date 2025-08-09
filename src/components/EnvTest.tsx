'use client';

import { useEffect, useState } from 'react';

const EnvTest: React.FC = () => {
    const [envInfo, setEnvInfo] = useState<{
        nodeEnv: string;
        isDev: boolean;
        isProd: boolean;
    } | null>(null);

    useEffect(() => {
        setEnvInfo({
            nodeEnv: process.env.NODE_ENV || 'undefined',
            isDev: process.env.NODE_ENV === 'development',
            isProd: process.env.NODE_ENV === 'production'
        });
    }, []);

    if (!envInfo) return <div>Loading...</div>;

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Environment Test</h2>

            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="font-medium">NODE_ENV:</span>
                    <span className={`px-2 py-1 rounded text-sm ${envInfo.isDev ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                        {envInfo.nodeEnv}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span className="font-medium">Is Development:</span>
                    <span className={`px-2 py-1 rounded text-sm ${envInfo.isDev ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {envInfo.isDev ? 'Yes' : 'No'}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span className="font-medium">Is Production:</span>
                    <span className={`px-2 py-1 rounded text-sm ${envInfo.isProd ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {envInfo.isProd ? 'Yes' : 'No'}
                    </span>
                </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
                <strong>Expected Behavior:</strong>
                <ul className="mt-1 list-disc list-inside">
                    <li><code>npm run dev</code> → NODE_ENV = "development"</li>
                    <li><code>npm run build</code> → NODE_ENV = "production"</li>
                    <li><code>npm run start</code> → NODE_ENV = "production"</li>
                </ul>
            </div>
        </div>
    );
};

export default EnvTest;
