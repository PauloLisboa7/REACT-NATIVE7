import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const ACTIVITIES_COLLECTION = 'activities';

export interface ActivityLog extends DocumentData {
  id: string;
  userId: string;
  actionType: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'favorite' | 'permission';
  targetUserId?: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
}

/**
 * Registra uma atividade no histórico
 */
export const logActivity = async (
  userId: string,
  actionType: ActivityLog['actionType'],
  description: string,
  targetUserId?: string
): Promise<void> => {
  try {
    const now = new Date().toISOString();
    
    await addDoc(collection(db, ACTIVITIES_COLLECTION), {
      userId,
      actionType,
      targetUserId,
      description,
      timestamp: now,
    });
  } catch (error: any) {
    console.error('Erro ao registrar atividade:', error);
  }
};

/**
 * Obtém histórico de atividades de um usuário
 */
export const getUserActivities = async (userId: string): Promise<ActivityLog[]> => {
  try {
    const q = query(
      collection(db, ACTIVITIES_COLLECTION),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ActivityLog));
  } catch (error: any) {
    throw new Error(`Erro ao buscar atividades: ${error.message}`);
  }
};

/**
 * Obtém todas as atividades (admin)
 */
export const getAllActivities = async (): Promise<ActivityLog[]> => {
  try {
    const q = query(
      collection(db, ACTIVITIES_COLLECTION),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ActivityLog));
  } catch (error: any) {
    throw new Error(`Erro ao buscar atividades: ${error.message}`);
  }
};

/**
 * Obtém atividades por tipo de ação
 */
export const getActivitiesByType = async (actionType: ActivityLog['actionType']): Promise<ActivityLog[]> => {
  try {
    const q = query(
      collection(db, ACTIVITIES_COLLECTION),
      where('actionType', '==', actionType),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ActivityLog));
  } catch (error: any) {
    throw new Error(`Erro ao buscar atividades: ${error.message}`);
  }
};
