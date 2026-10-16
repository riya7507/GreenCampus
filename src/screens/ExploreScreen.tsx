import { ExternalLink as LucideExternalLink } from 'lucide-react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import { WebBadge } from '@/components/WebBadge';

export function ExploreScreen() {
  return (
    <div className="flex flex-col items-center justify-center w-full px-4 py-6">
      <div className="w-full max-w-[800px] flex flex-col gap-6">
        {/* Title Container */}
        <div className="flex flex-col items-center gap-3 text-center py-6">
          <ThemedText type="subtitle">Explore</ThemedText>
          <ThemedText themeColor="textSecondary" className="text-center max-w-md">
            This starter app includes example code to help you get started.
          </ThemedText>

          <ExternalLink
            href="https://docs.expo.dev"
            className="mt-2"
          >
            <ThemedView
              type="backgroundElement"
              className="flex items-center gap-2 px-5 py-2 rounded-full border border-black/5 dark:border-white/10 hover:opacity-85 transition-opacity"
            >
              <ThemedText type="link" className="font-medium">
                Expo documentation
              </ThemedText>
              <LucideExternalLink size={12} className="opacity-70" />
            </ThemedView>
          </ExternalLink>
        </div>

        {/* Sections Wrapper */}
        <div className="flex flex-col gap-4 px-2 sm:px-6">
          <Collapsible title="File-based routing" defaultOpen={true}>
            <p className="text-[14px] leading-relaxed">
              This app has two screens:{' '}
              <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/15 font-mono text-[12px]">
                src/app/index.tsx
              </code>{' '}
              and{' '}
              <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/15 font-mono text-[12px]">
                src/app/explore.tsx
              </code>
            </p>
            <p className="text-[14px] leading-relaxed">
              The layout file in{' '}
              <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/15 font-mono text-[12px]">
                src/app/_layout.tsx
              </code>{' '}
              sets up the tab navigator.
            </p>
            <ExternalLink href="https://docs.expo.dev/router/introduction">
              <ThemedText type="linkPrimary">Learn more</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Android, iOS, and web support">
            <p className="text-[14px] leading-relaxed">
              You can open this project on Android, iOS, and the web. In AI Studio, the application runs directly in the responsive web preview on port 3000.
            </p>
            <div className="w-full mt-2 overflow-hidden rounded-[12px] border border-black/10 dark:border-white/10">
              <img
                src="/assets/images/tutorial-web.png"
                alt="Web Tutorial"
                className="w-full object-cover rounded-[12px]"
              />
            </div>
          </Collapsible>

          <Collapsible title="Images">
            <p className="text-[14px] leading-relaxed">
              For static images, you can use the{' '}
              <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/15 font-mono text-[12px]">
                @2x
              </code>{' '}
              and{' '}
              <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/15 font-mono text-[12px]">
                @3x
              </code>{' '}
              suffixes to provide files for different screen densities.
            </p>
            <div className="flex justify-center py-2">
              <img
                src="/assets/images/react-logo.png"
                alt="React Logo"
                className="w-[100px] h-[100px] object-contain"
              />
            </div>
            <ExternalLink href="https://reactnative.dev/docs/images">
              <ThemedText type="linkPrimary">Learn more</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Light and dark mode components">
            <p className="text-[14px] leading-relaxed">
              This template has light and dark mode support. The{' '}
              <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/15 font-mono text-[12px]">
                useColorScheme()
              </code>{' '}
              hook lets you inspect what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
            </p>
            <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
              <ThemedText type="linkPrimary">Learn more</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Animations">
            <p className="text-[14px] leading-relaxed">
              This template includes animated components. Opening these hints triggers smooth transitions and animations that run smoothly on modern web and mobile devices.
            </p>
          </Collapsible>
        </div>

        {/* Web Badge */}
        <WebBadge />
      </div>
    </div>
  );
}
