import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebaseConfig';

const AVATARS_FOLDER = 'avatars';

/**
 * Faz upload do avatar do usuário
 */
export const uploadUserAvatar = async (
  uid: string,
  imageUri: string
): Promise<string> => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const storageRef = ref(storage, `${AVATARS_FOLDER}/${uid}`);
    await uploadBytes(storageRef, blob);

    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error: any) {
    throw new Error(`Erro ao fazer upload de avatar: ${error.message}`);
  }
};

/**
 * Deleta o avatar do usuário
 */
export const deleteUserAvatar = async (uid: string): Promise<void> => {
  try {
    const storageRef = ref(storage, `${AVATARS_FOLDER}/${uid}`);
    await deleteObject(storageRef);
  } catch (error: any) {
    // Silenciosamente ignora se o arquivo não existe
    if (error.code !== 'storage/object-not-found') {
      throw new Error(`Erro ao deletar avatar: ${error.message}`);
    }
  }
};

/**
 * Obtém a URL do avatar do usuário
 */
export const getUserAvatarUrl = async (uid: string): Promise<string | null> => {
  try {
    const storageRef = ref(storage, `${AVATARS_FOLDER}/${uid}`);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      return null;
    }
    throw new Error(`Erro ao buscar avatar: ${error.message}`);
  }
};
