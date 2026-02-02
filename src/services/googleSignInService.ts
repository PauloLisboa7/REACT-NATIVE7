import * as Google from 'expo-auth-session/providers/google';
import * as SecureStore from 'expo-secure-store';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth, db } from '../config/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Configurar o provedor Google
const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // Substituir com seu client ID
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
});

export interface GoogleSignInResponse {
  success: boolean;
  user?: any;
  error?: string;
}

/**
 * Trata a resposta de autenticação do Google
 */
export async function handleGoogleSignInResponse(
  response: any
): Promise<GoogleSignInResponse> {
  try {
    if (response?.type === 'success') {
      const { id_token } = response.params;

      // Criar credencial Firebase com o token do Google
      const credential = GoogleAuthProvider.credential(id_token);

      // Fazer login no Firebase
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Armazenar token de forma segura
      await SecureStore.setItemAsync('googleToken', id_token);

      // Verificar se o usuário é novo e criar documento Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        // Novo usuário - criar documento
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          name: user.displayName || 'Usuário',
          avatar: user.photoURL || null,
          age: null,
          role: 'user',
          isFavorite: false,
          twoFactorEnabled: false,
          twoFactorPhone: null,
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime(),
          provider: 'google',
        });
      } else {
        // Usuário existente - atualizar último acesso
        await setDoc(
          doc(db, 'users', user.uid),
          {
            updatedAt: new Date().getTime(),
            avatar: user.photoURL || userDoc.data().avatar,
            name: user.displayName || userDoc.data().name,
          },
          { merge: true }
        );
      }

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          avatar: user.photoURL,
        },
      };
    } else {
      return {
        success: false,
        error: 'Login do Google foi cancelado',
      };
    }
  } catch (erro: any) {
    console.error('Erro ao fazer Google Sign-In:', erro);
    return {
      success: false,
      error: erro.message || 'Erro ao fazer login com Google',
    };
  }
}

/**
 * Faz o Google Sign-In chamando o prompt
 */
export async function signInWithGoogle(): Promise<GoogleSignInResponse> {
  try {
    // Chamar o prompt de autenticação do Google
    const result = await promptAsync();

    if (result?.type === 'success') {
      return await handleGoogleSignInResponse(result);
    } else {
      return {
        success: false,
        error: 'Autenticação do Google foi cancelada',
      };
    }
  } catch (erro: any) {
    console.error('Erro ao iniciar Google Sign-In:', erro);
    return {
      success: false,
      error: erro.message || 'Erro ao iniciar login com Google',
    };
  }
}

/**
 * Fazer logout do Google
 */
export async function signOutGoogle(): Promise<void> {
  try {
    // Remover token armazenado
    await SecureStore.deleteItemAsync('googleToken');

    // Fazer logout do Firebase
    await firebaseSignOut(auth);
  } catch (erro) {
    console.error('Erro ao fazer logout do Google:', erro);
    throw erro;
  }
}

/**
 * Obter o token Google armazenado
 */
export async function getGoogleToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('googleToken');
  } catch (erro) {
    console.error('Erro ao obter token Google:', erro);
    return null;
  }
}

/**
 * Obter o provedor Google para uso em componentes
 */
export { request, response, promptAsync };
