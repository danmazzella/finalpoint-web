# Contextual Notification Prompts

This system provides contextual notification permission requests that appear at strategic moments when users are most likely to want notifications.

## Overview

Instead of showing a generic notification permission request immediately when users visit your site, these prompts appear at specific moments:

- **League Join**: When a user joins a league
- **League Viewing**: When a user views a league page
- **Picks Page**: When a user visits the picks page
- **Race Reminders**: When there's an upcoming race within 3 days
- **Score Updates**: When users receive race results
- **Custom Scenarios**: Any other strategic moment you define

## Browser Compatibility

### ✅ **Supported Browsers**
- **Chrome/Edge**: Full support for notifications and service workers
- **Firefox**: Full support with Firefox-specific guidance
- **Safari**: Basic notification support (limited service worker support)

### 🔧 **Firefox-Specific Features**
- Automatic Firefox detection
- Special guidance for notification permissions
- Shield icon instructions in address bar
- Graceful fallback for blocked notifications

## Components

### Core Hook: `useNotificationPrompt`

```tsx
import { useNotificationPrompt } from '@/hooks/useNotificationPrompt';

const { 
    showPrompt, 
    permission, 
    isRequesting, 
    isFirefox,
    requestPermission, 
    dismiss 
} = useNotificationPrompt(triggerCondition, config);
```

**Parameters:**
- `triggerCondition`: Boolean that determines when to show the prompt
- `config`: Optional configuration object to customize messaging

**Returns:**
- `showPrompt`: Whether the prompt should be displayed
- `permission`: Current notification permission status
- `isRequesting`: Whether permission request is in progress
- `isFirefox`: Whether user is on Firefox (for special guidance)
- `requestPermission`: Function to request notification permission
- `dismiss`: Function to dismiss the prompt

### Trigger Management: `useNotificationTriggers`

```tsx
import { useNotificationTriggers } from '@/hooks/useNotificationTriggers';

const { 
    triggers, 
    shouldShowPrompt, 
    updateTriggers, 
    markPromptShown,
    resetTriggers 
} = useNotificationTriggers();
```

**Returns:**
- `triggers`: Object containing all trigger conditions
- `shouldShowPrompt`: Whether any trigger condition is met
- `updateTriggers`: Function to update trigger states
- `markPromptShown`: Function to mark prompt as shown
- `resetTriggers`: Function to reset all triggers (for testing)

### Main Component: `NotificationPrompt`

```tsx
import { NotificationPrompt } from '@/components/NotificationPrompt';

<NotificationPrompt
    triggerCondition={shouldShowPrompt}
    config={{
        title: 'Custom Title',
        message: 'Custom message here',
        enableText: 'Enable',
        dismissText: 'Not Now',
        showIcon: true
    }}
    variant="banner" // 'banner', 'modal', or 'inline'
    className="custom-classes"
/>
```

**Variants:**
- `banner`: Top banner (default)
- `modal`: Full-screen modal overlay
- `inline`: Inline component within content

### Comprehensive Component: `ComprehensiveNotificationPrompt`

```tsx
import { ComprehensiveNotificationPrompt } from '@/components/ComprehensiveNotificationPrompt';

<ComprehensiveNotificationPrompt
    currentPage="dashboard" // 'dashboard', 'league', 'picks', 'other'
    leagues={userLeagues}
    className="custom-classes"
/>
```

**Page Types:**
- `dashboard`: Shows league join prompts
- `league`: Shows league viewing prompts
- `picks`: Shows picks page prompts
- `other`: Generic prompts

### Pre-built Contextual Prompts

#### LeagueJoinPrompt
```tsx
import { LeagueJoinPrompt } from '@/components/contextual-prompts';

<LeagueJoinPrompt hasJoinedLeague={userJustJoinedLeague} />
```

#### RaceReminderPrompt
```tsx
import { RaceReminderPrompt } from '@/components/contextual-prompts';

<RaceReminderPrompt 
    hasUpcomingRace={hasUpcomingRace}
    daysUntilRace={daysUntilRace}
/>
```

#### ScoreUpdatePrompt
```tsx
import { ScoreUpdatePrompt } from '@/components/contextual-prompts';

<ScoreUpdatePrompt hasRecentScoreUpdate={hasScoreUpdate} />
```

## Usage Examples

### 1. Dashboard Integration (Recommended)

```tsx
// In your dashboard component
import { DashboardNotificationIntegration } from '@/components/DashboardNotificationIntegration';

export default function Dashboard() {
    const [leagues, setLeagues] = useState([]);
    
    return (
        <div>
            <DashboardNotificationIntegration leagues={leagues} />
            {/* Your existing dashboard content */}
        </div>
    );
}
```

### 2. Comprehensive Prompt for Any Page

```tsx
import { ComprehensiveNotificationPrompt } from '@/components/ComprehensiveNotificationPrompt';

export default function LeaguePage() {
    return (
        <div>
            <ComprehensiveNotificationPrompt 
                currentPage="league"
                leagues={userLeagues}
            />
            {/* League content */}
        </div>
    );
}
```

### 3. Custom Trigger Logic

