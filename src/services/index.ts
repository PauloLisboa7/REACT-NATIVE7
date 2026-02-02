import { 
  signUp, 
  login, 
  logout, 
  resetPassword,
  getCurrentUser,
  UserCredential,
} from './firebaseAuthService';
import {
  createUser,
  updateUser,
  deleteUser,
  getUser,
  getAllUsers,
  searchUsers,
} from './firebaseFirestoreService';
import {
  uploadUserAvatar,
  deleteUserAvatar,
  getUserAvatarUrl,
} from './firebaseStorageService';

export {
  // Auth
  signUp,
  login,
  logout,
  resetPassword,
  getCurrentUser,
  // Firestore
  createUser,
  updateUser,
  deleteUser,
  getUser,
  getAllUsers,
  searchUsers,
  // Storage
  uploadUserAvatar,
  deleteUserAvatar,
  getUserAvatarUrl,
};

export type { UserCredential };
