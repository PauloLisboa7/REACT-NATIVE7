import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  BackHandler,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getUserActivities } from '../services/firebaseActivityService';

interface Activity {
  id: string;
  userId: string;
  actionType: string;
  targetUserId?: string;
  description: string;
  timestamp: number;
  ipAddress?: string;
}

export default function ActivityHistoryScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    carregarAtividades();

    return () => backHandler.remove();
  }, [navigation, user]);

  const carregarAtividades = async () => {
    try {
      if (!user) return;
      setLoading(true);
      const data = await getUserActivities(user.uid);
      // Ordenar por timestamp decrescente (mais recentes primeiro)
      const ordenado = data.sort((a, b) => b.timestamp - a.timestamp);
      setActivities(ordenado);
    } catch (erro) {
      console.error('Erro ao carregar atividades:', erro);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarAtividades();
    setRefreshing(false);
  };

  const getActivityIcon = (actionType: string): string => {
    const iconMap: Record<string, string> = {
      create: 'plus-circle',
      update: 'pencil-circle',
      delete: 'delete-circle',
      login: 'login',
      logout: 'logout',
      export: 'download',
      favorite: 'heart',
      permission: 'shield',
    };
    return iconMap[actionType] || 'information';
  };

  const getActivityColor = (actionType: string): string => {
    const colorMap: Record<string, string> = {
      create: colors.success,
      update: colors.primary,
      delete: colors.danger,
      login: colors.success,
      logout: colors.warning,
      export: colors.primary,
      favorite: colors.danger,
      permission: colors.warning,
    };
    return colorMap[actionType] || colors.textSecondary;
  };

  const getActivityLabel = (actionType: string): string => {
    const labelMap: Record<string, string> = {
      create: 'Criado',
      update: 'Atualizado',
      delete: 'Deletado',
      login: 'Login',
      logout: 'Logout',
      export: 'Exportado',
      favorite: 'Favoritado',
      permission: 'Permissão',
    };
    return labelMap[actionType] || actionType;
  };

  const formatarData = (timestamp: number): string => {
    const data = new Date(timestamp);
    const agora = new Date();
    const diferenca = agora.getTime() - data.getTime();

    // Segundos
    const segundos = Math.floor(diferenca / 1000);
    if (segundos < 60) return `há ${segundos}s`;

    // Minutos
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `há ${minutos}m`;

    // Horas
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `há ${horas}h`;

    // Dias
    const dias = Math.floor(horas / 24);
    if (dias < 7) return `há ${dias}d`;

    // Data completa
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderActivityItem = ({ item }: { item: Activity }) => (
    <View style={[styles.activityCard, { backgroundColor: colors.surface }]}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={getActivityIcon(item.actionType)}
          size={24}
          color={getActivityColor(item.actionType)}
        />
      </View>

      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={[styles.activityType, { color: colors.text }]}>
            {getActivityLabel(item.actionType)}
          </Text>
          <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
            {formatarData(item.timestamp)}
          </Text>
        </View>

        <Text
          style={[styles.activityDescription, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      </View>

      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={colors.border}
      />
    </View>
  );

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Histórico de Atividades
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <MaterialCommunityIcons
            name="loading"
            size={40}
            color={colors.primary}
          />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Carregando...
          </Text>
        </View>
      ) : activities.length === 0 ? (
        <View style={styles.centerContent}>
          <MaterialCommunityIcons
            name="history"
            size={60}
            color={colors.border}
          />
          <Text
            style={[styles.emptyText, { color: colors.textSecondary }]}
          >
            Nenhuma atividade registrada
          </Text>
        </View>
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivityItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      flex: 1,
      textAlign: 'center',
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      marginTop: 12,
      fontWeight: '500',
    },
    emptyText: {
      fontSize: 16,
      marginTop: 12,
      fontWeight: '500',
    },
    listContent: {
      padding: 16,
      gap: 12,
    },
    activityCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 16,
      borderRadius: 12,
      elevation: 2,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      gap: 12,
    },
    iconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    activityContent: {
      flex: 1,
    },
    activityHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    activityType: {
      fontSize: 16,
      fontWeight: '600',
    },
    activityTime: {
      fontSize: 12,
    },
    activityDescription: {
      fontSize: 13,
    },
  });
}
