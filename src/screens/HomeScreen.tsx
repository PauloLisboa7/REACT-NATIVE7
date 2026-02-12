import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Image,
  ScrollView,
  BackHandler,
  Modal,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { sendLocalNotification } from '../services/notificationService';
import { clearAllCache } from '../services/cacheService';
import { Language } from '../i18n/translations';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const { userData, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const [isPressed, setIsPressed] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const languageOptions: { label: string; value: Language }[] = [
    { label: 'Português', value: 'pt' },
    { label: 'English', value: 'en' },
    { label: 'Español', value: 'es' },
  ];

  useEffect(() => {
    console.log('HomeScreen montado');
    // Atualizar o nome do usuário quando userData mudar
    if (userData?.name) {
      // Extrai apenas o primeiro nome
      const primeiroNome = userData.name.split(' ')[0];
      setUserName(primeiroNome);
    }
    
    carregarConfiguracoes();
    
    return () => {
      console.log('HomeScreen desmontado');
    };
  }, [userData]);

  const carregarConfiguracoes = async () => {
    try {
      const notif = await AsyncStorage.getItem('notificationsEnabled');
      const offline = await AsyncStorage.getItem('offlineMode');
      if (notif !== null) setNotificationsEnabled(JSON.parse(notif));
      if (offline !== null) setOfflineMode(JSON.parse(offline));
    } catch (erro) {
      console.error('Erro ao carregar configurações:', erro);
    }
  };

  const atualizarNotificacoes = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(value));

    if (value) {
      await sendLocalNotification({
        title: 'Notificações Ativadas',
        body: 'Você receberá notificações de agora em diante',
      });
    }
  };

  const atualizarOfflineMode = async (value: boolean) => {
    setOfflineMode(value);
    await AsyncStorage.setItem('offlineMode', JSON.stringify(value));

    if (value) {
      await sendLocalNotification({
        title: t('screens.settings.title'),
        body: t('messages.syncData'),
      });
    }
  };

  const limparCache = async () => {
    Alert.alert(
      'Limpar Cache',
      'Tem certeza que deseja limpar o cache? Isso removerá dados armazenados localmente.',
      [
        { text: t('common.cancel'), onPress: () => {} },
        {
          text: 'Limpar',
          onPress: async () => {
            try {
              console.log('Limpando cache...');
              await clearAllCache();
              Alert.alert('Sucesso', 'Cache limpo com sucesso!');
            } catch (erro: any) {
              console.error('Erro ao limpar cache:', erro);
              Alert.alert('Erro', erro.message || 'Erro ao limpar cache');
            }
          },
        },
      ]
    );
  };

  const mudarIdioma = useCallback(async (novoIdioma: Language) => {
    try {
      await setLanguage(novoIdioma);
      await sendLocalNotification({
        title: 'Idioma alterado',
        body: `Idioma alterado para ${novoIdioma}`,
      });
    } catch (erro) {
      console.error('Erro ao alterar idioma:', erro);
    }
  }, [setLanguage]);

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
        {/* Header controls: back arrow + settings */}
        <View style={styles.themeToggleContainer}>
          <TouchableOpacity
            style={[styles.themeToggleButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={async () => {
              try {
                await logout();
              } catch (err) {
                console.error('Erro ao voltar para login:', err);
              }
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.themeToggleButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={() => setSettingsModalVisible(true)}
          >
            <MaterialCommunityIcons 
              name="cog" 
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
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('screens.home.manageUsers')}</Text>
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonsContainer}>
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
              <Text style={styles.buttonTitle}>{t('screens.home.registeredUsers')}</Text>
              <Text style={styles.buttonSubtitle}>{t('screens.home.viewList')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonAbout,
              isPressed === 'details' && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate('Details')}
            onPressIn={() => handlePressIn('details')}
            onPressOut={handlePressOut}
            activeOpacity={0.7}
          >
            <View style={styles.buttonIconWrapper}>
              <MaterialCommunityIcons name="information" size={32} color={colors.danger} />
            </View>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>{t('screens.settings.aboutApp')}</Text>
            </View>
          </TouchableOpacity>

          {/* Login button removed — use top-left back arrow to return to Login */}
        </View>
      </ScrollView>

      {/* Modal de Configurações */}
      <Modal
        visible={settingsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t('screens.settings.title')}
              </Text>
              <TouchableOpacity
                onPress={() => setSettingsModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Tema */}
              <View style={[styles.settingSection, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('screens.settings.appearance')}
                </Text>

                <View style={styles.settingItem}>
                  <View style={styles.settingContent}>
                    <MaterialCommunityIcons
                      name={isDark ? 'moon-waning-crescent' : 'white-balance-sunny'}
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      {t('screens.settings.darkMode')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={toggleTheme}
                    style={[styles.toggleButton, { backgroundColor: colors.primary }]}
                  >
                    <MaterialCommunityIcons
                      name={isDark ? 'moon-waning-crescent' : 'white-balance-sunny'}
                      size={16}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Notificações */}
              <View style={[styles.settingSection, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('screens.settings.notifications')}
                </Text>

                <View style={styles.settingItem}>
                  <View style={styles.settingContent}>
                    <MaterialCommunityIcons
                      name="bell"
                      size={20}
                      color={notificationsEnabled ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      {t('screens.settings.enableNotifications')}
                    </Text>
                  </View>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={atualizarNotificacoes}
                    thumbColor={notificationsEnabled ? colors.primary : colors.border}
                    trackColor={{ false: colors.border, true: colors.primaryLight }}
                  />
                </View>
              </View>

              {/* Idioma */}
              <View style={[styles.settingSection, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('common.language')}
                </Text>

                <View style={styles.languageOptions}>
                  {languageOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.languageOption,
                        language === option.value && {
                          backgroundColor: colors.primaryLight,
                        },
                        { borderBottomColor: colors.border },
                      ]}
                      onPress={() => mudarIdioma(option.value)}
                    >
                      <Text
                        style={[
                          styles.languageOptionText,
                          {
                            color: language === option.value ? colors.primary : colors.text,
                            fontWeight: language === option.value ? '600' : '500',
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                      {language === option.value && (
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={24}
                          color={colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Armazenamento */}
              <View style={[styles.settingSection, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('screens.settings.storage')}
                </Text>

                <View style={styles.settingItem}>
                  <View style={styles.settingContent}>
                    <MaterialCommunityIcons
                      name="wifi-off"
                      size={20}
                      color={offlineMode ? colors.warning : colors.textSecondary}
                    />
                    <View style={styles.settingTextContainer}>
                      <Text style={[styles.settingLabel, { color: colors.text }]}>
                        {t('screens.settings.offlineMode')}
                      </Text>
                      <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                        {t('screens.settings.offlineModeDesc')}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={offlineMode}
                    onValueChange={atualizarOfflineMode}
                    thumbColor={offlineMode ? colors.warning : colors.border}
                    trackColor={{ false: colors.border, true: colors.primaryLight }}
                  />
                </View>

                <TouchableOpacity style={styles.settingItem} onPress={limparCache}>
                  <View style={styles.settingContent}>
                    <MaterialCommunityIcons
                      name="delete"
                      size={20}
                      color={colors.danger}
                    />
                    <View style={styles.settingTextContainer}>
                      <Text style={[styles.settingLabel, { color: colors.text }]}>
                        {t('screens.settings.clearCache')}
                      </Text>
                      <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                        {t('screens.settings.clearCacheDesc')}
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Sobre */}
              <View style={[styles.settingSection, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('screens.settings.about')}
                </Text>

                <View style={styles.aboutItem}>
                  <Text style={[styles.aboutLabel, { color: colors.text }]}>
                    Nome do App
                  </Text>
                  <Text style={[styles.aboutValue, { color: colors.textSecondary }]}>
                    REACT-NATIVE7
                  </Text>
                </View>

                <View style={styles.aboutItem}>
                  <Text style={[styles.aboutLabel, { color: colors.text }]}>
                    Versão
                  </Text>
                  <Text style={[styles.aboutValue, { color: colors.textSecondary }]}>
                    1.0.0
                  </Text>
                </View>

                <View style={styles.aboutItem}>
                  <Text style={[styles.aboutLabel, { color: colors.text }]}>
                    Desenvolvedor
                  </Text>
                  <Text style={[styles.aboutValue, { color: colors.textSecondary }]}>
                    Paulo Lisboa
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
      width: '100%',
      paddingHorizontal: spacing.md,
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
    buttonAbout: {
      borderLeftWidth: 4,
      borderLeftColor: colors.danger,
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
    // Modal Styles
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: spacing.md,
      maxHeight: '80%',
    },
    modalScrollContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.lg,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
    },
    closeButton: {
      padding: spacing.sm,
    },
    settingSection: {
      marginTop: spacing.md,
      borderRadius: 12,
      padding: spacing.md,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: spacing.md,
      textTransform: 'uppercase',
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },
    settingTextContainer: {
      flex: 1,
    },
    settingLabel: {
      fontSize: 16,
      fontWeight: '500',
    },
    settingDescription: {
      fontSize: 13,
      fontWeight: '400',
      marginTop: spacing.xs,
    },
    toggleButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    languageOptions: {
      borderRadius: 8,
      overflow: 'hidden',
    },
    languageOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
    },
    languageOptionText: {
      fontSize: 16,
    },
    aboutItem: {
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    aboutLabel: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: spacing.xs,
    },
    aboutValue: {
      fontSize: 16,
      fontWeight: '600',
    },
  });
