# Contact Email Configuration

The contact email address used throughout the FinalPoint web and mobile applications is now configurable via environment variables.

## Environment Variables

### Web App (.env.local)
```bash
NEXT_PUBLIC_CONTACT_EMAIL=finalpointapp@gmail.com
```

### Mobile App (.env)
```bash
EXPO_PUBLIC_CONTACT_EMAIL=finalpointapp@gmail.com
```

## Default Value

If no environment variable is set, the applications will default to `finalpointapp@gmail.com`.

## Files Updated

The following files now use the environment variable instead of hardcoded email addresses:

### Web App
- `src/app/terms/page.tsx`
- `src/app/marketing/page.tsx`
- `src/app/info/page.tsx`
- `src/app/profile/page.tsx`
- `src/app/profile/delete-account/page.tsx`

### Mobile App
- `app/delete-account.tsx`
- `app/(tabs)/profile.tsx`

## Benefits

1. **Easy to change**: Update the email address in one place (environment variable)
2. **Environment-specific**: Different emails for development, staging, and production
3. **No code changes**: Modify the email without touching the source code
4. **Consistent**: Same email address used across all components

## Usage in Code

### Web App
```typescript
import { CONTACT_EMAIL } from '@/lib/environment';

// Use in mailto links
<a href={`mailto:${CONTACT_EMAIL}?subject=Support Request`}>
  Contact Support
</a>
```

### Mobile App
```typescript
import { contactConfig } from '@/config/environment';

// Use in mailto links
const emailUrl = `mailto:${contactConfig.email}?subject=Support Request`;
```