```tsx
import { NotificationPrompt } from '@/components/NotificationPrompt';

export default function MyPage() {
    const [userEngagement, setUserEngagement] = useState(0);
    
    // Show prompt after user has engaged with the page
    const shouldShowPrompt = userEngagement > 3;
    
    return (
        <div>
            <NotificationPrompt
                triggerCondition={shouldShowPrompt}
                config={{
                    title: 'Stay Updated!',
                    message: 'You seem to be enjoying this! Enable notifications for updates.',
                    enableText: 'Enable Notifications',
                    dismissText: 'Maybe Later'
                }}
                variant="modal"
            />
            
            {/* Your page content */}
        </div>
    );
}
```

### 4. Manual Trigger Management

```tsx
import { useNotificationTriggers } from '@/hooks/useNotificationTriggers';
import { NotificationPrompt } from '@/components/NotificationPrompt';

export default function CustomPage() {
    const { 
        triggers, 
        shouldShowPrompt, 
        updateTriggers 
    } = useNotificationTriggers();
    
    // Manually trigger based on user actions
    const handleUserAction = () => {
        updateTriggers({ hasRecentScoreUpdate: true });
    };
    
    return (
        <div>
            <NotificationPrompt
                triggerCondition={shouldShowPrompt}
                config={{
                    title: 'Score Update!',
                    message: 'Your results are in!'
                }}
            />
            
            <button onClick={handleUserAction}>
                Simulate Score Update
            </button>
        </div>
    );
}
```

## Configuration Options

### Default Configuration
```tsx
const defaultConfig = {
    title: 'Stay Updated!',
    message: 'Get notified about race reminders, score updates, and important league news.',
    enableText: 'Enable Notifications',
    dismissText: 'Not Now',
    showIcon: true
};
```

### Custom Configuration
```tsx
const customConfig = {
    title: 'Race Tomorrow! 🏎️',
    message: 'Don\'t miss making your picks! Enable notifications for race reminders.',
    enableText: 'Get Reminders',
    dismissText: 'I\'ll Remember',
    showIcon: false
};
```

## Trigger Conditions

The system automatically detects and triggers prompts based on:

### **League Join**
- User joins their first league
- User joins additional leagues (within 24 hours)
- Detected automatically from league data

### **League Viewing**
- User visits any league page
- Triggers when `currentPage="league"`

### **Picks Page**
- User visits the picks/making picks page
- Triggers when `currentPage="picks"`

### **Race Reminders**
- Upcoming race within 3 days
- Configurable timing and messaging
- Automatic detection from race schedule

### **Score Updates**
- Recent race results received
- Manual trigger or API-based detection

## Best Practices

### 1. Timing
- **Don't show immediately**: Wait for user engagement (3-5 seconds minimum)
- **Contextual triggers**: Show when it makes sense (after actions, before events)
- **Don't overwhelm**: Limit to one prompt per session
- **Respect user choice**: Remember if they've dismissed the prompt

### 2. Messaging
- **Clear value proposition**: Explain what notifications they'll receive
- **Specific benefits**: "Get race reminders" vs "Stay updated"
- **Urgency when appropriate**: "Race tomorrow!" vs "Stay in the loop"
- **Page-specific content**: Different messages for different contexts

### 3. User Experience
- **Always dismissible**: Users should be able to say "not now"
- **Respect decisions**: If they decline, don't ask again immediately
- **Success feedback**: Show confirmation when notifications are enabled
- **Firefox guidance**: Provide specific help for Firefox users

### 4. Technical Considerations
- **Permission checking**: Always check current permission status
- **Service worker setup**: Handle push subscription after permission granted
- **Error handling**: Gracefully handle permission denial or errors
- **Cross-browser compatibility**: Handle Firefox-specific behaviors

## Integration with Existing System

This system works alongside your existing notification preferences page (`/notifications`). Users can:

1. **Enable notifications** through contextual prompts
2. **Manage preferences** through the dedicated settings page
3. **Test notifications** to verify everything works
4. **Get Firefox-specific guidance** when needed

## Demo

Use the `NotificationPromptDemo` component to see all prompts in action:

```tsx
import { NotificationPromptDemo } from '@/components/NotificationPromptDemo';

// In your demo page
<NotificationPromptDemo />
```

## Troubleshooting

### Common Issues

1. **Prompt not showing**: Check that `triggerCondition` is true and permission is 'default'
2. **Permission not working**: Ensure service worker is registered and VAPID key is set
3. **Multiple prompts**: Make sure you're not rendering multiple instances with the same trigger
4. **Firefox issues**: Check console for Firefox-specific guidance

### Debug Mode

Enable console logging to debug prompt behavior:

```tsx
const { showPrompt, permission, triggers } = useNotificationTriggers();
console.log('Prompt state:', { showPrompt, permission, triggers });
```

### Firefox-Specific Debugging

```tsx
const { isFirefox, permission } = useNotificationPrompt(triggerCondition);
if (isFirefox) {
    console.log('Firefox detected, permission:', permission);
}
```

## Future Enhancements

- **A/B testing**: Different messaging for different user segments
- **Analytics tracking**: Measure prompt effectiveness and conversion rates
- **Smart timing**: Use user behavior data to optimize when prompts appear
- **Progressive enhancement**: Start with email, then suggest push notifications
- **Cross-browser optimization**: Enhanced support for Safari and other browsers
