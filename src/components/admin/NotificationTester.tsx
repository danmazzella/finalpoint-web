'use client';

import React, { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { notificationTemplates, getTemplateById, NotificationTemplate } from './notificationTemplates';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Race {
    id: number;
    name: string;
    date: string;
    weekNumber: number;
    circuit: string;
    country: string;
}

interface League {
    id: number;
    name: string;
    joinCode: string;
    memberCount: number;
    ownerName: string;
}

interface NotificationHistoryItem {
    id: number;
    type: string;
    notificationType: string;
    title: string;
    body: string;
    status: string;
    sentAt: string;
    errorMessage?: string;
}

interface NotificationResult {
    success: boolean;
    message: string;
    results?: {
        email?: { success: boolean; messageId?: string; error?: string };
        push?: { success: boolean; tokensSent?: number; error?: string };
    };
}

// Helper function to extract variables from template content
const extractTemplateVariables = (template: NotificationTemplate): Record<string, string> => {
    const variables: Record<string, string> = {};

    // Only extract variables from text content, not HTML/CSS
    // HTML content contains CSS properties that might have curly braces
    const textContent = `${template.title} ${template.body} ${template.emailSubject}`;

    // Find all variables in the format {variableName}
    const variableMatches = textContent.match(/\{([^}]+)\}/g);
    if (variableMatches) {
        variableMatches.forEach(match => {
            const variableName = match.slice(1, -1); // Remove { and }
            if (!variables[variableName]) {
                variables[variableName] = variableName.toUpperCase();
            }
        });
    }

    return variables;
};

// Helper function to get variable descriptions
const getVariableDescription = (variableName: string): string => {
    const descriptions: Record<string, string> = {
        userName: "User's name (auto-filled)",
        raceName: "Race name (enter race name, date/week auto-filled)",
        timing: "Time until race (auto-calculated: days or hours)",
        raceDate: "Race date (auto-filled from database)",
        weekNumber: "Week number (auto-filled from database)",
        leagueName: "League name (enter league name, join code auto-filled)",
        joinCode: "League join code (auto-filled from database)",
        customTitle: "Custom notification title",
        customSubject: "Custom email subject",
        customBody: "Custom message body"
    };

    return descriptions[variableName] || `${variableName} variable`;
};

// Helper function to determine if a variable is user-input or auto-filled
const isUserInputVariable = (variableName: string): boolean => {
    // These variables are auto-filled from database or calculated
    const autoFilledVariables = ['userName', 'raceDate', 'weekNumber', 'joinCode', 'timing'];
    return !autoFilledVariables.includes(variableName);
};

// Helper function to get template-specific auto-fill features
const getTemplateAutoFillFeatures = (templateId: string): string[] => {
    const features: Record<string, string[]> = {
        'pick_reminder_dynamic': [
            'Dynamic Pick Reminder: Automatically calculates days/hours until race',
            'Race templates: Enter race name, date & week number are auto-filled from database',
            'User name: Always auto-filled for personalization'
        ],
        'pick_reminder_5_days': [
            'Race templates: Enter race name, date & week number are auto-filled from database',
            'User name: Always auto-filled for personalization'
        ],
        'pick_reminder_3_days': [
            'Race templates: Enter race name, date & week number are auto-filled from database',
            'User name: Always auto-filled for personalization'
        ],
        'pick_reminder_1_day': [
            'Race templates: Enter race name, date & week number are auto-filled from database',
            'User name: Always auto-filled for personalization'
        ],
        'league_invitation': [
            'League templates: Enter league name, join code is auto-filled from database',
            'User name: Always auto-filled for personalization'
        ],
        'welcome_message': [
            'User name: Always auto-filled for personalization'
        ],
        'custom_message': [
            'Custom templates: All fields are user-editable',
            'User name: Always auto-filled for personalization'
        ]
    };

    return features[templateId] || [
        'User name: Always auto-filled for personalization'
    ];
};

