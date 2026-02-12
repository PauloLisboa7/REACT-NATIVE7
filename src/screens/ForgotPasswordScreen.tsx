import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useFormValidation } from '../hooks';

export default function ForgotPasswordScreen({ navigation }: any) {
  const { resetPassword } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { validateEmail, clearAllErrors, getError } = useFormValidation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);

  // Padrão para validar email com domínio completo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleResetPassword = async () => {
    clearAllErrors();

    if (!validateEmail(email)) {
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email);
      setEmailSent(true);
      Alert.alert(
        t('common.success'),
        t('screens.forgotPassword.successMessage')
      );
    } catch (error: any) {
      const message = error.message || t('screens.forgotPassword.error');
      Alert.alert(t('common.error'), message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={handleBackToLogin}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <MaterialCommunityIcons name="lock-reset" size={56} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>{t('screens.forgotPassword.title')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('screens.forgotPassword.subtitle')}
            </Text>
          </View>

          {emailSent ? (
            <View style={styles.successContainer}>
              <MaterialCommunityIcons 
                name="check-circle" 
                size={80} 
                color={colors.success} 
              />
              <Text style={[styles.successTitle, { color: colors.text }]}>{t('screens.forgotPassword.emailSent')}</Text>
              <Text style={[styles.successText, { color: colors.textSecondary }]}>
                {t('screens.forgotPassword.successMessage')}
              </Text>
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                onPress={handleBackToLogin}
              >
                <Text style={styles.buttonText}>{t('screens.forgotPassword.goBack')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{t('screens.login.email')}</Text>
                <View style={[styles.inputWrapper, { borderColor: getError('email') ? colors.danger : colors.border, backgroundColor: colors.surface }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="seu@email.com"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      // Valida apenas se tiver @ e . (domínio completo)
                      setIsEmailValid(emailRegex.test(text));
                    }}
                    autoCorrect={false}
                    spellCheck={false}
                  />
                  {isEmailValid && !getError('email') && (
                    <MaterialCommunityIcons 
                      name="check-circle" 
                      size={20} 
                      color={colors.success}
                      style={styles.inputIcon} 
                    />
                  )}
                </View>
                {getError('email') && (
                  <Text style={[styles.errorText, { color: colors.danger }]}>{getError('email')}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }, loading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons 
                      name="email-send" 
                      size={20} 
                      color="#fff" 
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>{t('screens.forgotPassword.sendLink')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
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
      paddingVertical: 20,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      textAlign: 'center',
      fontWeight: '400',
      lineHeight: 20,
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
    button: {
      flexDirection: 'row',
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
      gap: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
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
    successContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
    successTitle: {
      fontSize: 24,
      fontWeight: '700',
      marginTop: 16,
      marginBottom: 8,
    },
    successText: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 20,
    },
  });
}
