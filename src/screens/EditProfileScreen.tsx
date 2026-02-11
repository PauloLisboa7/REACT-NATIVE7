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
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { updateUser } from '../services/firebaseFirestoreService';
import { useFormValidation } from '../hooks';

export default function EditProfileScreen({ navigation }: any) {
  const { user, userData, logout } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { validateName, validateAge, clearAllErrors, getError } = useFormValidation();

  const [nome, setNome] = useState(userData?.name || '');
  const [age, setAge] = useState(userData?.age?.toString() || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setNome(userData.name || '');
      setAge(userData.age?.toString() || '');
    }
  }, [userData]);

  const handleSaveProfile = async () => {
    clearAllErrors();

    if (!validateName(nome) || !validateAge(age)) {
      return;
    }

    if (!user) {
      Alert.alert(t('common.error'), t('screens.editProfile.notAuthenticated'));
      return;
    }

    setLoading(true);

    try {
      const ageNum = parseInt(age, 10);
      await updateUser(user.uid, {
        name: nome,
        age: ageNum,
      });

      Alert.alert(t('common.success'), t('screens.editProfile.updated'));
      navigation.goBack();
    } catch (error: any) {
      const message = error.message || t('screens.editProfile.error');
      Alert.alert(t('common.error'), message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      t('screens.editProfile.confirmLogout'),
      t('screens.editProfile.logoutMessage'),
      [
        { text: t('common.cancel'), onPress: () => {}, style: 'cancel' },
        {
          text: t('screens.editProfile.logout'),
              onPress: async () => {
            	try {
            		setLoading(true);
            		await logout();
            		// Navegação será controlada pelo listener de autenticação
            	} catch (error: any) {
              Alert.alert(t('common.error'), t('screens.editProfile.errorLogout'));
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
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
          {/* User Info Header */}
          <View style={styles.headerContainer}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
              <MaterialCommunityIcons name="account" size={56} color={colors.primary} />
            </View>
            <Text style={[styles.emailText, { color: colors.textSecondary }]}>{user?.email}</Text>
          </View>

          {/* Edit Form */}
          <View style={styles.formContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Editar Perfil</Text>

            {/* Nome */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Nome Completo</Text>
              <View style={[styles.inputWrapper, { borderColor: getError('name') ? colors.danger : colors.border, backgroundColor: colors.surface }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Seu nome"
                  placeholderTextColor={colors.textSecondary}
                  value={nome}
                  onChangeText={setNome}
                  editable={!loading}
                  autoCorrect={false}
                  spellCheck={false}
                />
                
                {nome && !getError('name') && (
                  <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} style={styles.inputIcon} />
                )}
              </View>
              {getError('name') && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{getError('name')}</Text>
              )}
            </View>

            {/* Idade */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Idade</Text>
              <View style={[styles.inputWrapper, { borderColor: getError('age') ? colors.danger : colors.border, backgroundColor: colors.surface }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Sua idade"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                  editable={!loading}
                  autoCorrect={false}
                  spellCheck={false}
                />
                {age && !getError('age') && (
                  <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} style={styles.inputIcon} />
                )}
              </View>
              {getError('age') && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{getError('age')}</Text>
              )}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, { backgroundColor: colors.primary, shadowColor: colors.primary }, loading && styles.buttonDisabled]}
              onPress={handleSaveProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="content-save" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Salvar Alterações</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Logout Button */}
            <TouchableOpacity
              style={[styles.button, styles.dangerButton, { backgroundColor: colors.danger, shadowColor: colors.danger }, loading && styles.buttonDisabled]}
              onPress={handleLogout}
              disabled={loading}
            >
              <>
                <MaterialCommunityIcons name="logout" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Sair da Conta</Text>
              </>
            </TouchableOpacity>
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
      paddingVertical: 20,
    },
    avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emailText: {
      fontSize: 16,
      fontWeight: '500',
      textAlign: 'center',
    },
    formContainer: {
      marginBottom: 32,
      gap: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 16,
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
      marginTop: 8,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
      gap: 8,
    },
    primaryButton: {},
    dangerButton: {},
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
  });
}
