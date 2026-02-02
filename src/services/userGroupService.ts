import { db } from '../config/firebaseConfig';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  getDoc,
} from 'firebase/firestore';

export interface UserGroup {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  members: string[]; // Array de UIDs dos membros
  color?: string;
}

/**
 * Criar um novo grupo de usuários
 */
export async function createGroup(
  name: string,
  description: string,
  createdBy: string,
  color?: string
): Promise<UserGroup> {
  try {
    const groupData = {
      name,
      description,
      createdBy,
      color: color || '#6366F1',
      members: [createdBy],
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    };

    const docRef = await addDoc(collection(db, 'groups'), groupData);

    return {
      id: docRef.id,
      ...groupData,
    };
  } catch (erro: any) {
    console.error('Erro ao criar grupo:', erro);
    throw erro;
  }
}

/**
 * Obter todos os grupos
 */
export async function getAllGroups(): Promise<UserGroup[]> {
  try {
    const snapshot = await getDocs(collection(db, 'groups'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as UserGroup[];
  } catch (erro: any) {
    console.error('Erro ao obter grupos:', erro);
    throw erro;
  }
}

/**
 * Obter grupo por ID
 */
export async function getGroupById(groupId: string): Promise<UserGroup | null> {
  try {
    const docSnap = await getDoc(doc(db, 'groups', groupId));
    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as UserGroup;
  } catch (erro: any) {
    console.error('Erro ao obter grupo:', erro);
    throw erro;
  }
}

/**
 * Obter grupos de um usuário
 */
export async function getUserGroups(userId: string): Promise<UserGroup[]> {
  try {
    const q = query(
      collection(db, 'groups'),
      where('members', 'array-contains', userId)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as UserGroup[];
  } catch (erro: any) {
    console.error('Erro ao obter grupos do usuário:', erro);
    throw erro;
  }
}

/**
 * Atualizar grupo
 */
export async function updateGroup(
  groupId: string,
  updates: Partial<UserGroup>
): Promise<void> {
  try {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      ...updates,
      updatedAt: new Date().getTime(),
    });
  } catch (erro: any) {
    console.error('Erro ao atualizar grupo:', erro);
    throw erro;
  }
}

/**
 * Adicionar membro ao grupo
 */
export async function addMemberToGroup(
  groupId: string,
  userId: string
): Promise<void> {
  try {
    const groupRef = doc(db, 'groups', groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      throw new Error('Grupo não encontrado');
    }

    const currentMembers = groupSnap.data().members || [];

    if (currentMembers.includes(userId)) {
      throw new Error('Usuário já é membro deste grupo');
    }

    await updateDoc(groupRef, {
      members: [...currentMembers, userId],
      updatedAt: new Date().getTime(),
    });
  } catch (erro: any) {
    console.error('Erro ao adicionar membro ao grupo:', erro);
    throw erro;
  }
}

/**
 * Remover membro do grupo
 */
export async function removeMemberFromGroup(
  groupId: string,
  userId: string
): Promise<void> {
  try {
    const groupRef = doc(db, 'groups', groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      throw new Error('Grupo não encontrado');
    }

    const currentMembers = groupSnap.data().members || [];
    const updatedMembers = currentMembers.filter((id: string) => id !== userId);

    await updateDoc(groupRef, {
      members: updatedMembers,
      updatedAt: new Date().getTime(),
    });
  } catch (erro: any) {
    console.error('Erro ao remover membro do grupo:', erro);
    throw erro;
  }
}

/**
 * Deletar grupo
 */
export async function deleteGroup(groupId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'groups', groupId));
  } catch (erro: any) {
    console.error('Erro ao deletar grupo:', erro);
    throw erro;
  }
}

/**
 * Obter membros de um grupo
 */
export async function getGroupMembers(groupId: string): Promise<string[]> {
  try {
    const groupSnap = await getDoc(doc(db, 'groups', groupId));

    if (!groupSnap.exists()) {
      throw new Error('Grupo não encontrado');
    }

    return groupSnap.data().members || [];
  } catch (erro: any) {
    console.error('Erro ao obter membros do grupo:', erro);
    throw erro;
  }
}

/**
 * Contar membros de um grupo
 */
export async function getGroupMemberCount(groupId: string): Promise<number> {
  try {
    const members = await getGroupMembers(groupId);
    return members.length;
  } catch (erro: any) {
    console.error('Erro ao contar membros do grupo:', erro);
    throw erro;
  }
}

/**
 * Verificar se usuário é membro de um grupo
 */
export async function isUserInGroup(
  groupId: string,
  userId: string
): Promise<boolean> {
  try {
    const members = await getGroupMembers(groupId);
    return members.includes(userId);
  } catch (erro: any) {
    console.error('Erro ao verificar membro do grupo:', erro);
    throw erro;
  }
}
