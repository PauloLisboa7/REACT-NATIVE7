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
import { useLanguage } from '../contexts/LanguageContext';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export default function DetailsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { userData } = useAuth();
  const { t } = useLanguage();
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
      t('screens.details.logoutConfirmTitle'),
      t('screens.details.logoutConfirmMessage'),
      [
        {
          text: t('common.cancel'),
          onPress: () => {},
        },
        {
          text: t('screens.details.logout'),
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.navigate('Home');
            } catch (erro) {
              Alert.alert(t('common.error'), t('screens.details.logoutError'));
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
          <Text style={[styles.title, { color: colors.text }]}>{t('screens.details.welcome')}, {userName || 'Usuário'}!</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('screens.details.youAreLoggedIn')}</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.buttonHome, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            onPress={() => navigation.navigate('Home')}
          >
            <MaterialCommunityIcons name="home" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>{t('screens.details.backToHome')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.buttonLogout, { backgroundColor: colors.danger, shadowColor: colors.danger }]}
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>{t('screens.details.logout')}</Text>
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
