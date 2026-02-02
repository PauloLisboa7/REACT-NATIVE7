import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFormValidation } from '../hooks';
import { emailExists } from '../services/firebaseFirestoreService';
import { messages } from '../config/constants';

export default function RegisterScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const { colors } = useTheme();
  const { 
    validateEmail, 
    validatePassword, 
    validateName, 
    validateAge,
    clearAllErrors,
    getError 
  } = useFormValidation();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMismatchError, setPasswordMismatchError] = useState(false);
  const [emailDuplicateError, setEmailDuplicateError] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);

  // Padrão para validar email com domínio completo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.popToTop();
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  const handleRegister = async () => {
    clearAllErrors();
    setPasswordMismatchError(false);
    setEmailDuplicateError(false);

    // Validações básicas
    if (
      !validateName(nome) ||
      !validateEmail(email) ||
      !validateAge(age) ||
      !validatePassword(senha)
    ) {
      return;
    }

    // Validar se as senhas conferem
    if (senha !== confirmSenha) {
      setPasswordMismatchError(true);
      Alert.alert('Aviso', messages.auth.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      // Verificar se o email já existe
      const emailAlreadyExists = await emailExists(email);
      if (emailAlreadyExists) {
        setEmailDuplicateError(true);
        Alert.alert('Email já cadastrado', 'Este email já está registrado no sistema. Use outro email ou recupere sua senha.');
        setLoading(false);
        return;
      }

      const ageNum = parseInt(age, 10);
      await signUp(email, senha, nome, ageNum);
      
      Alert.alert('Sucesso', messages.auth.registerSuccess);
      navigation.navigate('Details');
    } catch (error: any) {
      const message = error.message || 'Erro ao realizar cadastro';
      Alert.alert('Erro no Cadastro', message);
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerContainer}>
            <MaterialCommunityIcons name="account-plus" size={56} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>Criar Conta</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Preencha os dados abaixo</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Nome */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Nome Completo</Text>
              <View style={[styles.inputWrapper, { borderColor: getError('name') ? colors.danger : colors.border, backgroundColor: colors.surface }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="João Silva"
                  placeholderTextColor={colors.textSecondary}
                  value={nome}
                  onChangeText={setNome}
                  editable={!loading}
                />
                {nome && !getError('name') && (
                  <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} style={styles.inputIcon} />
                )}
              </View>
              {getError('name') && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{getError('name')}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <View style={[styles.inputWrapper, emailDuplicateError && { borderColor: colors.danger }, { backgroundColor: colors.surface, borderColor: getError('email') ? colors.danger : colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="seu@email.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailDuplicateError(false);
                    // Valida apenas se tiver @ e . (domínio completo)
                    setIsEmailValid(emailRegex.test(text));
                  }}
                  editable={!loading}
                />
                {isEmailValid && !emailDuplicateError && (
                  <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} style={styles.inputIcon} />
                )}
                {emailDuplicateError && (
                  <MaterialCommunityIcons name="alert-circle" size={20} color={colors.danger} style={styles.inputIcon} />
                )}
              </View>
              {getError('email') && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{getError('email')}</Text>
              )}
              {emailDuplicateError && (
                <Text style={[styles.errorText, { color: colors.danger }]}>Email já cadastrado no sistema</Text>
              )}
            </View>

            {/* Idade */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Idade</Text>
              <View style={[styles.inputWrapper, { borderColor: getError('age') ? colors.danger : colors.border, backgroundColor: colors.surface }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="18"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                  editable={!loading}
                />
                {age && !getError('age') && (
                  <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} style={styles.inputIcon} />
                )}
              </View>
              {getError('age') && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{getError('age')}</Text>
              )}
            </View>

            {/* Senha */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Senha</Text>
              <View style={[styles.inputWrapper, { borderColor: getError('password') ? colors.danger : colors.border, backgroundColor: colors.surface }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPassword}
                  value={senha}
                  onChangeText={setSenha}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color={colors.primary}
                    style={styles.inputIcon}
                  />
                </TouchableOpacity>
              </View>
              {getError('password') && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{getError('password')}</Text>
              )}
            </View>

            {/* Confirmar Senha */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Confirmar Senha</Text>
              <View style={[styles.inputWrapper, passwordMismatchError && { borderColor: colors.danger }, { backgroundColor: colors.surface, borderColor: getError('password') ? colors.danger : colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmSenha}
                  onChangeText={(text) => {
                    setConfirmSenha(text);
                    setPasswordMismatchError(false);
                  }}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <MaterialCommunityIcons 
                    name={showConfirmPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color={colors.primary}
                    style={styles.inputIcon}
                  />
                </TouchableOpacity>
              </View>
              {passwordMismatchError && (
                <Text style={[styles.errorText, { color: colors.danger }]}>⚠️ As senhas não conferem</Text>
              )}
              {!passwordMismatchError && confirmSenha && senha === confirmSenha && (
                <Text style={[styles.successText, { color: colors.success }]}>✓ Senhas conferem</Text>
              )}
            </View>

            {/* Botão de Cadastro */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="account-plus" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Cadastrar</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Link para Login */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>Já tem conta?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.loginLink, { color: colors.primary }]}>Faça login aqui</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingVertical: 30,
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: 40,
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
    formContainer: {
      marginBottom: 32,
      gap: 16,
    },
    inputGroup: {
      marginBottom: 4,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      letterSpacing: 0.3,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderRadius: 12,
      paddingHorizontal: 12,
    },
    input: {
      flex: 1,
      paddingHorizontal: 4,
      paddingVertical: 14,
      fontSize: 16,
      fontWeight: '500',
    },
    inputIcon: {
      marginHorizontal: 8,
    },
    errorText: {
      fontSize: 12,
      marginTop: 4,
      fontWeight: '500',
    },
    successText: {
      fontSize: 12,
      marginTop: 4,
      fontWeight: '500',
    },
    button: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
      gap: 8,
    },
    buttonDisabled: {
      backgroundColor: colors.primaryLight,
      shadowOpacity: 0.1,
    },
    buttonIcon: {
      marginRight: 4,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    footer: {
      alignItems: 'center',
      gap: 4,
      marginTop: 16,
    },
    footerText: {
      fontSize: 14,
      fontWeight: '400',
    },
    loginLink: {
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
  });
}
