import React from 'react';
import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export type ThemedTextProps = React.HTMLAttributes<HTMLSpanElement> & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
  className?: string;
  children?: React.ReactNode;
};

export function ThemedText({
  type = 'default',
  themeColor,
  className = '',
  style,
  children,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  const color = themeColor ? theme[themeColor] : theme.text;

  const typeStyles: Record<string, string> = {
    default: 'text-[16px] leading-[24px] font-medium',
    title: 'text-[42px] sm:text-[48px] font-semibold leading-[48px] sm:leading-[52px]',
    small: 'text-[14px] leading-[20px] font-medium',
    smallBold: 'text-[14px] leading-[20px] font-bold',
    subtitle: 'text-[28px] sm:text-[32px] leading-[38px] sm:leading-[44px] font-semibold',
    link: 'text-[14px] leading-[30px] font-medium hover:underline cursor-pointer',
    linkPrimary: 'text-[14px] leading-[30px] font-medium text-[#3c87f7] hover:underline cursor-pointer',
    code: 'font-mono text-[12px] font-medium',
  };

  return (
    <span
      className={`${typeStyles[type] || ''} ${className}`}
      style={{ color: type === 'linkPrimary' ? '#3c87f7' : color, ...style }}
      {...rest}
    >
      {children}
    </span>
  );
}
