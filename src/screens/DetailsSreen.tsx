import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export default function DetailsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { userData } = useAuth();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    console.log('DetailsScreen montado');
    if (userData?.name) {
      setUserName(userData.name);
    }
    return () => {
      console.log('DetailsScreen desmontado');
    };
  }, [userData]);

  const handleLogout = async () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja fazer logout?',
      [
        {
          text: 'Cancelar',
          onPress: () => {},
        },
        {
          text: 'Sair',
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.navigate('Home');
            } catch (erro) {
              Alert.alert('Erro', 'Não foi possível fazer logout');
              console.error(erro);
            }
          },
        },
      ]
    );
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.headerContainer}>
          <MaterialCommunityIcons name="check-circle" size={56} color={colors.success} />
          <Text style={[styles.title, { color: colors.text }]}>Bem-vindo, {userName || 'Usuário'}!</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Você está logado no sistema</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.buttonHome, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            onPress={() => navigation.navigate('Home')}
          >
            <MaterialCommunityIcons name="home" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Voltar para Início</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.buttonLogout, { backgroundColor: colors.danger, shadowColor: colors.danger }]}
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Fazer Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    container: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 40,
      justifyContent: 'center',
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: 60,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      textAlign: 'center',
      fontWeight: '400',
    },
    buttonsContainer: {
      gap: 16,
    },
    buttonHome: {
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonLogout: {
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.5,
      marginLeft: 8,
    },
  });
}
