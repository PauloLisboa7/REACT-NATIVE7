import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Image,
  ScrollView,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const { userData } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [isPressed, setIsPressed] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    console.log('HomeScreen montado');
    // Atualizar o nome do usuário quando userData mudar
    if (userData?.name) {
      // Extrai apenas o primeiro nome
      const primeiroNome = userData.name.split(' ')[0];
      setUserName(primeiroNome);
    }
    return () => {
      console.log('HomeScreen desmontado');
    };
  }, [userData]);

  const handlePressIn = (id: string) => {
    setIsPressed(id);
  };

  const handlePressOut = () => {
    setIsPressed(null);
  };

  const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  };

  const styles = createStyles(colors, spacing);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme Toggle Button */}
        <View style={styles.themeToggleContainer}>
          <TouchableOpacity
            style={[styles.themeToggleButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={toggleTheme}
          >
            <MaterialCommunityIcons 
              name={isDark ? "white-balance-sunny" : "moon-waning-crescent"} 
              size={24} 
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Header Section */}
        <View style={styles.headerSection}>
          <Image
            source={require('../../assets/logopaulo.png')}
            style={styles.logo}
          />
          <Text style={[styles.title, { color: colors.text }]}>{t('screens.home.welcome')}, {userName || 'Usuário'}!</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('screens.home.welcome')}</Text>
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonRegister,
              isPressed === 'register' && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate('Register')}
            onPressIn={() => handlePressIn('register')}
            onPressOut={handlePressOut}
            activeOpacity={0.7}
          >
            <View style={styles.buttonIconWrapper}>
              <MaterialCommunityIcons name="file-document-plus" size={32} color="#6366F1" />
            </View>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>{t('screens.register.title')}</Text>
              <Text style={styles.buttonSubtitle}>{t('common.loading')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonList,
              isPressed === 'list' && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate('List')}
            onPressIn={() => handlePressIn('list')}
            onPressOut={handlePressOut}
            activeOpacity={0.7}
          >
            <View style={styles.buttonIconWrapper}>
              <MaterialCommunityIcons name="account-multiple" size={32} color="#10B981" />
            </View>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Cadastrados</Text>
              <Text style={styles.buttonSubtitle}>Ver lista</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonLogin,
              isPressed === 'login' && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate('Login')}
            onPressIn={() => handlePressIn('login')}
            onPressOut={handlePressOut}
            activeOpacity={0.7}
          >
            <View style={styles.buttonIconWrapper}>
              <MaterialCommunityIcons name="lock" size={32} color="#F59E0B" />
            </View>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Login</Text>
              <Text style={styles.buttonSubtitle}>Acessar conta</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, spacing: any) => 
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.lg,
    },
    themeToggleContainer: {
      alignItems: 'flex-end',
      marginBottom: spacing.md,
    },
    themeToggleButton: {
      width: 50,
      height: 50,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerSection: {
      alignItems: 'center',
      marginBottom: spacing.xxl,
      marginTop: spacing.lg,
    },
    logo: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: spacing.lg,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '400',
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    buttonsContainer: {
      gap: spacing.md,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.lg,
      borderRadius: 16,
      backgroundColor: colors.surface,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    buttonPressed: {
      shadowOpacity: 0.15,
      elevation: 5,
      transform: [{ scale: 0.98 }],
    },
    buttonRegister: {
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    buttonList: {
      borderLeftWidth: 4,
      borderLeftColor: colors.success,
    },
    buttonLogin: {
      borderLeftWidth: 4,
      borderLeftColor: colors.warning,
    },
    buttonIconWrapper: {
      width: 56,
      height: 56,
      borderRadius: 12,
      backgroundColor: colors.surfaceSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    buttonContent: {
      flex: 1,
    },
    buttonTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    buttonSubtitle: {
      fontSize: 13,
      fontWeight: '400',
      color: colors.textSecondary,
    },
  });
