# Theme System Documentation

## Overview

The FinalPoint web app now includes a comprehensive dark mode system with centralized theme management. The system automatically detects user preferences, provides smooth transitions, and maintains consistency across all components.

## Features

- **Three Theme Options**: Light, Dark, and System (follows OS preference)
- **Automatic Detection**: Detects and follows system theme changes
- **Persistent Storage**: Saves user preference in localStorage
- **Smooth Transitions**: CSS transitions for all theme changes
- **Centralized Management**: Single source of truth for theme state
- **Responsive Design**: Works seamlessly on desktop and mobile

## Architecture

### Theme Context (`/src/contexts/ThemeContext.tsx`)

The central theme management system that provides:

- `theme`: Current user selection ('light', 'dark', 'system')
- `resolvedTheme`: Actual active theme ('light' or 'dark')
- `setTheme()`: Function to change theme
- `toggleTheme()`: Function to cycle through themes

### CSS Variables

The system uses CSS custom properties for consistent theming:

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
  --card: #ffffff;
  --card-foreground: #171717;
  --primary: #2563eb;
  --primary-foreground: #ffffff;
  /* ... more variables */
}

.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
  --card: #1a1a1a;
  --card-foreground: #ededed;
  /* ... dark theme variables */
}
```

### Tailwind Integration

Tailwind classes automatically use these CSS variables:

- `bg-background` → `background-color: var(--background)`
- `text-foreground` → `color: var(--foreground)`
- `bg-card` → `background-color: var(--card)`
- `border-border` → `border-color: var(--border)`

## Usage

### Basic Theme Toggle

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { toggleTheme, resolvedTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {resolvedTheme}
    </button>
  );
}
```

### Setting Specific Theme

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function ThemeSelector() {
  const { setTheme, theme } = useTheme();
  
  return (
    <div>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
}
```

### Theme-Aware Styling

Always use theme-aware classes instead of hardcoded colors:

```tsx
// ✅ Good - Theme aware
<div className="bg-card text-card-foreground border border-border">
  Content
</div>

// ❌ Bad - Hardcoded colors
<div className="bg-white text-black border border-gray-200">
  Content
</div>
```

## Components

### SimpleThemeToggle

A minimal toggle button that switches between light and dark:

```tsx
import SimpleThemeToggle from '@/components/SimpleThemeToggle';

<SimpleThemeToggle />
```

### ThemeToggle

A full theme selector with three options:

```tsx
import ThemeToggle from '@/components/ThemeToggle';

<ThemeToggle />
```

## Adding New Theme Colors

1. **Add CSS Variables**: Update `globals.css` with new variables
2. **Add Tailwind Classes**: Update `tailwind.config.ts` to map variables
3. **Use in Components**: Apply new classes to components

Example:

```css
/* In globals.css */
:root {
  --success: #10b981;
  --success-foreground: #ffffff;
}

.dark {
  --success: #059669;
  --success-foreground: #ffffff;
}
```

```ts
// In tailwind.config.ts
success: {
  DEFAULT: 'var(--success)',
  foreground: 'var(--success-foreground)',
}
```

```tsx
// In components
<button className="bg-success text-success-foreground">
  Success Button
</button>
```

## Best Practices

### 1. Always Use Theme Variables

Never hardcode colors. Use the provided CSS variables or Tailwind classes.

### 2. Test Both Themes

Always test your components in both light and dark modes to ensure readability.

### 3. Use Semantic Color Names

Choose colors based on their purpose, not their appearance:
- `primary` for main actions
- `secondary` for secondary actions
- `muted` for subtle text
- `destructive` for dangerous actions

### 4. Maintain Contrast

Ensure sufficient contrast between text and background colors in both themes.

### 5. Smooth Transitions

The system automatically provides transitions, but you can customize them:

```css
.custom-transition {
  transition: background-color 0.2s ease, color 0.2s ease;
}
```

## Troubleshooting

### Theme Not Changing

1. Check if `ThemeProvider` is wrapping your app
2. Verify CSS variables are properly defined
3. Check browser console for errors

### Styling Inconsistencies

1. Ensure all components use theme-aware classes
2. Check for hardcoded colors in CSS
3. Verify Tailwind config includes all color variables

### Performance Issues

1. Theme changes are optimized with CSS variables
2. Avoid JavaScript-based theme switching for individual elements
3. Use CSS transitions instead of JavaScript animations

## Migration Guide

### From Hardcoded Colors

1. **Replace hardcoded backgrounds**:
   ```tsx
   // Before
   className="bg-white"
   
   // After
   className="bg-card"
   ```

2. **Replace hardcoded text colors**:
   ```tsx
   // Before
   className="text-gray-900"
   
   // After
   className="text-card-foreground"
   ```

3. **Replace hardcoded borders**:
   ```tsx
   // Before
   className="border-gray-200"
   
   // After
   className="border-border"
   ```

### From CSS Media Queries

1. **Remove `@media (prefers-color-scheme: dark)`** queries
2. **Replace with CSS variables** and theme classes
3. **Use Tailwind's dark mode classes** when needed

## Future Enhancements

- **Custom Theme Builder**: Allow users to create custom color schemes
- **High Contrast Mode**: Accessibility enhancement for better readability
- **Theme Presets**: Pre-built theme collections
- **Animation Preferences**: User-configurable transition speeds
- **Theme Export/Import**: Share custom themes between users

## Support

For questions or issues with the theme system:

1. Check this documentation
2. Review the component examples
3. Check the browser console for errors
4. Verify CSS variable definitions
5. Ensure proper provider setup

The theme system is designed to be robust and maintainable. Follow these guidelines to ensure consistent theming across the application.
