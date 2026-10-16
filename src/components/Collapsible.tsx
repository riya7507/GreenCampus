import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useTheme } from '@/context/ThemeContext';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Collapsible({ title, children, defaultOpen = false }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const theme = useTheme();

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 text-left w-full cursor-pointer py-1 group select-none transition-opacity hover:opacity-80 active:opacity-70 focus:outline-none"
      >
        <ThemedView
          type="backgroundElement"
          className="w-6 h-6 rounded-full flex items-center justify-center transition-transform shrink-0"
        >
          <ChevronRight
            size={14}
            color={theme.text}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'}`}
          />
        </ThemedView>
        <ThemedText type="small" className="font-medium group-hover:underline">
          {title}
        </ThemedText>
      </button>

      {isOpen && (
        <div className="mt-3 ml-4 animate-in fade-in duration-200">
          <ThemedView
            type="backgroundElement"
            className="rounded-[16px] p-4 text-[14px] flex flex-col gap-3"
          >
            {children}
          </ThemedView>
        </div>
      )}
    </div>
  );
}
