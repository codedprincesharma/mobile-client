# Responsive Design Implementation

This document outlines the responsive design changes made to support laptop/desktop devices alongside mobile.

## Overview

The application now supports three main breakpoints:
- **Mobile**: < 600px
- **Tablet**: 600px - 1024px  
- **Desktop**: > 1024px
- **Large Desktop**: > 1440px

## Key Changes

### 1. Responsive Utilities (`src/utils/responsive.ts`)

Created a comprehensive hook `useResponsive()` that provides:
- Device type detection (mobile/tablet/desktop)
- Responsive values based on screen size
- Grid column calculation
- Adaptive padding/font sizing
- Max content width calculation

**Usage:**
```typescript
const { isDesktop, isTablet, getResponsiveValue, getColumnsForGrid } = useResponsive();
```

### 2. Responsive Layout Components (`src/components/ResponsiveLayout.tsx`)

Created reusable components:
- `ResponsiveContainer`: Centers content on large screens with max-width
- `ResponsiveGrid`: Auto-adjusts grid columns based on screen size
- `ResponsiveSection`: Proper spacing for different devices
- `ResponsiveHeader`: Adaptive header sizing

### 3. App Configuration (`app.json`)

Updated to support:
- `orientation: "default"` - allows both portrait and landscape
- Web-specific settings for better PWA support
- Favicon and display mode configuration

### 4. Navigation (`app/(tabs)/_layout.tsx`)

Updated tab bar behavior:
- **Mobile/Tablet**: Bottom tab bar (unchanged)
- **Desktop**: Top tab bar with labels showing
- Responsive tab bar styling

### 5. Home Screen (`app/(tabs)/index.tsx`)

Fully responsive implementation:
- **Mobile**: 2 columns for products
- **Tablet**: 3 columns for products
- **Desktop**: 4 columns for products
- Responsive padding, margins, and font sizes
- Adaptive hero section and category grid
- Desktop-optimized spacing

## Responsive Values

### Product Grid Columns
- Mobile: 2 columns
- Tablet: 3 columns
- Desktop: 4 columns
- Large Desktop: 4 columns

### Padding
- Mobile: 12px
- Tablet: 16px
- Desktop: 24px
- Large Desktop: 32px

### Font Sizes (Example from Home)
- Section Title
  - Mobile: 18px
  - Desktop: 22px
- Product Name
  - Mobile: 14px
  - Desktop: 15px
- Hero Title
  - Mobile: 24px
  - Desktop: 32px

## How to Use Responsive Design

### In Existing Components

1. **Import the hook:**
```typescript
import { useResponsive } from '@/src/utils/responsive';
```

2. **Use in component:**
```typescript
export const MyComponent = () => {
  const { isDesktop, getResponsiveValue, getResponsivePadding } = useResponsive();
  const padding = getResponsivePadding();
  const fontSize = getResponsiveValue(14, 15, 16); // mobile, tablet, desktop
  
  return (
    <View style={{ paddingHorizontal: padding }}>
      <Text style={{ fontSize }}>Responsive Text</Text>
    </View>
  );
};
```

### Creating New Responsive Components

1. **Use ResponsiveContainer for centering:**
```typescript
<ResponsiveContainer>
  <YourContent />
</ResponsiveContainer>
```

2. **Use ResponsiveGrid for layouts:**
```typescript
<ResponsiveGrid minCardWidth={160} gap={12}>
  {items.map(item => <ItemCard key={item.id} {...item} />)}
</ResponsiveGrid>
```

## Testing Responsive Design

### Desktop/Laptop Testing
1. Open app.json and build for web: `npm run web`
2. Resize browser window to test breakpoints
3. Use browser DevTools to test specific resolutions

### Breakpoint Testing
- **Mobile**: 320px, 375px, 480px
- **Tablet**: 600px, 768px, 1024px
- **Desktop**: 1024px, 1280px, 1440px, 1920px

## Best Practices

1. **Always use the hook** - Don't hardcode breakpoints
2. **Mobile-first approach** - Start with mobile styles, then add tablet/desktop
3. **Test at breakpoints** - Use actual devices or DevTools
4. **Use responsive components** - Leverage ResponsiveContainer, ResponsiveGrid
5. **Consistent spacing** - Use getResponsivePadding() for consistency
6. **Readable on all sizes** - Test text readability at all breakpoints

## Future Improvements

1. Add landscape mode optimizations
2. Implement web-specific sidebar navigation
3. Add tablet-specific optimizations
4. Create responsive modal/dialog system
5. Add dark mode responsive adjustments

## Files Modified

- `app.json` - Added orientation and web configuration
- `app/(tabs)/_layout.tsx` - Responsive tab bar
- `app/(tabs)/index.tsx` - Responsive home screen
- `src/utils/responsive.ts` - New responsive utilities
- `src/components/ResponsiveLayout.tsx` - New layout components

## Resources

- [React Native useWindowDimensions](https://reactnative.dev/docs/usewindowdimensions)
- [Expo Responsive Design](https://expo.dev/guides/web-browser-support)
- [Responsive Design Patterns](https://web.dev/responsive-web-design-basics/)
