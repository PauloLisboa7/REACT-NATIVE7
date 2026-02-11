import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import LoginScreen from '../screens/LoginScreen';

const Stack = createNativeStackNavigator();

/**
 * AppStack - Rotas Privadas
 * 
 * Contém todas as telas da aplicação principal (protegidas):
 * - Home: Tela inicial da aplicação autenticada
 * - Details: Tela de detalhes do aplicativo
 * - Login: Tela de login/logout com informações do usuário
 * 
 * Estas rotas são acessíveis apenas para usuários autenticados.
 * Se o usuário não estiver autenticado, será redirecionado para AuthStack.
 */
export default function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Início',
          animationEnabled: false,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen 
        name="Details" 
        component={DetailsScreen}
        options={{
          title: 'Detalhes',
        }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          title: 'Minha Conta',
        }}
      />
    </Stack.Navigator>
  );
}
