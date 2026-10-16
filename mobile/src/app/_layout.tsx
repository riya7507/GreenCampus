import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider } from '@/contexts/auth-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AnimatedSplashOverlay />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="leaderboard" />
          <Stack.Screen name="badges" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="resourcecare/index" />
          <Stack.Screen name="resourcecare/create" />
          <Stack.Screen name="resourcecare/[id]" />
          <Stack.Screen name="resourcecare/my-reports" />
          <Stack.Screen name="greenshare/index" />
          <Stack.Screen name="greenshare/create" />
          <Stack.Screen name="greenshare/[id]" />
          <Stack.Screen name="greenshare/requests" />
          <Stack.Screen name="greenshare/my-items" />
          <Stack.Screen name="admin/index" />
          <Stack.Screen name="admin/resourcecare" />
          <Stack.Screen name="admin/greenshare" />
          <Stack.Screen name="admin/users" />
          <Stack.Screen name="admin/impact" />
          <Stack.Screen name="admin/profile" />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
