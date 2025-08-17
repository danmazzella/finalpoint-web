'use client';

import Link from 'next/link';
import { CONTACT_EMAIL } from '@/lib/environment';

export default function TermsAndConditionsPage() {
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
                            <h1 className="text-xl font-semibold text-gray-900">Terms and Conditions</h1>
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>

                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-600 mb-6">
                            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
                        </p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                            <p className="text-gray-700 mb-4">
                                By accessing and using FinalPoint ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                            </p>
                            <p className="text-gray-700">
                                These Terms and Conditions ("Terms") govern your use of the FinalPoint F1 prediction game platform operated by FinalPoint ("we," "us," or "our").
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                            <p className="text-gray-700 mb-4">
                                FinalPoint is a fantasy sports platform that allows users to:
                            </p>
                            <ul className="list-disc pl-6 mb-4 text-gray-700">
                                <li>Make predictions on Formula 1 race outcomes</li>
                                <li>Participate in private and public leagues</li>
                                <li>Compete with other users for points and rankings</li>
                                <li>Track race results and standings</li>
                                <li>Receive notifications about race updates and results</li>
                            </ul>
                            <p className="text-gray-700">
                                The Service is provided for entertainment purposes only and does not involve real money gambling or betting.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Account Creation</h3>
                            <p className="text-gray-700 mb-4">
                                To use certain features of the Service, you must create an account. You agree to:
                            </p>
                            <ul className="list-disc pl-6 mb-4 text-gray-700">
                                <li>Provide accurate, current, and complete information</li>
                                <li>Maintain and update your account information</li>
                                <li>Keep your password secure and confidential</li>
                                <li>Accept responsibility for all activities under your account</li>
                                <li>Notify us immediately of any unauthorized use</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Account Eligibility</h3>
                            <p className="text-gray-700 mb-4">
                                You must be at least 13 years old to create an account. If you are under 18, you must have parental or guardian consent to use the Service.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Conduct and Responsibilities</h2>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Acceptable Use</h3>
                            <p className="text-gray-700 mb-4">You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
                            <ul className="list-disc pl-6 mb-4 text-gray-700">
                                <li>Violate any applicable laws or regulations</li>
                                <li>Infringe on the rights of others</li>
                                <li>Use the Service for commercial purposes without authorization</li>
                                <li>Attempt to gain unauthorized access to the Service</li>
                                <li>Interfere with or disrupt the Service</li>
                                <li>Use automated systems to access the Service</li>
                                <li>Create multiple accounts to gain unfair advantages</li>
                                <li>Share account credentials with others</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Content Standards</h3>
                            <p className="text-gray-700 mb-4">When using the Service, you agree not to post, transmit, or share content that:</p>
                            <ul className="list-disc pl-6 mb-4 text-gray-700">
                                <li>Is offensive, abusive, or harassing</li>
                                <li>Contains false or misleading information</li>
                                <li>Violates intellectual property rights</li>
                                <li>Contains malware or harmful code</li>
                                <li>Promotes illegal activities</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Game Rules and Fair Play</h2>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Prediction Rules</h3>
                            <p className="text-gray-700 mb-4">
                                All predictions must be submitted before the official start time of each race. Late submissions will not be accepted. Predictions are final once submitted and cannot be changed.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Scoring System</h3>
                            <p className="text-gray-700 mb-4">
                                Points are awarded based on the accuracy of your predictions. The scoring system is determined by us and may be updated from time to time. Final scores are calculated based on official race results.
                            </p>
                            <p className="text-gray-700 mb-4">
                                For detailed information about how points are calculated, including scoring breakdowns and examples, please visit our{' '}
                                <Link href="/scoring" className="text-blue-600 hover:text-blue-800 underline">
                                    Scoring System page
                                </Link>.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Fair Play</h3>
                            <p className="text-gray-700 mb-4">
                                We reserve the right to investigate and take action against users who engage in cheating, collusion, or other unfair practices. This may include account suspension or termination.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property Rights</h2>
                            <p className="text-gray-700 mb-4">
                                The Service and its original content, features, and functionality are owned by FinalPoint and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                            </p>
                            <p className="text-gray-700 mb-4">
                                You retain ownership of content you submit to the Service, but you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content in connection with the Service.
                            </p>
                            <p className="text-gray-700">
                                Formula 1 trademarks, logos, and race data are the property of their respective owners and are used under license or fair use principles.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
                            <p className="text-gray-700 mb-4">
                                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices regarding the collection and use of your personal information.
                            </p>
                            <p className="text-gray-700">
                                By using the Service, you consent to the collection and use of information as detailed in our Privacy Policy.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimers and Limitations</h2>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">8.1 Service Availability</h3>
                            <p className="text-gray-700 mb-4">
                                We strive to provide a reliable service, but we do not guarantee that the Service will be available at all times or free from errors. We may suspend or discontinue the Service at any time.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">8.2 No Warranty</h3>
                            <p className="text-gray-700 mb-4">
                                The Service is provided "as is" without any warranties, express or implied. We disclaim all warranties, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">8.3 Limitation of Liability</h3>
                            <p className="text-gray-700 mb-4">
                                In no event shall FinalPoint be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising out of or relating to your use of the Service.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Indemnification</h2>
                            <p className="text-gray-700 mb-4">
                                You agree to indemnify and hold harmless FinalPoint and its officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of the Service or violation of these Terms.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
                            <p className="text-gray-700 mb-4">
                                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                            </p>
                            <p className="text-gray-700 mb-4">
                                Upon termination, your right to use the Service will cease immediately. If you wish to terminate your account, you may simply discontinue using the Service or contact us to delete your account.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
                            <p className="text-gray-700 mb-4">
                                These Terms shall be interpreted and governed by the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Service shall be resolved in the courts of [Your Jurisdiction].
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
                            <p className="text-gray-700 mb-4">
                                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                            </p>
                            <p className="text-gray-700">
                                By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
                            <p className="text-gray-700 mb-4">
                                If you have any questions about these Terms and Conditions, please contact us:
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700">
                                    <strong>Email:</strong> {CONTACT_EMAIL}<br />
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
