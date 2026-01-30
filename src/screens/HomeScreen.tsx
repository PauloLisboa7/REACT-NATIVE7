import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Design System
const colors = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#1F2937',
  textLight: '#6B7280',
  border: '#E5E7EB',
  shadow: '#000000',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export default function HomeScreen({ navigation }: any) {
  const [isPressed, setIsPressed] = useState<string | null>(null);

  useEffect(() => {
    console.log('HomeScreen montado');
    return () => {
      console.log('HomeScreen desmontado');
    };
  }, []);

  const handlePressIn = (id: string) => {
    setIsPressed(id);
  };

  const handlePressOut = () => {
    setIsPressed(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Image
            source={require('../../assets/logopaulo.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>Bem-vindo!</Text>
          <Text style={styles.subtitle}>Gerencie seus cadastros com facilidade</Text>
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
              <Text style={styles.buttonTitle}>Cadastro</Text>
              <Text style={styles.buttonSubtitle}>Novo usuário</Text>
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

const styles = StyleSheet.create({
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
    color: colors.textLight,
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
    backgroundColor: colors.background,
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
    color: colors.textLight,
  },
});
