import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { debugFirebaseConnection } from './src/services/debugFirebase';

/**
 * App - Componente Principal
 * 
 * Responsabilidades:
 * 1. Configurar o StatusBar
 * 2. Rodar diagnóstico do Firebase ao iniciar
 * 3. Renderizar o AppNavigator que gerencia a autenticação e navegação
 */
export default function App() {
  // Executar teste de conexão Firebase ao iniciar
  useEffect(() => {
    console.log('🚀 App iniciado - testando conexão com Firebase...');
    debugFirebaseConnection();
  }, []);

  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}
