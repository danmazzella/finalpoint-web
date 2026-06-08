'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        if (error?.name === 'ChunkLoadError') {
            window.location.reload();
        }
    }, [error]);

    if (error?.name === 'ChunkLoadError') {
        return null;
    }

    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen p-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
                    <button
                        onClick={reset}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