// Helper function to get template-specific quick fill examples
// const getTemplateQuickFillExamples = (templateId: string, races: Race[], leagues: League[]): React.ReactNode[] => {
//     const examples: React.ReactNode[] = [];
//     
//     if (templateId.includes('pick_reminder') && races && races.length > 0) {
//         examples.push(
//             <button
//                 key="race-reminder"
//                 onClick={() => setTemplateFields({ raceName: races[0].name })}
//                 className="block w-full text-left text-xs text-green-800 hover:text-green-900 bg-green-100 hover:bg-green-200 px-2 py-1 rounded transition-colors"
//             >
//                 <strong>Race Reminder:</strong> {races[0].name} (date & week auto-filled)
//             </button>
//         );
//     } else if (templateId.includes('pick_reminder') && (!races || races.length === 0)) {
//         examples.push(
//             <div key="no-races" className="text-xs text-gray-500 italic">No upcoming races available</div>
//         );
//     }
//     
//     if (templateId === 'league_invitation' && leagues && leagues.length > 0) {
//         examples.push(
//             <button
//                 key="league-invitation"
//                 onClick={() => setTemplateFields({ leagueName: leagues[0].name })}
//                 className="block w-full text-left text-xs text-green-800 hover:text-green-900 bg-green-100 hover:bg-green-200 px-2 py-1 rounded transition-colors"
//             >
//                 <strong>League Invitation:</strong> {leagues[0].name} (join code auto-filled)
//             </button>
//         );
//     } else if (templateId === 'league_invitation' && (!leagues || races.length === 0)) {
//         examples.push(
//         <div key="no-leagues" className="text-xs text-gray-500 italic">No active leagues available</div>
//         );
//     }
//     
//     if (templateId === 'custom_message') {
//         examples.push(
//             <button
//                 key="custom-message"
//                 onClick={() => setTemplateFields({
//                     customTitle: 'Welcome to FinalPoint!',
//                     customSubject: 'Welcome to FinalPoint!',
//                     customBody: 'We\'re excited to have you join our F1 prediction game!'
//                 })}
//                 className="block w-full text-left text-xs text-green-800 hover:text-green-900 bg-green-100 hover:bg-green-200 px-2 py-1 rounded transition-colors"
//             >
//                 <strong>Custom Message:</strong> Welcome message with custom content
//             </button>
//         );
//     }
//     
//     return examples;
// };

