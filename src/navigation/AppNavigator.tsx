import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthChange, AuthUser } from '../services/authService';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { colors } from '../config/theme';

/**
 * AppNavigator - Navegação Principal
 * 
 * Gerencia a alternância entre as rotas públicas (AuthStack) e privadas (AppStack)
 * baseado no estado de autenticação do usuário.
 * 
 * Funcionalidade:
 * 1. Escuta o estado de autenticação com onAuthStateChanged
 * 2. Durante a verificação inicial, exibe um loading
 * 3. Se autenticado: mostra AppStack (rotas privadas)
 * 4. Se não autenticado: mostra AuthStack (rotas públicas)
 * 5. A navegação é automática - sem necessidade de redirecionamentos manuais
 */
export default function AppNavigator() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * useEffect: Configurar listener de autenticação
   * 
   * - Ao montar o componente, inicia o listener de autenticação
   * - onAuthChange dispara o callback quando o estado de autenticação muda
   * - isLoading = true durante a verificação inicial (Firebase precisa checar o Firebase Auth)
   * - isLoading = false após a primeira mudança (usuário autenticado ou não)
   * - O componente é desmontado, o listener é desinstalado
   */
  useEffect(() => {
    console.log('🎯 AppNavigator montado - Iniciando verificação de autenticação');
    
    const unsubscribe = onAuthChange((authUser) => {
      console.log(
        authUser 
          ? `✅ Usuário autenticado: ${authUser.email}`
          : '❌ Nenhum usuário autenticado'
      );
      setUser(authUser);
      setIsLoading(false);
    });

    // Após 3 segundos, se ainda estiver loading, marca como false
    // (em caso de timeout ou erro silencioso)
    const timeoutId = setTimeout(() => {
      console.log('⏱️ Timeout de autenticação - definindo isLoading como false');
      setIsLoading(false);
    }, 3000);

    return () => {
      console.log('🎯 AppNavigator desmontado - Removendo listener de autenticação');
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  /**
   * Loading Screen
   * 
   * Exibida durante a verificação inicial de autenticação.
   * Evita flashes de telas incorretas enquanto o Firebase verifica a sessão.
   */
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.light }}>
        <ActivityIndicator 
          size="large" 
          color={colors.primary}
          testID="auth-loading-indicator"
        />
      </View>
    );
  }

  /**
   * Navegação Condicional
   * 
   * Se user está definido: usuário autenticado → AppStack
   * Se user é null: usuário não autenticado → AuthStack
   */
  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
