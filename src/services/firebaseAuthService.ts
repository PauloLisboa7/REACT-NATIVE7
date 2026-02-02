import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  UserCredential as FirebaseUserCredential,
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export type UserCredential = FirebaseUserCredential;

/**
 * Registra um novo usuário com email e senha
 */
export const signUp = async (
  email: string,
  password: string
): Promise<FirebaseUserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error: any) {
    throw handleAuthError(error);
  }
};

/**
 * Realiza login com email e senha
 */
export const login = async (
  email: string,
  password: string
): Promise<FirebaseUserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error: any) {
    throw handleAuthError(error);
  }
};

/**
 * Realiza logout
 */
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw handleAuthError(error);
  }
};

/**
 * Envia email de reset de senha
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw handleAuthError(error);
  }
};

/**
 * Obtém o usuário atualmente logado
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Verifica se a senha do usuário está correta
 */
export const verifyPassword = async (
  email: string,
  password: string
): Promise<boolean> => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return true;
  } catch (error: any) {
    if (error.code === 'auth/wrong-password') {
      return false;
    }
    throw handleAuthError(error);
  }
};

/**
 * Observa mudanças no estado de autenticação
 */
export const onAuthStateChangedListener = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Trata erros de autenticação do Firebase
 */
const handleAuthError = (error: any): Error => {
  let message = 'Erro ao processar autenticação';

  if (error.code) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'Este email já está cadastrado';
        break;
      case 'auth/invalid-email':
        message = 'Email inválido';
        break;
      case 'auth/weak-password':
        message = 'Senha fraca. Use pelo menos 6 caracteres';
        break;
      case 'auth/user-not-found':
        message = 'Usuário não encontrado';
        break;
      case 'auth/wrong-password':
        message = 'Senha incorreta';
        break;
      case 'auth/too-many-requests':
        message = 'Muitas tentativas. Tente mais tarde';
        break;
      default:
        message = error.message || message;
    }
  }

  const authError = new Error(message);
  (authError as any).code = error.code;
  return authError;
};
