'use client';

import { useRouter } from 'next/navigation';

export default function ScoringPage() {
    const router = useRouter();

    return (
        <div className="page-bg min-h-screen">
            <main className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8 mb-16 sm:mb-0">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="btn-ghost p-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Scoring System</h1>
                    </div>
                    <button onClick={() => router.back()} className="btn-ghost text-sm py-1.5 px-3">
                        Back
                    </button>
                </div>

                <div className="space-y-5">

                    {/* Overview */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Overview</h2>
                        <p className="text-sm text-gray-600 mb-2">
                            FinalPoint uses a scoring system that rewards both accuracy and strategic thinking.
                            Points are calculated based on how close your predictions are to the actual race results.
                        </p>
                        <p className="text-sm text-gray-600">
                            All leagues support multiple position predictions, allowing you to pick up to 2 different finishing positions.
                        </p>
                    </div>

                    {/* Scoring Breakdown */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Points Breakdown</h2>

                        <div className="mb-5">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Grand Prix Race</h3>
                            <div className="space-y-2">
                                {[
                                    { label: 'Perfect pick', pts: '10 pts', color: 'bg-green-100 text-green-800' },
                                    { label: '1 position off', pts: '7 pts', color: 'bg-blue-100 text-blue-800' },
                                    { label: '2 positions off', pts: '5 pts', color: 'bg-yellow-100 text-yellow-800' },
                                    { label: '3 positions off', pts: '3 pts', color: 'bg-orange-100 text-orange-800' },
                                    { label: '4 positions off', pts: '2 pts', color: 'bg-red-100 text-red-800' },
                                    { label: '5 positions off', pts: '1 pt', color: 'bg-red-100 text-red-800' },
                                    { label: 'More than 5 off', pts: '0 pts', color: 'bg-gray-100 text-gray-600' },
                                ].map(({ label, pts, color }) => (
                                    <div key={label} className="flex items-center justify-between py-1.5">
                                        <span className="text-sm text-gray-700">{label}</span>
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>{pts}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-5">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Sprint Race (reduced points)</h3>
                            <div className="space-y-2">
                                {[
                                    { label: 'Perfect pick', pts: '5 pts', color: 'bg-green-100 text-green-800' },
                                    { label: '1 position off', pts: '3 pts', color: 'bg-blue-100 text-blue-800' },
                                    { label: '2 positions off', pts: '1 pt', color: 'bg-yellow-100 text-yellow-800' },
                                    { label: 'More than 2 off', pts: '0 pts', color: 'bg-gray-100 text-gray-600' },
                                ].map(({ label, pts, color }) => (
                                    <div key={label} className="flex items-center justify-between py-1.5">
                                        <span className="text-sm text-gray-700">{label}</span>
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>{pts}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Examples */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Example Scenarios</h2>
                        <div className="space-y-3">
                            {[
                                { title: 'Perfect Predictions', desc: 'Pick Max Verstappen for P1 (finishes P1) + Lewis Hamilton for P10 (finishes P10)', result: '20 pts (10 + 10)', resultColor: 'text-green-600' },
                                { title: 'Mixed Results', desc: 'Pick Charles Leclerc for P1 (finishes P2) + Lando Norris for P10 (finishes P8)', result: '9 pts (7 + 2)', resultColor: 'text-blue-600' },
                                { title: 'Close Calls', desc: 'Pick Oscar Piastri for P1 (finishes P2) + Fernando Alonso for P10 (finishes P11)', result: '14 pts (7 + 7)', resultColor: 'text-blue-600' },
                                { title: 'One Great, One Off', desc: 'Pick George Russell for P1 (finishes P1) + Zhou Guanyu for P10 (finishes P15)', result: '10 pts (10 + 0)', resultColor: 'text-gray-600' },
                            ].map(({ title, desc, result, resultColor }) => (
                                <div key={title} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 mb-0.5">{title}</p>
                                            <p className="text-xs text-gray-600">{desc}</p>
                                        </div>
                                        <span className={`text-sm font-bold flex-shrink-0 ${resultColor}`}>{result}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* How it works */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-sm text-gray-600 mb-3">Points are based on position difference:</p>
                        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 font-mono text-xs text-gray-700">
                            positionDifference = |actualFinishingPosition − predictedPosition|
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Your total score per race is the sum of points for each position you predicted.</p>
                        <p className="text-sm text-gray-600">Points are only calculated after official results are entered by league administrators.</p>
                    </div>

                    {/* Strategy */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Strategy Tips</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                                <h3 className="text-sm font-semibold text-blue-900 mb-2">For P1 Predictions</h3>
                                <ul className="space-y-1 text-xs text-blue-800">
                                    <li>• Focus on top teams</li>
                                    <li>• Consider qualifying performance</li>
                                    <li>• Watch driver form and consistency</li>
                                    <li>• Track characteristics matter</li>
                                </ul>
                            </div>
                            <div className="rounded-xl bg-purple-50 border border-purple-100 p-4">
                                <h3 className="text-sm font-semibold text-purple-900 mb-2">For Lower Positions</h3>
                                <ul className="space-y-1 text-xs text-purple-800">
                                    <li>• P5–P10: Often midfield teams</li>
                                    <li>• P10–P15: Midfield to backmarkers</li>
                                    <li>• Consider qualifying trends</li>
                                    <li>• Watch for driver consistency</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Standings */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-3">League Standings</h2>
                        <p className="text-sm text-gray-600 mb-3">Standings are based on total points across all races. Tiebreakers (in order):</p>
                        <ol className="space-y-1 text-sm text-gray-700 list-decimal list-inside">
                            <li>Total points earned</li>
                            <li>Number of perfect predictions (10-point scores)</li>
                            <li>Number of close predictions (7-point scores)</li>
                            <li>Average points per race</li>
                        </ol>
                    </div>

                    {/* FAQ */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                        <div className="space-y-3">
                            {[
                                { q: 'How many positions can I predict?', a: 'All leagues support up to 2 position predictions per race.' },
                                { q: "What if my driver doesn't finish?", a: "If your picked driver doesn't finish or isn't in the race, you receive 0 points for that position." },
                                { q: 'Can I change my prediction?', a: 'Yes — up until 5 minutes before qualifying begins. After that, predictions are locked.' },
                                { q: 'When are points calculated?', a: 'After official race results are entered by league administrators.' },
                                { q: 'Maximum points per race?', a: 'With 2 perfect predictions: 20 points per Grand Prix, 10 points per Sprint.' },
                                { q: 'Do I get points for both positions even if one is wrong?', a: 'Yes — points are awarded independently for each position.' },
                            ].map(({ q, a }) => (
                                <div key={q} className="border border-gray-200 rounded-xl p-4">
                                    <p className="text-sm font-semibold text-gray-900 mb-1">{q}</p>
                                    <p className="text-sm text-gray-600">{a}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Help */}
                    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
                        <div className="flex gap-3">
                            <svg className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="text-sm font-semibold text-amber-800 mb-0.5">Need Help?</p>
                                <p className="text-sm text-amber-700">Contact us at finalpointapp@gmail.com with any questions.</p>
                            </div>
                        </div>
                    </div>

                    {/* App download */}
                    <div className="glass-card p-6 text-center">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">Download FinalPoint Mobile</h3>
                        <p className="text-sm text-gray-500 mb-4">Get the best experience with our mobile app</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <a
                                href="https://apps.apple.com/us/app/finalpoint/id6749827283"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary text-sm py-2 px-5 inline-flex items-center justify-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                App Store
                            </a>
                            <a
                                href="https://play.google.com/store/apps/details?id=com.finalpoint.mobile&hl=en_US"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary text-sm py-2 px-5 inline-flex items-center justify-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 -960 960 960">
                                    <path d="M40-240q9-107 65.5-197T256-580l-74-128q-6-9-3-19t13-15q8-5 18-2t16 12l74 128q86-36 180-36t180 36l74-128q6-9 16-12t18 2q10 5 13 15t-3 19l-74 128q94 53 150.5 143T920-240H40Zm240-110q21 0 35.5-14.5T330-400q0-21-14.5-35.5T280-450q-21 0-35.5 14.5T230-400q0 21 14.5 35.5T280-350Zm400 0q21 0 35.5-14.5T730-400q0-21-14.5-35.5T680-450q-21 0-35.5 14.5T630-400q0 21 14.5 35.5T680-350Z" />
                                </svg>
                                Google Play
                            </a>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
