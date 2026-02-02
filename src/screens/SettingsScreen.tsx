import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  BackHandler,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { sendLocalNotification } from '../services/notificationService';
import { clearAllCache } from '../services/cacheService';
import { Language } from '../i18n/translations';

export default function SettingsScreen({ navigation }: any) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const languageOptions: { label: string; value: Language }[] = [
    { label: 'Português', value: 'pt' },
    { label: 'English', value: 'en' },
    { label: 'Español', value: 'es' },
  ];

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.popToTop();
      return true;
    });

    carregarConfiguracoes();

    return () => backHandler.remove();
  }, [navigation]);

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

  const mudarIdioma = async (novoIdioma: Language) => {
    try {
      await setLanguage(novoIdioma);
      setLanguageModalVisible(false);
      await sendLocalNotification({
        title: t('common.language'),
        body: 'Idioma alterado com sucesso',
      });
    } catch (erro) {
      Alert.alert(t('common.error'), 'Erro ao alterar idioma');
    }
  };

  const limparCache = async () => {
    Alert.alert(
      'Limpar Cache',
      'Tem certeza que deseja limpar o cache? Isso removerá dados armazenados localmente.',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Limpar',
          onPress: async () => {
            try {
              await clearAllCache();
              Alert.alert('Sucesso', 'Cache limpo com sucesso!');
            } catch (erro) {
              Alert.alert('Erro', 'Erro ao limpar cache');
            }
          },
        },
      ]
    );
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('screens.settings.title')}</Text>
        </View>

        {/* Tema */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('screens.settings.appearance')}</Text>

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
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('screens.settings.notifications')}</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <MaterialCommunityIcons
                name="bell"
                size={20}
                color={notificationsEnabled ? colors.primary : colors.textSecondary}
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {t('screens.settings.enableNotifications')}
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={atualizarNotificacoes}
              thumbColor={notificationsEnabled ? colors.primary : colors.border}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
            />
          </View>
        </View>

        {/* Armazenamento */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Armazenamento</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <MaterialCommunityIcons
                name="wifi-off"
                size={20}
                color={offlineMode ? colors.warning : colors.textSecondary}
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Modo Offline
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Usar dados em cache quando offline
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
                  Limpar Cache
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Remover dados armazenados localmente
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

        {/* Idioma */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('common.language')}</Text>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setLanguageModalVisible(true)}
          >
            <View style={styles.settingContent}>
              <MaterialCommunityIcons
                name="translate"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {languageOptions.find(opt => opt.value === language)?.label}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Sobre */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sobre</Text>

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

      {/* Modal de Seleção de Idioma */}
      <Modal
        visible={languageModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t('common.language')}
              </Text>
              <TouchableOpacity
                onPress={() => setLanguageModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

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
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
    },
    section: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      elevation: 2,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 12,
      textTransform: 'uppercase',
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    settingTextContainer: {
      flex: 1,
    },
    settingLabel: {
      fontSize: 16,
      fontWeight: '500',
    },
    settingDescription: {
      fontSize: 12,
      marginTop: 4,
    },
    toggleButton: {
      width: 40,
      height: 40,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    aboutItem: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    aboutLabel: {
      fontSize: 14,
      fontWeight: '500',
    },
    aboutValue: {
      fontSize: 14,
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 16,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
    },
    closeButton: {
      padding: 8,
    },
    languageOptions: {
      paddingVertical: 8,
    },
    languageOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
    },
    languageOptionText: {
      fontSize: 16,
    },
  });
}
