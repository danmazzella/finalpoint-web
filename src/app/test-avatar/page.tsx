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
        }
    }, [user]);

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
