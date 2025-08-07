'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/Avatar';
import AvatarDebug from '@/components/AvatarDebug';
import { getAvatarUrl } from '@/lib/api';

export default function TestAvatarPage() {
    const { user } = useAuth();
    const [testAvatarPath, setTestAvatarPath] = useState('/uploads/avatars/test-avatar.jpg');

    useEffect(() => {
        console.log('🔧 Test Avatar Page - User data:', user);
        console.log('🔧 Test Avatar Page - User avatar:', user?.avatar);

        if (user?.avatar) {
            const constructedUrl = getAvatarUrl(user.avatar);
            console.log('🔧 Test Avatar Page - Constructed URL:', constructedUrl);

            // Test if the URL is accessible
            if (constructedUrl) {
                fetch(constructedUrl)
                    .then(response => {
                        console.log('🔧 Avatar URL accessible:', response.ok);
                    })
                    .catch(error => {
                        console.error('🔧 Avatar URL not accessible:', error);
                    });
            }
        }
    }, [user]);

    const testUrlConstruction = () => {
        const testPaths = [
            '/uploads/avatars/test.jpg',
            'http://192.168.0.15:6075/uploads/avatars/test.jpg',
            'https://example.com/avatar.jpg',
            null,
            undefined
        ];

        testPaths.forEach(path => {
            const url = getAvatarUrl(path);
            console.log(`🔧 Test URL construction:`, { path, constructedUrl: url });
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Avatar Test Page</h1>

                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">User Avatar (Regular)</h2>
                    <div className="flex items-center space-x-4">
                        <Avatar
                            src={user?.avatar}
                            alt={`${user?.name}'s avatar`}
                            size="lg"
                        />
                        <div>
                            <p><strong>User:</strong> {user?.name}</p>
                            <p><strong>Avatar Path:</strong> {user?.avatar || 'None'}</p>
                            <p><strong>Constructed URL:</strong> {user?.avatar ? getAvatarUrl(user.avatar) : 'None'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">User Avatar (Debug)</h2>
                    <div className="flex items-center space-x-4">
                        <AvatarDebug
                            src={user?.avatar}
                            alt={`${user?.name}'s avatar`}
                            size="lg"
                        />
                        <div>
                            <p><strong>User:</strong> {user?.name}</p>
                            <p><strong>Avatar Path:</strong> {user?.avatar || 'None'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Test Avatar Path</h2>
                    <div className="flex items-center space-x-4">
                        <AvatarDebug
                            src={testAvatarPath}
                            alt="Test avatar"
                            size="lg"
                        />
                        <div>
                            <p><strong>Test Path:</strong> {testAvatarPath}</p>
                            <p><strong>Constructed URL:</strong> {getAvatarUrl(testAvatarPath)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">URL Construction Tests</h2>
                    <button
                        onClick={testUrlConstruction}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Test URL Construction
                    </button>
                    <p className="text-sm text-gray-600 mt-2">Check console for results</p>

                    <div className="mt-4">
                        <h3 className="text-lg font-medium mb-2">Manual URL Test</h3>
                        <div className="space-y-2">
                            <p><strong>Current hostname:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</p>
                            <p><strong>Current protocol:</strong> {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}</p>
                            <p><strong>API Base URL:</strong> {typeof window !== 'undefined' ? (window as any).API_BASE_URL || 'N/A' : 'N/A'}</p>
                            <p><strong>User avatar path:</strong> {user?.avatar || 'None'}</p>
                            <p><strong>Constructed URL:</strong> {user?.avatar ? getAvatarUrl(user.avatar) : 'None'}</p>
                            <p><strong>Is production:</strong> {typeof window !== 'undefined' ? (window.location.hostname === 'finalpoint.app' || window.location.hostname === 'www.finalpoint.app') : 'N/A'}</p>
                        </div>

                        <div className="mt-4">
                            <h4 className="font-medium mb-2">Test Avatar URLs:</h4>
                            <div className="space-y-1 text-sm">
                                <p>Test path: <code>/uploads/avatars/test.jpg</code></p>
                                <p>Constructed: <code>{getAvatarUrl('/uploads/avatars/test.jpg')}</code></p>
                                <p>Expected production: <code>https://api.finalpoint.app/uploads/avatars/test.jpg</code></p>
                                <p>Expected development: <code>http://192.168.0.15:6075/uploads/avatars/test.jpg</code></p>
                            </div>

                            <div className="mt-4">
                                <h4 className="font-medium mb-2">Server Tests:</h4>
                                <button
                                    onClick={() => {
                                        // Test if production API is accessible
                                        fetch('https://api.finalpoint.app/api/drivers/get')
                                            .then(response => {
                                                console.log('🔧 Production API accessible:', response.ok);
                                            })
                                            .catch(error => {
                                                console.error('🔧 Production API not accessible:', error);
                                            });

                                        // Test if static files are served
                                        fetch('https://api.finalpoint.app/uploads/')
                                            .then(response => {
                                                console.log('🔧 Static files accessible:', response.ok);
                                            })
                                            .catch(error => {
                                                console.error('🔧 Static files not accessible:', error);
                                            });
                                    }}
                                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                >
                                    Test Production Server
                                </button>
                                <p className="text-xs text-gray-600 mt-1">Check console for results</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Raw User Data</h2>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                        {JSON.stringify(user, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
