# Redirect System Documentation

## Overview

The FinalPoint web application implements a comprehensive redirect system that ensures users are redirected to their intended destination after logging in or signing up. This provides a seamless user experience when users click on links while not authenticated.

## How It Works

### 1. Protected Route Detection

When a user tries to access a protected route without being authenticated, the `ProtectedRoute` component:

- Detects the current pathname
- Validates the redirect URL for security
- Redirects to `/login?redirect=<encoded_path>`

### 2. API Authentication Failures

When an API call returns a 401 (Unauthorized) error:

- The API interceptor catches the error
- Clears authentication data from localStorage
- Redirects to `/login?redirect=<encoded_path>` with the current URL

### 3. Login/Signup Handling

Both the login and signup pages:

- Extract the `redirect` parameter from the URL
- After successful authentication, redirect the user to the intended destination
- Fall back to `/dashboard` if no redirect parameter is provided

## Security Features

### URL Validation

All redirect URLs are validated to prevent open redirect vulnerabilities:

- Must start with `/` (relative paths only)
- Cannot start with `//` (protocol-relative URLs)
- Cannot contain `javascript:` or `data:` schemes
- Invalid URLs fall back to `/dashboard`

### URL Encoding

All redirect URLs are properly encoded using `encodeURIComponent()` to handle special characters safely.

## Implementation Details

### Components Updated

1. **ProtectedRoute.tsx**
   - Added redirect parameter to login redirects
   - Added URL validation for security

2. **api.ts**
   - Updated 401 error handler to preserve current URL
   - Added URL validation for security

3. **admin/layout.tsx**
   - Updated to preserve current URL when redirecting to login

### Pages Already Supporting Redirects

1. **login/page.tsx** - Already implemented
2. **signup/page.tsx** - Already implemented

## Usage Examples

### Scenario 1: Direct Link Access
1. User clicks a link to `/leagues/123/results/5`
2. User is not logged in
3. User is redirected to `/login?redirect=%2Fleagues%2F123%2Fresults%2F5`
4. User logs in successfully
5. User is redirected to `/leagues/123/results/5`

### Scenario 2: API Authentication Failure
1. User's session expires while on `/picks`
2. User makes an API call
3. API returns 401 error
4. User is redirected to `/login?redirect=%2Fpicks`
5. User logs in successfully
6. User is redirected to `/picks`

### Scenario 3: Admin Access
1. User tries to access `/admin/users`
2. User is not logged in
3. User is redirected to `/login?redirect=%2Fadmin%2Fusers`
4. User logs in successfully
5. User is redirected to `/admin/users`

## Testing

To test the redirect system:

1. **Clear your authentication data** (localStorage)
2. **Try accessing a protected route** (e.g., `/leagues`, `/picks`, `/admin`)
3. **Verify you're redirected to login** with the correct redirect parameter
4. **Log in successfully**
5. **Verify you're redirected to the original page**

## Edge Cases Handled

- **Invalid redirect URLs**: Fall back to `/dashboard`
- **External URLs**: Blocked for security
- **JavaScript/data URLs**: Blocked for security
- **Empty redirect parameter**: Default to `/dashboard`
- **URL encoding**: Properly handled for special characters
