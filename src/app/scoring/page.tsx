'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ScoringPage() {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    return (
        <>
            {/* Simple Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button onClick={handleBack} className="text-blue-600 hover:text-blue-800">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <h1 className="text-xl font-semibold text-gray-900">Scoring System</h1>
                        </div>
                        <button
                            onClick={handleBack}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Back to Main
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl mb-16 sm:mb-0">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">How Points Are Calculated</h1>

                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-600 mb-6">
                            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
                        </p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">🎯 Overview</h2>
                            <p className="text-gray-700 mb-4">
                                FinalPoint uses a scoring system that rewards both accuracy and strategic thinking.
                                Points are calculated based on how close your predictions are to the actual race results.
                            </p>
                            <p className="text-gray-700">
                                All leagues now support multiple position predictions, allowing you to pick up to 2 different finishing positions.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">🏆 Multiple Position Scoring System</h2>
                            <p className="text-gray-700 mb-4">
                                In this system, you can predict drivers for different finishing positions (e.g., P1 and P10).
                                Points are awarded based on how close your prediction is to the actual finishing position.
                                You get points for each position you predict, so your total score is the sum of all position scores.
                            </p>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                                <h3 className="text-lg font-semibold text-blue-900 mb-4">Scoring Breakdown</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">Perfect pick</span>
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
                                        <span className="font-medium text-gray-900">3 positions off</span>
                                        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">3 points</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">4 positions off</span>
                                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">2 points</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">5 positions off</span>
                                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">1 point</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">More than 5 positions off</span>
                                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">0 points</span>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Example Scenarios</h3>
                            <div className="space-y-3 text-sm">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-medium text-gray-900">Scenario 1: Perfect Predictions</p>
                                    <p className="text-gray-700">You pick Max Verstappen for P1 (he finishes P1) and Lewis Hamilton for P10 (he finishes P10) → <strong>20 points total</strong> (10 + 10)</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-medium text-gray-900">Scenario 2: Mixed Results</p>
                                    <p className="text-gray-700">You pick Charles Leclerc for P1 (he finishes P2) and Lando Norris for P10 (he finishes P8) → <strong>9 points total</strong> (7 + 2)</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-medium text-gray-900">Scenario 3: Close Calls</p>
                                    <p className="text-gray-700">You pick Oscar Piastri for P1 (he finishes P2) and Fernando Alonso for P10 (he finishes P11) → <strong>14 points total</strong> (7 + 7)</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-medium text-gray-900">Scenario 4: One Great, One Off</p>
                                    <p className="text-gray-700">You pick George Russell for P1 (he finishes P1) and Zhou Guanyu for P10 (he finishes P15) → <strong>10 points total</strong> (10 + 0)</p>
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
                                <p className="text-gray-700 mb-2">For each position you predict:</p>
                                <ul className="list-disc pl-6 text-sm text-gray-700">
                                    <li>If positionDifference = 0 → 10 points (perfect)</li>
                                    <li>If positionDifference = 1 → 7 points</li>
                                    <li>If positionDifference = 2 → 5 points</li>
                                    <li>If positionDifference = 3 → 3 points</li>
                                    <li>If positionDifference = 4 → 2 points</li>
                                    <li>If positionDifference = 5 → 1 point</li>
                                    <li>If positionDifference &gt; 5 → 0 points</li>
                                </ul>
                            </div>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Total Score Calculation</h3>
                            <p className="text-gray-700 mb-4">
                                Your total score for a race is the sum of points earned for each position you predicted.
                                If you predict 2 positions, you can earn up to 20 points per race.
                            </p>

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
                                    <h3 className="text-lg font-semibold text-blue-900 mb-3">For P1 Predictions</h3>
                                    <ul className="space-y-2 text-sm text-blue-800">
                                        <li>• Focus on top teams</li>
                                        <li>• Consider qualifying performance trends</li>
                                        <li>• Watch for driver form and consistency</li>
                                        <li>• Track characteristics matter significantly</li>
                                    </ul>
                                </div>

                                <div className="bg-purple-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-purple-900 mb-3">For Lower Position Predictions</h3>
                                    <ul className="space-y-2 text-sm text-purple-800">
                                        <li>• P5-P10: Often midfield teams</li>
                                        <li>• P10-P15: Midfield to backmarker teams</li>
                                        <li>• Consider qualifying performance trends</li>
                                        <li>• Watch for driver form and consistency</li>
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
                                <li>Number of perfect predictions (10-point scores)</li>
                                <li>Number of close predictions (7-point scores)</li>
                                <li>Average points per race</li>
                            </ol>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">❓ Frequently Asked Questions</h2>

                            <div className="space-y-4">
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">How many positions can I predict?</h3>
                                    <p className="text-gray-700">All leagues now support up to 2 position predictions per race.</p>
                                </div>

                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">What happens if my driver doesn't finish the race?</h3>
                                    <p className="text-gray-700">If your picked driver doesn't finish the race or isn't in the race, you receive 0 points for that position.</p>
                                </div>

                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">Can I change my prediction after submitting it?</h3>
                                    <p className="text-gray-700">Yes! You can change your predictions up until 1 hour before qualifying begins. After that, predictions are locked and cannot be modified.</p>
                                </div>

                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">When are points calculated?</h3>
                                    <p className="text-gray-700">Points are calculated after official race results are entered into the system by league administrators.</p>
                                </div>

                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">What's the maximum points I can earn per race?</h3>
                                    <p className="text-gray-700">If you predict 2 positions and get both perfect, you can earn up to 20 points per race (10 + 10).</p>
                                </div>

                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">Do I get points for both positions even if one is wrong?</h3>
                                    <p className="text-gray-700">Yes! You get points for each position independently. A perfect P1 prediction (10 points) plus a P1 prediction that's 2 positions off (5 points) = 15 total points.</p>
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
                                        please contact us at finalpointapp@gmail.com.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile App Download */}
                <div className="mt-8 mb-8 sm:mb-12">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Download FinalPoint Mobile</h3>
                            <p className="text-gray-600 mb-4">Get the best experience with our mobile app</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="https://apps.apple.com/us/app/finalpoint/id6749827283"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
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
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors inline-flex items-center justify-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 -960 960 960">
                                        <path d="M40-240q9-107 65.5-197T256-580l-74-128q-6-9-3-19t13-15q8-5 18-2t16 12l74 128q86-36 180-36t180 36l74-128q6-9 16-12t18 2q10 5 13 15t-3 19l-74 128q94 53 150.5 143T920-240H40Zm240-110q21 0 35.5-14.5T330-400q0-21-14.5-35.5T280-450q-21 0-35.5 14.5T230-400q0 21 14.5 35.5T280-350Zm400 0q21 0 35.5-14.5T730-400q0-21-14.5-35.5T680-450q-21 0-35.5 14.5T630-400q0 21 14.5 35.5T680-350Z" />
                                    </svg>
                                    Google Play
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
