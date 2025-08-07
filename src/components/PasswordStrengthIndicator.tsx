'use client';

import React from 'react';

interface PasswordRequirement {
    test: (password: string) => boolean;
    label: string;
}

interface PasswordStrengthIndicatorProps {
    password: string;
    showRequirements?: boolean;
}

const requirements: PasswordRequirement[] = [
    {
        test: (password) => password.length >= 8,
        label: 'At least 8 characters'
    },
    {
        test: (password) => /[a-z]/.test(password),
        label: 'Contains lowercase letter'
    },
    {
        test: (password) => /[A-Z]/.test(password),
        label: 'Contains uppercase letter'
    },
    {
        test: (password) => /\d/.test(password),
        label: 'Contains number'
    },
    {
        test: (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
        label: 'Contains special character'
    }
];

export const validatePasswordComplexity = (password: string) => {
    const errors: string[] = [];

    requirements.forEach(req => {
        if (!req.test(password)) {
            errors.push(req.label);
        }
    });

    // Check for common weak patterns
    const weakPatterns = [
        { test: /(.)\1{2,}/, message: 'Avoid repeated characters' },
        { test: /123456/, message: 'Avoid sequential numbers' },
        { test: /abcdef/i, message: 'Avoid sequential letters' },
        { test: /qwerty/i, message: 'Avoid keyboard patterns' },
        { test: /password/i, message: 'Avoid common words like "password"' },
    ];

    for (const pattern of weakPatterns) {
        if (pattern.test.test(password)) {
            errors.push(pattern.message);
            break; // Only show one weak pattern error
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        score: requirements.filter(req => req.test(password)).length
    };
};

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
    password,
    showRequirements = true
}) => {
    const validation = validatePasswordComplexity(password);
    const { score, isValid } = validation;

    const getStrengthColor = () => {
        if (score === 0) return 'bg-gray-200';
        if (score <= 2) return 'bg-red-500';
        if (score <= 3) return 'bg-yellow-500';
        if (score <= 4) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getStrengthText = () => {
        if (score === 0) return 'Enter password';
        if (score <= 2) return 'Weak';
        if (score <= 3) return 'Fair';
        if (score <= 4) return 'Good';
        return 'Strong';
    };

    if (!password && !showRequirements) return null;

    return (
        <div className="mt-2">
            {/* Strength Meter */}
            <div className="flex items-center space-x-2 mb-2">
                <div className="flex-1">
                    <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <div
                                key={level}
                                className={`h-2 flex-1 rounded ${level <= score ? getStrengthColor() : 'bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
                <span className="text-sm font-medium text-gray-600 min-w-16">
                    {getStrengthText()}
                </span>
            </div>

            {/* Requirements List */}
            {showRequirements && password && (
                <div className="space-y-1">
                    {requirements.map((req, index) => {
                        const isMet = req.test(password);
                        return (
                            <div key={index} className="flex items-center space-x-2">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isMet ? 'bg-green-500' : 'bg-gray-300'
                                    }`}>
                                    {isMet && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`text-sm ${isMet ? 'text-green-600' : 'text-gray-500'
                                    }`}>
                                    {req.label}
                                </span>
                            </div>
                        );
                    })}

                    {/* Weak pattern warning */}
                    {password && validation.errors.some(error =>
                        error.includes('repeated') ||
                        error.includes('sequential') ||
                        error.includes('keyboard') ||
                        error.includes('common')
                    ) && (
                            <div className="flex items-center space-x-2 mt-2">
                                <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-sm text-red-600">
                                    {validation.errors.find(error =>
                                        error.includes('repeated') ||
                                        error.includes('sequential') ||
                                        error.includes('keyboard') ||
                                        error.includes('common')
                                    )}
                                </span>
                            </div>
                        )}
                </div>
            )}
        </div>
    );
};

export default PasswordStrengthIndicator;
