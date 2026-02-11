import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsSreen';
import ListScreen from '../screens/ListScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ActivityHistoryScreen from '../screens/ActivityHistoryScreen';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false, headerTitle: 'Início' }} />
      <Stack.Screen name="Details" component={DetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="List" component={ListScreen} options={{ headerTitle: 'Usuários' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerTitle: 'Editar Perfil' }} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false, headerTitle: 'Dashboard' }} />
      <Stack.Screen name="ActivityHistory" component={ActivityHistoryScreen} options={{ headerShown: false, headerTitle: 'Histórico' }} />
    </Stack.Navigator>
  );
}
