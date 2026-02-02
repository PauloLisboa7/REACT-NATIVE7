import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  Query,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const USERS_COLLECTION = 'users';

export interface UserData extends DocumentData {
  uid: string;
  email: string;
  name: string;
  age: number;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cria um novo usuário no Firestore
 */
export const createUser = async (uid: string, userData: Omit<UserData, 'uid' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    const now = new Date().toISOString();
    const docRef = doc(db, USERS_COLLECTION, uid);
    
    await setDoc(docRef, {
      ...userData,
      uid,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error: any) {
    throw new Error(`Erro ao criar usuário: ${error.message}`);
  }
};

/**
 * Atualiza um usuário existente
 */
export const updateUser = async (uid: string, userData: Partial<UserData>): Promise<void> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    
    await updateDoc(docRef, {
      ...userData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    throw new Error(`Erro ao atualizar usuário: ${error.message}`);
  }
};

/**
 * Deleta um usuário
 */
export const deleteUser = async (uid: string): Promise<void> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await deleteDoc(docRef);
  } catch (error: any) {
    throw new Error(`Erro ao deletar usuário: ${error.message}`);
  }
};

/**
 * Obtém um usuário pelo UID
 */
export const getUser = async (uid: string): Promise<UserData | null> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as UserData;
      return {
        ...data,
        uid: docSnap.id, // Adiciona o uid do documento
      };
    }
    return null;
  } catch (error: any) {
    throw new Error(`Erro ao buscar usuário: ${error.message}`);
  }
};

/**
 * Obtém todos os usuários
 */
export const getAllUsers = async (): Promise<UserData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const users: UserData[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as UserData;
      users.push({
        ...data,
        uid: doc.id, // Adiciona o uid do documento
      });
    });
    
    return users;
  } catch (error: any) {
    throw new Error(`Erro ao buscar usuários: ${error.message}`);
  }
};

/**
 * Busca usuários por email ou nome
 */
export const searchUsers = async (searchTerm: string): Promise<UserData[]> => {
  try {
    // Nota: Firestore não possui busca full-text nativa. 
    // Para aplicações reais, considere usar Algolia ou Elasticsearch
    const allUsers = await getAllUsers();
    
    return allUsers.filter(
      user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error: any) {
    throw new Error(`Erro ao buscar usuários: ${error.message}`);
  }
};

/**
 * Verifica se um email já existe no banco
 */
export const emailExists = async (email: string): Promise<boolean> => {
  try {
    const allUsers = await getAllUsers();
    return allUsers.some(user => user.email.toLowerCase() === email.toLowerCase());
  } catch (error: any) {
    throw new Error(`Erro ao verificar email: ${error.message}`);
  }
};
