import { useState } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppTabs } from '@/components/AppTabs';
import { HomeScreen } from '@/screens/HomeScreen';
import { ExploreScreen } from '@/screens/ExploreScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { RegisterScreen } from '@/screens/RegisterScreen';

type ScreenState = 'home' | 'explore' | 'login' | 'register';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('home');

  const handleTabSelect = (tab: 'home' | 'explore') => {
    setCurrentScreen(tab);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col transition-colors duration-200">
        {/* Only show top tabs when not in full-screen auth */}
        {currentScreen !== 'login' && currentScreen !== 'register' && (
          <AppTabs
            currentTab={currentScreen === 'explore' ? 'explore' : 'home'}
            onSelectTab={handleTabSelect}
          />
        )}

        <main className="flex-1 flex flex-col">
          {currentScreen === 'home' && (
            <HomeScreen
              onNavigateLogin={() => setCurrentScreen('login')}
              onNavigateRegister={() => setCurrentScreen('register')}
            />
          )}

          {currentScreen === 'login' && (
            <LoginScreen
              onBack={() => setCurrentScreen('home')}
              onNavigateRegister={() => setCurrentScreen('register')}
            />
          )}

          {currentScreen === 'register' && (
            <RegisterScreen
              onBack={() => setCurrentScreen('home')}
              onNavigateLogin={() => setCurrentScreen('login')}
            />
          )}

          {currentScreen === 'explore' && <ExploreScreen />}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