const NotificationTester: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [races, setRaces] = useState<Race[]>([]);
    const [leagues, setLeagues] = useState<League[]>([]);
    const [selectedUser, setSelectedUser] = useState<number | ''>('');
    const [notificationType, setNotificationType] = useState<'email' | 'push' | 'both'>('both');
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [templateFields, setTemplateFields] = useState<Record<string, string>>({});
    const [customMessage, setCustomMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<NotificationResult | null>(null);
    const [notificationHistory, setNotificationHistory] = useState<NotificationHistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    // Fetch users, races, and leagues on component mount
    useEffect(() => {
        const fetchData = async () => {
            setDataLoading(true);
            try {
                const [usersResponse, racesResponse, leaguesResponse] = await Promise.all([
                    adminAPI.getAllUsers(),
                    adminAPI.getAvailableRaces(),
                    adminAPI.getAvailableLeagues()
                ]);

                if (usersResponse.data.success) setUsers(usersResponse.data.data || []);
                if (racesResponse.data.success) setRaces(racesResponse.data.races || []);
                if (leaguesResponse.data.success) {
                    setLeagues(leaguesResponse.data.leagues || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                // Set empty arrays as fallback
                setUsers([]);
                setRaces([]);
                setLeagues([]);
            } finally {
                setDataLoading(false);
            }
        };

        fetchData();
    }, []);

    // Load notification history when user is selected
    useEffect(() => {
        if (selectedUser && showHistory) {
            loadNotificationHistory();
        }
    }, [selectedUser, showHistory]);

    // Reset template fields when template changes
    useEffect(() => {
        if (selectedTemplate) {
            const template = getTemplateById(selectedTemplate);
            if (template) {
                // Extract variables from the template content
                const templateVariables = extractTemplateVariables(template);

                // Build the fields object with only user-input variables
                const newFields = Object.fromEntries(
                    Object.keys(templateVariables)
                        .filter(variableName => isUserInputVariable(variableName))
                        .map(variableName => {
                            if (variableName === 'raceName' && races.length > 0) {
                                return [variableName, races[0].name];
                            } else if (variableName === 'leagueName' && leagues.length > 0) {
                                return [variableName, leagues[0].name];
                            } else if (variableName === 'customTitle') {
                                return [variableName, 'Custom Notification'];
                            } else if (variableName === 'customSubject') {
                                return [variableName, 'Custom Email Subject'];
                            } else if (variableName === 'customBody') {
                                return [variableName, 'Custom message body.'];
                            } else {
                                // Use the extracted placeholder for other variables
                                return [variableName, templateVariables[variableName]];
                            }
                        })
                );

                setTemplateFields(newFields);
            }
        }
    }, [selectedTemplate, races, leagues]);

    const loadNotificationHistory = async () => {
        if (!selectedUser) return;

        setHistoryLoading(true);
        try {
            const response = await adminAPI.getUserNotificationHistory(selectedUser);
            if (response.status === 200) {
                setNotificationHistory(response.data.data.history);
            }
        } catch (error: unknown) {
            console.error('Error loading notification history:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const getTemplatePreview = () => {
        const template = getTemplateById(selectedTemplate);
        if (!template) return { title: '', body: '' };

        let title = template.title;
        let body = template.body;
        let emailSubject = template.emailSubject;

        // Replace template variables
        Object.entries(templateFields).forEach(([key, value]) => {
            const placeholder = `{${key}}`;
            title = title.replace(new RegExp(placeholder, 'g'), value || placeholder);
            body = body.replace(new RegExp(placeholder, 'g'), value || placeholder);
            emailSubject = emailSubject.replace(new RegExp(placeholder, 'g'), value || placeholder);
        });

        return { title, body, emailSubject };
    };

    const handleTestNotification = async () => {
        if (!selectedUser) {
            setResult({ success: false, message: 'Please select a user' });
            return;
        }

        const template = getTemplateById(selectedTemplate);
        if (!template) {
            setResult({ success: false, message: 'Invalid template selected' });
            return;
        }

        // Validate required fields for the selected template
        const requiredFields = [];
        if (template.title.includes('{raceName}') && !templateFields.raceName) requiredFields.push('Race Name');
        if (template.title.includes('{raceDate}') && !templateFields.raceDate) requiredFields.push('Race Date');
        if (template.title.includes('{weekNumber}') && !templateFields.weekNumber) requiredFields.push('Week Number');
        if (template.title.includes('{leagueName}') && !templateFields.leagueName) requiredFields.push('League Name');
        if (template.title.includes('{joinCode}') && !templateFields.joinCode) requiredFields.push('Join Code');
        if (template.id === 'custom_message') {
            if (!templateFields.customTitle) requiredFields.push('Custom Title');
            if (!templateFields.customSubject) requiredFields.push('Custom Subject');
            if (!templateFields.customBody) requiredFields.push('Custom Body');
        }

        if (requiredFields.length > 0) {
            setResult({
                success: false,
                message: `Please fill in required fields: ${requiredFields.join(', ')}`
            });
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            // Prepare template fields for backend
            const backendTemplateFields: Record<string, string> = {};
            Object.entries(templateFields).forEach(([key, value]) => {
                if (value) {
                    backendTemplateFields[key] = value;
                }
            });

            const response = await adminAPI.testNotifications({
                userId: selectedUser,
                notificationType,
                customMessage: customMessage || undefined,
                templateId: selectedTemplate,
                templateFields: backendTemplateFields
            });

            if (response.status === 200) {
                setResult({
                    success: true,
                    message: response.data.message,
                    results: response.data.results
                });

                // Refresh notification history after sending test notification
                if (showHistory) {
                    setTimeout(() => loadNotificationHistory(), 1000);
                }
            } else {
                setResult({
                    success: false,
                    message: response.data.message || 'Failed to send test notification'
                });
            }
        } catch (error: unknown) {
            let errorMessage = 'Error sending test notification';

            if (error && typeof error === 'object' && 'response' in error) {
                const responseError = error as { response?: { data?: { message?: string } } };
                errorMessage = responseError.response?.data?.message || errorMessage;
            }

            setResult({
                success: false,
                message: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    const selectedUserInfo = users?.find(user => user.id === selectedUser) || null;
    const selectedTemplateData = getTemplateById(selectedTemplate);
    const templatePreview = getTemplatePreview();

    // Show loading state while data is being fetched
    if (dataLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading notification templates and data...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state if no data was loaded
    if (!users || users.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="text-center py-12">
                        <div className="text-red-600 text-6xl mb-4">⚠️</div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Data</h2>
                        <p className="text-gray-600 mb-4">Failed to load users, races, or leagues data.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'sent':
                return 'text-green-600 bg-green-100';
            case 'failed':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'reminder':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'promotional':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'system':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'custom':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Test Notifications</h2>

            <div className="space-y-6">
                {/* User Selection */}
                <div>
                    <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Select User
                    </label>
                    <select
                        id="user-select"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                        <option value="" className="text-gray-500">Choose a user...</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id} className="text-gray-900">
                                {user.name} ({user.email})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Template Selection */}
                <div>
                    <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Notification Template
                    </label>
                    <select
                        id="template-select"
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                        {notificationTemplates.map((template) => (
                            <option key={template.id} value={template.id} className="text-gray-900">
                                {template.name} - {template.description}
                            </option>
                        ))}
                    </select>
                    {selectedTemplateData && (
                        <div className="mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(selectedTemplateData.category)}`}>
                                {selectedTemplateData.category}
                            </span>
                        </div>
                    )}
                </div>

                {/* Template Fields */}
                {selectedTemplateData && (
                    <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Template Variables</h4>

                        {/* Database-Driven Features Note */}
                        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
                            <h5 className="text-xs font-medium text-amber-900 mb-2">💡 Smart Auto-Fill Features:</h5>
                            <div className="text-xs text-amber-800 space-y-1">
                                {getTemplateAutoFillFeatures(selectedTemplate).map((feature, index) => (
                                    <div key={index}>• {feature}</div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-2">
                                    Edit the JSON below to customize your notification. The variables will automatically replace placeholders in the template.
                                </label>
                                <textarea
                                    value={JSON.stringify(templateFields, null, 2)}
                                    onChange={(e) => {
                                        try {
                                            const newFields = JSON.parse(e.target.value);
                                            setTemplateFields(newFields);
                                        } catch (error) {
                                            // Allow invalid JSON while typing
                                        }
                                    }}
                                    placeholder="Enter JSON with template variables..."
                                    rows={8}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-900"
                                />
                            </div>

                            {/* Template Variable Help */}
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                <h5 className="text-xs font-medium text-blue-900 mb-2">Available Variables:</h5>
                                <div className="text-xs text-blue-800 space-y-1">
                                    {Object.keys(templateFields).map(variableName => {
                                        const description = getVariableDescription(variableName);
                                        return (
                                            <div key={variableName}>
                                                <code className="bg-blue-100 px-1 rounded">{`{${variableName}}`}</code> - {description}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quick Fill Examples */}
                            <div className="bg-green-50 border border-green-200 rounded-md p-3">
                                <h5 className="text-xs font-medium text-green-900 mb-2">Quick Fill Examples:</h5>
                                <div className="space-y-2">
                                    {/* Race Reminder Templates */}
                                    {(selectedTemplateData.id.includes('pick_reminder') || selectedTemplateData.id === 'score_update') && races && races.length > 0 && (
                                        <button
                                            onClick={() => setTemplateFields({ raceName: races[0].name })}
                                            className="block w-full text-left text-xs text-green-800 hover:text-green-900 bg-green-100 hover:bg-green-200 px-2 py-1 rounded transition-colors"
                                        >
                                            <strong>Race Template:</strong> {races[0].name} (date & week auto-filled)
                                        </button>
                                    )}
                                    {(selectedTemplateData.id.includes('pick_reminder') || selectedTemplateData.id === 'score_update') && (!races || races.length === 0) && (
                                        <div className="text-xs text-gray-500 italic">No upcoming races available</div>
                                    )}

                                    {/* League Invitation Template */}
                                    {selectedTemplateData.id === 'league_invitation' && leagues && leagues.length > 0 && (
                                        <button
                                            onClick={() => setTemplateFields({ leagueName: leagues[0].name })}
                                            className="block w-full text-left text-xs text-green-800 hover:text-green-900 bg-green-100 hover:bg-green-200 px-2 py-1 rounded transition-colors"
                                        >
                                            <strong>League Invitation:</strong> {leagues[0].name} (join code auto-filled)
                                        </button>
                                    )}
                                    {selectedTemplateData.id === 'league_invitation' && (!leagues || leagues.length === 0) && (
                                        <div className="text-xs text-gray-500 italic">No active leagues available</div>
                                    )}

                                    {/* Custom Message Template */}
                                    {selectedTemplateData.id === 'custom_message' && (
                                        <button
                                            onClick={() => setTemplateFields({
                                                customTitle: 'Welcome to FinalPoint!',
                                                customSubject: 'Welcome to FinalPoint!',
                                                customBody: 'We\'re excited to have you join our F1 prediction game!'
                                            })}
                                            className="block w-full text-left text-xs text-green-800 hover:text-green-900 bg-green-100 hover:bg-green-200 px-2 py-1 rounded transition-colors"
                                        >
                                            <strong>Custom Message:</strong> Welcome message with custom content
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Template Preview */}
                {selectedTemplateData && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Preview</h4>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="font-medium text-blue-800">Push Title:</span>
                                <span className="ml-2 text-blue-900">{templatePreview.title}</span>
                            </div>
                            <div>
                                <span className="font-medium text-blue-800">Push Body:</span>
                                <span className="ml-2 text-blue-900">{templatePreview.body}</span>
                            </div>
                            {notificationType === 'email' || notificationType === 'both' ? (
                                <div>
                                    <span className="font-medium text-blue-800">Email Subject:</span>
                                    <span className="ml-2 text-blue-900">{templatePreview.emailSubject}</span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}

                {/* Notification Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notification Type
                    </label>
                    <div className="flex space-x-4">
                        {(['email', 'push', 'both'] as const).map((type) => (
                            <label key={type} className="flex items-center">
                                <input
                                    type="radio"
                                    name="notificationType"
                                    value={type}
                                    checked={notificationType === type}
                                    onChange={(e) => setNotificationType(e.target.value as 'email' | 'push' | 'both')}
                                    className="mr-2 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 capitalize">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Custom Message (Legacy) */}
                <div>
                    <label htmlFor="custom-message" className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Custom Message (Optional)
                    </label>
                    <input
                        type="text"
                        id="custom-message"
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder="Add any additional custom text..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-900"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        This will be appended to the template message if provided.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                    <button
                        onClick={handleTestNotification}
                        disabled={!selectedUser || isLoading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Sending...' : 'Send Test Notification'}
                    </button>

                    {selectedUser && (
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            {showHistory ? 'Hide History' : 'View History'}
                        </button>
                    )}
                </div>

                {/* Selected User Info */}
                {selectedUserInfo && (
                    <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-600">
                            <strong>Selected User:</strong> {selectedUserInfo.name} ({selectedUserInfo.email})
                        </p>
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}>
                        <h4 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'
                            }`}>
                            {result.success ? 'Success!' : 'Error'}
                        </h4>
                        <p className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'
                            }`}>
                            {result.message}
                        </p>

                        {result.results && (
                            <div className="mt-3 text-sm">
                                <h5 className="font-medium text-gray-700 mb-2">Results:</h5>
                                <pre className="bg-white p-3 rounded border border-gray-300 text-sm text-gray-800 overflow-auto font-mono leading-relaxed">
                                    {JSON.stringify(result.results, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}

                {/* Notification History */}
                {showHistory && selectedUser && (
                    <div className="mt-6">
                        <h3 className="text-md font-medium text-gray-900 mb-4">Notification History</h3>

                        {historyLoading ? (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                            </div>
                        ) : notificationHistory.length > 0 ? (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {notificationHistory.map((item) => (
                                    <div key={item.id} className="border border-gray-200 rounded-md p-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">{item.title}</h4>
                                                <p className="text-sm text-gray-600">{item.body}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                            <span>{item.type} • {item.notificationType}</span>
                                            <span>{formatDate(item.sentAt)}</span>
                                        </div>
                                        {item.errorMessage && (
                                            <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                                <strong>Error:</strong> {item.errorMessage}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                No notification history found for this user.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default NotificationTester;
