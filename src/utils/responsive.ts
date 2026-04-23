import { useWindowDimensions, Platform } from 'react-native';

/**
 * Responsive design breakpoints
 * Mobile: < 600px
 * Tablet: 600px - 1024px
 * Desktop: > 1024px
 */
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 600,
  desktop: 1024,
  largeDesktop: 1440,
};

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'largeDesktop';

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  const getDeviceType = (): DeviceType => {
    if (width >= BREAKPOINTS.largeDesktop) return 'largeDesktop';
    if (width >= BREAKPOINTS.desktop) return 'desktop';
    if (width >= BREAKPOINTS.tablet) return 'tablet';
    return 'mobile';
  };

  const isMobile = width < BREAKPOINTS.tablet;
  const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
  const isDesktop = width >= BREAKPOINTS.desktop;
  const isWeb = Platform.OS === 'web';

  const getResponsiveValue = <T,>(
    mobile: T,
    tablet?: T,
    desktop?: T,
    largeDesktop?: T
  ): T => {
    const deviceType = getDeviceType();
    switch (deviceType) {
      case 'largeDesktop':
        return largeDesktop !== undefined ? largeDesktop : desktop || tablet || mobile;
      case 'desktop':
        return desktop !== undefined ? desktop : tablet || mobile;
      case 'tablet':
        return tablet !== undefined ? tablet : mobile;
      default:
        return mobile;
    }
  };

  const getColumnsForGrid = (minCardWidth: number = 150): number => {
    return Math.max(1, Math.floor(width / minCardWidth));
  };

  const getResponsivePadding = (): number => {
    return getResponsiveValue(12, 16, 24, 32);
  };

  const getResponsiveFontSize = (mobile: number, tablet?: number, desktop?: number): number => {
    return getResponsiveValue(mobile, tablet, desktop);
  };

  const getMaxContentWidth = (): number => {
    if (isDesktop) return 1280;
    if (isTablet) return 900;
    return width - 24;
  };

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isWeb,
    deviceType: getDeviceType(),
    getResponsiveValue,
    getColumnsForGrid,
    getResponsivePadding,
    getResponsiveFontSize,
    getMaxContentWidth,
  };
};

export const responsiveStyles = {
  /**
   * Create responsive grid container
   */
  responsiveGridContainer: (columns: number, gap: number = 12) => ({
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap,
    marginHorizontal: -gap / 2,
  }),

  /**
   * Create responsive grid item
   */
  responsiveGridItem: (columns: number, gap: number = 12) => ({
    width: `${100 / columns}%`,
    paddingHorizontal: gap / 2,
    marginBottom: gap,
  }),

  /**
   * Responsive padding
   */
  responsiveContainer: (padding: number) => ({
    paddingHorizontal: padding,
    paddingVertical: padding,
  }),

  /**
   * Responsive section spacing
   */
  responsiveSection: (padding: number) => ({
    paddingHorizontal: padding,
    paddingVertical: padding * 1.5,
  }),
};
