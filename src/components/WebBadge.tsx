import { ThemedText } from './ThemedText';
import { useAppColorScheme } from '@/context/ThemeContext';

export function WebBadge() {
  const { colorScheme } = useAppColorScheme();

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-2">
      <ThemedText type="code" themeColor="textSecondary" className="text-center">
        v52.0.0
      </ThemedText>
      <img
        src={
          colorScheme === 'dark'
            ? '/assets/images/expo-badge-white.png'
            : '/assets/images/expo-badge.png'
        }
        alt="Expo Badge"
        className="w-[123px] h-[24px] object-contain select-none"
      />
    </div>
  );
}
