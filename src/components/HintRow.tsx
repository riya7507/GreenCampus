import React from 'react';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface HintRowProps {
  title?: string;
  hint?: React.ReactNode;
}

export function HintRow({ title = 'Try editing', hint = 'src/app/index.tsx' }: HintRowProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <ThemedText type="small">{title}</ThemedText>
      <ThemedView
        type="backgroundSelected"
        className="rounded-[8px] py-[2px] px-[8px] flex items-center justify-center"
      >
        <span className="text-[13px] font-mono select-all">
          {typeof hint === 'string' ? (
            <ThemedText themeColor="textSecondary" type="code">
              {hint}
            </ThemedText>
          ) : (
            hint
          )}
        </span>
      </ThemedView>
    </div>
  );
}
