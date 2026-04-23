import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useResponsive } from '../utils/responsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: any;
  paddingVariant?: 'compact' | 'normal' | 'spacious';
}

/**
 * Responsive container that adapts to screen size
 * On desktop: centers content with max-width and proper spacing
 * On mobile: uses full width with minimal padding
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  style,
  paddingVariant = 'normal',
}) => {
  const { isDesktop, isTablet, getMaxContentWidth, getResponsivePadding } = useResponsive();
  const maxWidth = getMaxContentWidth();
  const padding = getResponsivePadding();

  const paddingMap = {
    compact: padding * 0.75,
    normal: padding,
    spacious: padding * 1.5,
  };

  const containerStyle = {
    alignSelf: isDesktop || isTablet ? ('center' as const) : undefined,
    maxWidth: isDesktop ? maxWidth : undefined,
    width: isDesktop ? maxWidth : '100%',
    paddingHorizontal: paddingMap[paddingVariant],
    paddingVertical: paddingMap[paddingVariant] * 0.75,
  };

  return (
    <View style={[containerStyle, style]}>
      {children}
    </View>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  minCardWidth?: number;
  gap?: number;
  style?: any;
}

/**
 * Responsive grid that automatically adjusts columns based on screen size
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  minCardWidth = 160,
  gap = 12,
  style,
}) => {
  const { width } = useResponsive();
  const columns = Math.max(1, Math.floor((width - 24) / (minCardWidth + gap)));

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginHorizontal: -gap / 2,
          gap,
        },
        style,
      ]}
    >
      {React.Children.map(children, (child) => (
        <View
          style={{
            width: `${100 / columns}%`,
            paddingHorizontal: gap / 2,
            marginBottom: gap / 2,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
};

interface ResponsiveSectionProps {
  children: React.ReactNode;
  title?: string;
  titleStyle?: any;
  style?: any;
}

/**
 * Responsive section with proper spacing for different screen sizes
 */
export const ResponsiveSection: React.FC<ResponsiveSectionProps> = ({
  children,
  title,
  titleStyle,
  style,
}) => {
  const { getResponsiveFontSize, getResponsivePadding } = useResponsive();
  const padding = getResponsivePadding();

  return (
    <View style={[{ paddingVertical: padding * 1.5 }, style]}>
      {title && (
        <Text
          style={[
            {
              fontSize: getResponsiveFontSize(18, 20, 24),
              fontWeight: 'bold',
              marginBottom: padding,
              paddingHorizontal: padding,
            },
            titleStyle,
          ]}
        >
          {title}
        </Text>
      )}
      {children}
    </View>
  );
};

interface ResponsiveHeaderProps {
  children: React.ReactNode;
  style?: any;
}

/**
 * Responsive header that adjusts to screen size
 */
export const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({ children, style }) => {
  const { isDesktop, getResponsivePadding } = useResponsive();
  const padding = getResponsivePadding();

  return (
    <View
      style={[
        {
          paddingVertical: isDesktop ? padding * 2 : padding,
          paddingHorizontal: padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  // Placeholder for any additional styles
});

export default {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveSection,
  ResponsiveHeader,
};
