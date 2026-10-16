import React from 'react';
import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export type ThemedViewProps = React.HTMLAttributes<HTMLDivElement> & {
  type?: ThemeColor;
  className?: string;
  children?: React.ReactNode;
};

export function ThemedView({
  type,
  className = '',
  style,
  children,
  ...otherProps
}: ThemedViewProps) {
  const theme = useTheme();
  const backgroundColor = theme[type ?? 'background'];

  return (
    <div
      className={className}
      style={{ backgroundColor, ...style }}
      {...otherProps}
    >
      {children}
    </div>
  );
}
