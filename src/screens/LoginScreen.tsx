import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { logout, onAuthChange, AuthUser } from '../services/authService';
import { colors, spacing, fontSizes, responsiveScale, isWeb, screenWidth, isAndroid } from '../config/theme';

export default function LoginScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Verificar se há usuário autenticado ao montar
  useEffect(() => {
    console.log('📋 LoginScreen montada');
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      console.log('✅ Logout bem-sucedido');
      Alert.alert('Sucesso', 'Você foi desconectado');
      setUser(null);
    } catch (error: any) {
      const errorMsg = error?.message || 'Erro desconhecido';
      console.error('❌ Erro ao fazer logout:', errorMsg);
      Alert.alert('Erro', `Falha ao fazer logout: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="person" size={responsiveScale(40)} color={colors.white} />
          </View>
          <Text style={styles.title}>Bem-vindo! 👋</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.uid}>ID: {user.uid.substring(0, 12)}...</Text>

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <MaterialIcons name="logout" size={responsiveScale(20)} color={colors.white} />
                <Text style={styles.buttonText}>Desconectar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Se não há usuário, retorna empty (não acontece pois LoginScreen é privado)
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
    alignItems: isWeb ? 'center' : 'stretch',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: responsiveScale(10),
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    width: isWeb ? Math.min(500, screenWidth * 0.9) : isAndroid ? '100%' : '100%',
    alignSelf: isWeb ? 'center' : undefined,
  },
  iconContainer: {
    width: responsiveScale(50),
    height: responsiveScale(50),
    borderRadius: responsiveScale(25),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    textAlign: 'center',
    color: colors.text,
  },
  button: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: responsiveScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
    width: '100%',
  },
  logoutButton: {
    backgroundColor: '#8B0000',
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
  },
  email: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  uid: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontFamily: 'monospace',
  },
});
