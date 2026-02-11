import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/RootNavigation';
import './src/config/firebaseConfig'; // Initialize Firebase

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <NavigationContainer ref={navigationRef}>
              <AppNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
