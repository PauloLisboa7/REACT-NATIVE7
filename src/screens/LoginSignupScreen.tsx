import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { login } from '../services/authService';
import { theme, spacing, fontSizes, colors, responsiveScale, isWeb, screenWidth, isAndroid } from '../config/theme';

export default function LoginSignupScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    console.log('📋 LoginSignupScreen montada');
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Aviso', 'Preencha email e senha');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      // Aguarda o AppNavigator renderizar AppStack (após onAuthStateChanged dispara)
      // e então navega para Details
      setTimeout(() => {
        navigation.navigate('Details');
      }, 1000);
    } catch (error: any) {
      Alert.alert('Erro', error?.message || 'Falha ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (
    icon: React.ReactNode,
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    keyboardType: any = 'default',
    secureTextEntry: boolean = false,
    toggleSecure?: () => void
  ) => (
    <View style={styles.inputWrapper}>
      <View style={styles.inputIconContainer}>
        {icon}
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={!loading}
        placeholderTextColor={colors.textTertiary}
      />
      {toggleSecure && (
        <TouchableOpacity onPress={toggleSecure} style={styles.toggleButton}>
          <MaterialIcons
            name={secureTextEntry ? 'visibility-off' : 'visibility'}
            size={responsiveScale(16)}
            color={colors.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <View style={styles.headerContainer}>
          <MaterialIcons name="login" size={responsiveScale(40)} color={colors.primary} />
          <Text style={styles.title}>Fazer Login</Text>
          <Text style={styles.subtitle}>Autentique-se com suas credenciais</Text>
        </View>

        {renderInputField(
          <MaterialIcons name="email" size={responsiveScale(20)} color={colors.primary} />,
          'Email',
          email,
          setEmail,
          'email-address'
        )}

        {renderInputField(
          <MaterialIcons name="lock" size={responsiveScale(20)} color={colors.primary} />,
          'Senha',
          password,
          setPassword,
          'default',
          !showPassword,
          () => setShowPassword(!showPassword)
        )}

        {renderInputField(
          <MaterialIcons name="lock" size={responsiveScale(20)} color={colors.primary} />,
          'Confirmar Senha',
          confirmPassword,
          setConfirmPassword,
          'default',
          !showConfirmPassword,
          () => setShowConfirmPassword(!showConfirmPassword)
        )}

        <TouchableOpacity
          style={[styles.button, styles.loginButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <MaterialIcons name="login" size={responsiveScale(20)} color={colors.white} />
              <Text style={styles.buttonText}>Login</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <MaterialIcons name="arrow-back" size={responsiveScale(20)} color={colors.white} />
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.forgotPasswordButton}
          onPress={() => navigation.navigate('ForgotPassword')}
          disabled={loading}
        >
          <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Não tem conta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupLink}>Criar uma</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.light,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
    alignItems: isWeb ? 'center' : 'stretch',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: responsiveScale(10),
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    width: isWeb ? Math.min(500, screenWidth * 0.9) : '100%',
    alignSelf: isWeb ? 'center' : undefined,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    textAlign: 'center',
    color: colors.text,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: responsiveScale(6),
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
  },
  inputIconContainer: {
    marginRight: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.text,
  },
  toggleButton: {
    padding: spacing.xs,
  },
  button: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: responsiveScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
    width: '100%',
  },
  loginButton: {
    backgroundColor: colors.primary,
  },
  backButton: {
    backgroundColor: colors.textSecondary,
  },
  buttonDisabled: {
    backgroundColor: colors.textTertiary,
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  signupText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  signupLink: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: '600',
  },
});
