'use client';

import Link from 'next/link';

export default function ScoringPage() {
    return (
        <>
            {/* Simple Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <h1 className="text-xl font-semibold text-gray-900">Scoring System</h1>
                        </div>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Back to Main
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">How Points Are Calculated</h1>

                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-600 mb-6">
                            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
                        </p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">🎯 Overview</h2>
                            <p className="text-gray-700 mb-4">
                                FinalPoint uses a sophisticated scoring system that rewards both accuracy and strategic thinking.
                                Points are calculated based on how close your predictions are to the actual race results.
                            </p>
                            <p className="text-gray-700">
                                The system supports two different game modes, each with their own scoring approach.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">📊 Version 1: P10 Only (Legacy Mode)</h2>
                            <p className="text-gray-700 mb-4">
                                In this mode, you predict which driver will finish in <strong>10th position (P10)</strong>.
                                Points are awarded based on how close your prediction is to the actual P10 finisher.
                            </p>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                                <h3 className="text-lg font-semibold text-blue-900 mb-4">Scoring Breakdown</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">Perfect pick (P10)</span>
                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">10 points</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">1 position off</span>
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">7 points</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">2 positions off</span>
                                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">5 points</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">3-5 positions off</span>
                                        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">3 points</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">6-10 positions off</span>
                                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">1 point</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">More than 10 positions off</span>
                                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">0 points</span>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Example Scenarios</h3>
                            <div className="space-y-3 text-sm">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-medium text-gray-900">Scenario 1: Perfect Prediction</p>
                                    <p className="text-gray-700">You pick Max Verstappen for P10, and he finishes P10 → <strong>10 points</strong></p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-medium text-gray-900">Scenario 2: Close Call</p>
                                    <p className="text-gray-700">You pick Lewis Hamilton for P10, but he finishes P9 → <strong>7 points</strong> (1 position off)</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-medium text-gray-900">Scenario 3: Decent Guess</p>
                                    <p className="text-gray-700">You pick Charles Leclerc for P10, but he finishes P12 → <strong>3 points</strong> (2 positions off)</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-medium text-gray-900">Scenario 4: Way Off</p>
                                    <p className="text-gray-700">You pick Zhou Guanyu for P10, but he finishes P20 → <strong>1 point</strong> (10 positions off)</p>
                                </div>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">🏆 Version 2: Multiple Positions (Advanced Mode)</h2>
                            <p className="text-gray-700 mb-4">
                                In this advanced mode, leagues can require predictions for multiple positions (e.g., P1, P5, P10).
                                This creates more strategic depth and variety in the game.
                            </p>

                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                                <h3 className="text-lg font-semibold text-purple-900 mb-4">Scoring Breakdown</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">Perfect pick</span>
                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">10 points</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">Incorrect pick</span>
                                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">0 points</span>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Key Differences</h3>
                            <ul className="list-disc pl-6 mb-4 text-gray-700">
                                <li><strong>Binary scoring:</strong> You either get 10 points for a perfect prediction or 0 points for any incorrect prediction</li>
                                <li><strong>Multiple positions:</strong> Predictions are required for multiple finishing positions (e.g., P1 + P10, P1 + P5 + P10)</li>
                                <li><strong>Total score:</strong> Your final score is the sum of all position scores</li>
                                <li><strong>Strategic depth:</strong> Requires more strategic thinking and knowledge of the sport</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Example Configuration</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="font-medium text-gray-900 mb-2">League Setup: P1 + P10</p>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-700">• You pick Max Verstappen for P1 (he finishes P1) → <strong>10 points</strong></p>
                                    <p className="text-gray-700">• You pick Lewis Hamilton for P10 (he finishes P9) → <strong>0 points</strong></p>
                                    <p className="text-gray-700">• <strong>Total score: 10 points</strong></p>
                                </div>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">⚙️ How It Works</h2>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Position Difference Calculation</h3>
                            <p className="text-gray-700 mb-4">
                                The system calculates how far off your prediction was using this formula:
                            </p>
                            <div className="bg-gray-100 p-4 rounded-lg mb-4">
                                <code className="text-sm font-mono text-gray-900">
                                    positionDifference = Math.abs(actualFinishingPosition - predictedPosition)
                                </code>
                            </div>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Scoring Logic</h3>
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <p className="text-gray-700 mb-2">For Version 1 (P10 only):</p>
                                <ul className="list-disc pl-6 text-sm text-gray-700">
                                    <li>If positionDifference = 0 → 10 points (perfect)</li>
                                    <li>If positionDifference = 1 → 7 points</li>
                                    <li>If positionDifference = 2 → 5 points</li>
                                    <li>If positionDifference ≤ 5 → 3 points</li>
                                    <li>If positionDifference ≤ 10 → 1 point</li>
                                    <li>If positionDifference &gt; 10 → 0 points</li>
                                </ul>
                            </div>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Race Results</h3>
                            <p className="text-gray-700 mb-4">
                                Points are only calculated after official race results are entered into the system.
                                If a driver doesn't finish the race or isn't in the race, they receive 0 points.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">🎮 Strategy Tips</h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-blue-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-3">For P10 Predictions</h3>
                                    <ul className="space-y-2 text-sm text-blue-800">
                                        <li>• Consider midfield teams (Alpine, Aston Martin, McLaren)</li>
                                        <li>• Look at qualifying performance trends</li>
                                        <li>• Consider track characteristics</li>
                                        <li>• Watch for driver form and consistency</li>
                                    </ul>
                                </div>

                                <div className="bg-purple-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-purple-900 mb-3">For Multiple Positions</h3>
                                    <ul className="space-y-2 text-sm text-purple-800">
                                        <li>• P1: Usually Red Bull, Mercedes, or Ferrari</li>
                                        <li>• P5: Often midfield leaders</li>
                                        <li>• P10: Midfield to backmarker teams</li>
                                        <li>• Consider track-specific performance</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">📈 League Standings</h2>
                            <p className="text-gray-700 mb-4">
                                League standings are calculated based on total points earned across all races.
                                In case of ties, the system considers:
                            </p>
                            <ol className="list-decimal pl-6 text-gray-700">
                                <li>Total points earned</li>
                                <li>Number of correct predictions</li>
                                <li>Average points per race</li>
                                <li>Alphabetical order by username</li>
                            </ol>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">❓ Frequently Asked Questions</h2>

                            <div className="space-y-4">
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">What happens if my driver doesn't finish the race?</h3>
                                    <p className="text-gray-700">If your picked driver doesn't finish the race or isn't in the race, you receive 0 points.</p>
                                </div>

                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">Can I change my prediction after submitting it?</h3>
                                    <p className="text-gray-700">No, predictions are final once submitted and cannot be changed.</p>
                                </div>

                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">When are points calculated?</h3>
                                    <p className="text-gray-700">Points are calculated after official race results are entered into the system by league administrators.</p>
                                </div>

                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">How do I know which scoring system my league uses?</h3>
                                    <p className="text-gray-700">Check your league settings or ask your league administrator. Most leagues use the P10-only system unless specifically configured for multiple positions.</p>
                                </div>
                            </div>
                        </section>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">Need Help?</h3>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        If you have questions about the scoring system or need clarification,
                                        please contact your league administrator or reach out to our support team.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
