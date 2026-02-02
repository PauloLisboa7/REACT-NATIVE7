import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserData } from './firebaseFirestoreService';
import { ActivityLog } from './firebaseActivityService';

const CACHE_KEYS = {
  USERS: 'cached_users',
  ACTIVITIES: 'cached_activities',
  SYNC_QUEUE: 'sync_queue',
  LAST_SYNC: 'last_sync_timestamp',
};

interface SyncQueueItem {
  action: 'create' | 'update' | 'delete' | 'favorite';
  data: any;
  timestamp: string;
}

/**
 * Salva usuários em cache
 */
export const cacheUsers = async (users: UserData[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.USERS, JSON.stringify(users));
    await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
  } catch (error) {
    console.error('Erro ao cachear usuários:', error);
  }
};

/**
 * Recupera usuários do cache
 */
export const getCachedUsers = async (): Promise<UserData[] | null> => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.USERS);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Erro ao recuperar usuários em cache:', error);
    return null;
  }
};

/**
 * Salva atividades em cache
 */
export const cacheActivities = async (activities: ActivityLog[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.ACTIVITIES, JSON.stringify(activities));
  } catch (error) {
    console.error('Erro ao cachear atividades:', error);
  }
};

/**
 * Recupera atividades do cache
 */
export const getCachedActivities = async (): Promise<ActivityLog[] | null> => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.ACTIVITIES);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Erro ao recuperar atividades em cache:', error);
    return null;
  }
};

/**
 * Adiciona uma ação à fila de sincronização (para quando voltar online)
 */
export const addToSyncQueue = async (item: SyncQueueItem): Promise<void> => {
  try {
    const queue = await AsyncStorage.getItem(CACHE_KEYS.SYNC_QUEUE);
    const syncQueue: SyncQueueItem[] = queue ? JSON.parse(queue) : [];
    
    syncQueue.push(item);
    await AsyncStorage.setItem(CACHE_KEYS.SYNC_QUEUE, JSON.stringify(syncQueue));
  } catch (error) {
    console.error('Erro ao adicionar à fila de sincronização:', error);
  }
};

/**
 * Recupera a fila de sincronização
 */
export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  try {
    const queue = await AsyncStorage.getItem(CACHE_KEYS.SYNC_QUEUE);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error('Erro ao recuperar fila de sincronização:', error);
    return [];
  }
};

/**
 * Limpa a fila de sincronização
 */
export const clearSyncQueue = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CACHE_KEYS.SYNC_QUEUE);
  } catch (error) {
    console.error('Erro ao limpar fila de sincronização:', error);
  }
};

/**
 * Obtém timestamp do último sincronismo
 */
export const getLastSyncTime = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
  } catch (error) {
    console.error('Erro ao obter timestamp de sincronismo:', error);
    return null;
  }
};

/**
 * Limpa todo o cache
 */
export const clearAllCache = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      CACHE_KEYS.USERS,
      CACHE_KEYS.ACTIVITIES,
      CACHE_KEYS.SYNC_QUEUE,
      CACHE_KEYS.LAST_SYNC,
    ]);
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
  }
};
