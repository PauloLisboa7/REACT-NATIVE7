import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';
import {
  signUp,
  login,
  logout,
  resetPassword,
  getCurrentUser,
  onAuthStateChangedListener,
} from '../services/firebaseAuthService';
import { createUser, getUser } from '../services/firebaseFirestoreService';
import { UserData } from '../services/firebaseFirestoreService';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Auth methods
  signUp: (email: string, password: string, name: string, age: number) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitora mudanças de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(async (authUser) => {
      setUser(authUser);

      if (authUser) {
        try {
          // Tenta carregar dados do usuário do Firestore
          const userDataFromDb = await getUser(authUser.uid);
          console.log('Dados do usuário carregados:', userDataFromDb);
          setUserData(userDataFromDb);
          
          // Salva o UID no AsyncStorage para referência
          await AsyncStorage.setItem('userId', authUser.uid);
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
        }
      } else {
        setUserData(null);
        await AsyncStorage.removeItem('userId');
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignUp = async (email: string, password: string, name: string, age: number) => {
    try {
      setLoading(true);
      
      // Cria conta no Firebase Auth
      const userCredential = await signUp(email, password);
      const uid = userCredential.user.uid;

      // Cria documento do usuário no Firestore
      await createUser(uid, {
        email,
        name,
        age,
      });

      // Salva o UID no AsyncStorage
      await AsyncStorage.setItem('userId', uid);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await login(email, password);
      
      // Salva o UID no AsyncStorage
      await AsyncStorage.setItem('userId', userCredential.user.uid);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      await AsyncStorage.removeItem('userId');
      setUser(null);
      setUserData(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await resetPassword(email);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userData,
    loading,
    isAuthenticated: !!user,
    signUp: handleSignUp,
    login: handleLogin,
    logout: handleLogout,
    resetPassword: handleResetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook para usar o contexto de autenticação
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
