export interface NotificationTemplate {
    id: string;
    name: string;
    title: string;
    body: string;
    emailSubject: string;
    category: 'reminder' | 'promotional' | 'system' | 'custom';
    description: string;
}

export const notificationTemplates: NotificationTemplate[] = [
    // Pick Reminder Templates
    {
        id: 'pick_reminder_5_days',
        name: '5-Day Pick Reminder',
        title: 'Race Reminder: {raceName}',
        body: '5 days until {raceName} - Make your picks!',
        emailSubject: 'FinalPoint: 5 days until {raceName}',
        category: 'reminder',
        description: 'Remind users to make their picks 5 days before a race'
    },
    {
        id: 'pick_reminder_3_days',
        name: '3-Day Pick Reminder',
        title: 'Race Reminder: {raceName}',
        body: '3 days until {raceName} - Make your picks!',
        emailSubject: 'FinalPoint: 3 days until {raceName}',
        category: 'reminder',
        description: 'Urgent reminder 3 days before a race'
    },
    {
        id: 'pick_reminder_1_day',
        name: '1-Day Pick Reminder',
        title: 'Final Reminder: {raceName} Tomorrow!',
        body: 'Last chance! {raceName} is tomorrow - Make your picks now!',
        emailSubject: 'FinalPoint: {raceName} is TOMORROW!',
        category: 'reminder',
        description: 'Final urgent reminder 1 day before a race'
    },

    {
        id: 'pick_reminder_1_hour',
        name: '1-Hour Pick Reminder',
        title: 'URGENT: {raceName} in 1 hour!',
        body: 'Race starts in 1 hour - Make your picks NOW!',
        emailSubject: 'URGENT: {raceName} starts in 1 hour!',
        category: 'reminder',
        description: 'Last-minute urgent reminder 1 hour before a race'
    },

    // Promotional Templates
    {
        id: 'league_invitation',
        name: 'League Invitation',
        title: 'Join Our League: {leagueName}',
        body: 'You\'re invited to join {leagueName}! Click to accept.',
        emailSubject: 'FinalPoint: You\'re invited to join {leagueName}!',
        category: 'promotional',
        description: 'Invite users to join a specific league'
    },
    {
        id: 'join_leagues_engagement',
        name: 'Join Leagues Engagement',
        title: '🏁 Ready to Race? Join the Action on FinalPoint!',
        body: 'Welcome to FinalPoint! Join one of our popular leagues and start making your picks for the upcoming races.',
        emailSubject: '🏁 Ready to Race? Join the Action on FinalPoint!',
        category: 'promotional',
        description: 'Encourage new users to join leagues and get active on the platform'
    },

    // System Templates
    {
        id: 'welcome_message',
        name: 'Welcome Message',
        title: 'Welcome to FinalPoint!',
        body: 'Welcome to FinalPoint! Start making your F1 predictions.',
        emailSubject: 'Welcome to FinalPoint!',
        category: 'system',
        description: 'Welcome message for new users'
    },

    // Custom Template
    {
        id: 'custom_message',
        name: 'Custom Message',
        title: '{customTitle}',
        body: '{customBody}',
        emailSubject: '{customSubject}',
        category: 'custom',
        description: 'Send a completely custom message'
    }
];

export const getTemplateById = (id: string): NotificationTemplate | undefined => {
    return notificationTemplates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: NotificationTemplate['category']): NotificationTemplate[] => {
    return notificationTemplates.filter(template => template.category === category);
};

export const getAllTemplates = (): NotificationTemplate[] => {
    return notificationTemplates;
};
