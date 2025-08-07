'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header Bar */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <h1 className="text-xl font-semibold text-gray-900">Privacy Policy</h1>
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
                    
                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-600 mb-6">
                            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
                        </p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                            <p className="text-gray-700 mb-4">
                                Welcome to FinalPoint ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our F1 prediction game platform.
                            </p>
                            <p className="text-gray-700">
                                By using FinalPoint, you agree to the collection and use of information in accordance with this policy.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
                            
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Personal Information</h3>
                            <p className="text-gray-700 mb-4">We may collect the following personal information:</p>
                            <ul className="list-disc pl-6 mb-4 text-gray-700">
                                <li>Name and email address</li>
                                <li>Username and profile information</li>
                                <li>Game preferences and settings</li>
                                <li>League participation and predictions</li>
                                <li>Communication preferences</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Usage Information</h3>
                            <p className="text-gray-700 mb-4">We automatically collect certain information about your use of our platform:</p>
                            <ul className="list-disc pl-6 mb-4 text-gray-700">
                                <li>Device information and IP address</li>
                                <li>Browser type and version</li>
                                <li>Pages visited and time spent</li>
                                <li>Game activity and performance data</li>
                                <li>Error logs and crash reports</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
                            <p className="text-gray-700 mb-4">We use the collected information for the following purposes:</p>
                            <ul className="list-disc pl-6 mb-4 text-gray-700">
                                <li>To provide and maintain our F1 prediction game service</li>
                                <li>To process your predictions and calculate scores</li>
                                <li>To manage leagues and competitions</li>
                                <li>To send notifications about race results and updates</li>
                                <li>To improve our platform and user experience</li>
                                <li>To prevent fraud and ensure fair play</li>
                                <li>To comply with legal obligations</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
                            <p className="text-gray-700 mb-4">We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
                            <ul className="list-disc pl-6 mb-4 text-gray-700">
                                <li><strong>With your consent:</strong> When you explicitly agree to share information</li>
                                <li><strong>League members:</strong> Your username and predictions may be visible to other league members</li>
                                <li><strong>Service providers:</strong> With trusted third-party services that help us operate our platform</li>
                                <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
                                <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
                            <p className="text-gray-700 mb-4">
                                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                            </p>
                            <ul className="list-disc pl-6 mb-4 text-gray-700">
                                <li>Encryption of data in transit and at rest</li>
                                <li>Regular security assessments and updates</li>
                                <li>Access controls and authentication measures</li>
                                <li>Secure hosting and infrastructure</li>
                            </ul>
                            <p className="text-gray-700">
                                However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights and Choices</h2>
                            <p className="text-gray-700 mb-4">You have the following rights regarding your personal information:</p>
                            <ul className="list-disc pl-6 mb-4 text-gray-700">
                                <li><strong>Access:</strong> Request a copy of your personal information</li>
                                <li><strong>Correction:</strong> Update or correct your information</li>
                                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                            </ul>
                            <p className="text-gray-700">
                                To exercise these rights, please contact us using the information provided below.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
                            <p className="text-gray-700 mb-4">
                                We use cookies and similar tracking technologies to enhance your experience on our platform. These technologies help us:
                            </p>
                            <ul className="list-disc pl-6 mb-4 text-gray-700">
                                <li>Remember your preferences and settings</li>
                                <li>Analyze usage patterns and improve our service</li>
                                <li>Provide personalized content and features</li>
                                <li>Ensure security and prevent fraud</li>
                            </ul>
                            <p className="text-gray-700">
                                You can control cookie settings through your browser preferences, though this may affect some functionality.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
                            <p className="text-gray-700 mb-4">
                                FinalPoint is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
                            <p className="text-gray-700 mb-4">
                                Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
                            <p className="text-gray-700 mb-4">
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
                            <p className="text-gray-700 mb-4">
                                If you have any questions about this Privacy Policy or our data practices, please contact us:
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700">
                                    <strong>Email:</strong> privacy@finalpoint.com<br />
                                    <strong>Address:</strong> [Your Company Address]<br />
                                    <strong>Phone:</strong> [Your Contact Number]
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
