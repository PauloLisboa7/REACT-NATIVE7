import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getAllUsers } from '../services/firebaseFirestoreService';
import { getAllActivities } from '../services/firebaseActivityService';
import { UserData } from '../services/firebaseFirestoreService';
import { ActivityLog } from '../services/firebaseActivityService';

export default function DashboardScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.popToTop();
      return true;
    });

    carregarDados();

    return () => backHandler.remove();
  }, [navigation]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const usuariosData = await getAllUsers();
      const atividadesData = await getAllActivities();

      setUsers(usuariosData);
      setActivities(atividadesData.slice(0, 10)); // Últimas 10 atividades
    } catch (erro) {
      console.error('Erro ao carregar dados:', erro);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (users.length === 0) {
      return { admins: 0, moderators: 0, users: 0, avgAge: 0 };
    }

    const admins = users.filter(u => u.role === 'admin').length;
    const moderators = users.filter(u => u.role === 'moderator').length;
    const commonUsers = users.filter(u => !u.role || u.role === 'user').length;
    const avgAge =
      users.reduce((sum, u) => sum + u.age, 0) / users.length;

    return {
      admins,
      moderators,
      users: commonUsers,
      avgAge: avgAge.toFixed(1),
    };
  };

  const stats = calculateStats();

  const styles = createStyles(colors);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Dashboard</Text>
          <TouchableOpacity onPress={carregarDados}>
            <MaterialCommunityIcons name="refresh" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          {/* Total Users */}
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons
              name="account-multiple"
              size={32}
              color={colors.primary}
            />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {users.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total de Usuários
            </Text>
          </View>

          {/* Admins */}
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons
              name="shield-account"
              size={32}
              color={colors.warning}
            />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.admins}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Administradores
            </Text>
          </View>

          {/* Moderators */}
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons
              name="badge-account"
              size={32}
              color={colors.success}
            />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.moderators}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Moderadores
            </Text>
          </View>

          {/* Avg Age */}
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons
              name="chart-line"
              size={32}
              color={colors.primaryLight}
            />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.avgAge}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Idade Média
            </Text>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Atividades Recentes
          </Text>

          {activities.length > 0 ? (
            <View>
              {activities.map((activity) => (
                <View
                  key={activity.id}
                  style={[styles.activityItem, { backgroundColor: colors.surfaceSecondary }]}
                >
                  <MaterialCommunityIcons
                    name={getActivityIcon(activity.actionType)}
                    size={20}
                    color={getActivityColor(activity.actionType, colors)}
                  />
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityText, { color: colors.text }]}>
                      {activity.description}
                    </Text>
                    <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
                      {new Date(activity.timestamp).toLocaleTimeString('pt-BR')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhuma atividade registrada
            </Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Ações Rápidas
          </Text>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('List')}
          >
            <MaterialCommunityIcons name="account-multiple" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Ver Usuários</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={() => navigation.navigate('Register')}
          >
            <MaterialCommunityIcons name="account-plus" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Novo Cadastro</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getActivityIcon(actionType: string): string {
  const icons: Record<string, string> = {
    create: 'plus-circle',
    update: 'pencil-circle',
    delete: 'trash-can',
    login: 'login',
    logout: 'logout',
    export: 'download',
    favorite: 'heart',
    permission: 'shield-check',
  };
  return icons[actionType] || 'information';
}

function getActivityColor(actionType: string, colors: any): string {
  const colorMap: Record<string, string> = {
    create: colors.success,
    update: colors.primary,
    delete: colors.danger,
    login: colors.primary,
    logout: colors.textSecondary,
    export: colors.success,
    favorite: colors.danger,
    permission: colors.warning,
  };
  return colorMap[actionType] || colors.textSecondary;
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 24,
    },
    statCard: {
      width: '48%',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      gap: 8,
      elevation: 2,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
    },
    statLabel: {
      fontSize: 12,
      textAlign: 'center',
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 12,
    },
    activityItem: {
      flexDirection: 'row',
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      alignItems: 'center',
      gap: 12,
    },
    activityContent: {
      flex: 1,
    },
    activityText: {
      fontSize: 14,
      fontWeight: '500',
    },
    activityTime: {
      fontSize: 12,
      marginTop: 4,
    },
    emptyText: {
      fontSize: 14,
      textAlign: 'center',
      padding: 16,
    },
    actionButton: {
      flexDirection: 'row',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      gap: 12,
      marginBottom: 8,
    },
    actionButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });
}
