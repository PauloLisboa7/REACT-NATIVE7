import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { useAuth } from '../context/AuthContext';

export default function AppNavigator() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return isAuthenticated ? <AppStack /> : <AuthStack />;
}
