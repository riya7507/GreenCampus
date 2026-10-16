import { ExternalLink as LucideExternalLink, Sun, Moon } from 'lucide-react';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { ExternalLink } from './ExternalLink';
import { useAppColorScheme } from '@/context/ThemeContext';

interface AppTabsProps {
  currentTab: 'home' | 'explore';
  onSelectTab: (tab: 'home' | 'explore') => void;
}

export function AppTabs({ currentTab, onSelectTab }: AppTabsProps) {
  const { colorScheme, toggleTheme } = useAppColorScheme();

  return (
    <header className="sticky top-0 z-50 w-full flex justify-center px-4 py-3 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-[800px] flex items-center justify-between">
        <ThemedView
          type="backgroundElement"
          className="w-full flex items-center justify-between px-5 py-2.5 rounded-full shadow-sm border border-black/5 dark:border-white/10 backdrop-blur-md"
        >
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0274df]" />
            <ThemedText type="smallBold" className="tracking-tight">
              Expo Starter
            </ThemedText>
          </div>

          {/* Navigation Items */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onSelectTab('home')}
              className={`cursor-pointer px-3 py-1 rounded-[10px] transition-all text-[14px] font-medium ${
                currentTab === 'home'
                  ? 'bg-black/10 dark:bg-white/15 font-semibold'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-75 hover:opacity-100'
              }`}
            >
              <ThemedText
                type="small"
                themeColor={currentTab === 'home' ? 'text' : 'textSecondary'}
              >
                Home
              </ThemedText>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('explore')}
              className={`cursor-pointer px-3 py-1 rounded-[10px] transition-all text-[14px] font-medium ${
                currentTab === 'explore'
                  ? 'bg-black/10 dark:bg-white/15 font-semibold'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-75 hover:opacity-100'
              }`}
            >
              <ThemedText
                type="small"
                themeColor={currentTab === 'explore' ? 'text' : 'textSecondary'}
              >
                Explore
              </ThemedText>
            </button>

            {/* Docs External Link */}
            <ExternalLink
              href="https://docs.expo.dev"
              className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-[10px] hover:bg-black/5 dark:hover:bg-white/5"
            >
              <ThemedText type="link">Docs</ThemedText>
              <LucideExternalLink size={12} className="opacity-70" />
            </ExternalLink>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="cursor-pointer ml-1 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title={colorScheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {colorScheme === 'dark' ? (
                <Sun size={15} className="text-amber-400" />
              ) : (
                <Moon size={15} className="text-gray-600" />
              )}
            </button>
          </nav>
        </ThemedView>
      </div>
    </header>
  );
}
