import {
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  type User
} from 'firebase/auth';
import { getFirebaseAuth, assertFirebaseConfigured } from './firebase';

const getAuthInstance = () => {
  assertFirebaseConfigured();

  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Nao foi possivel inicializar o Firebase Auth.');
  }

  return auth;
};

export const firebaseAuthService = {
  registerWithEmail: async (email: string, password: string, displayName?: string) => {
    const auth = getAuthInstance();
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
      await updateProfile(credential.user, { displayName });
    }

    return credential.user;
  },

  loginWithEmail: async (email: string, password: string) => {
    const auth = getAuthInstance();
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  },

  loginWithGoogle: async () => {
    const auth = getAuthInstance();
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    return credential.user;
  },

  logout: async () => {
    const auth = getAuthInstance();
    await signOut(auth);
  },

  updateUserProfile: async (user: User, data: { name?: string; avatar_url?: string }) => {
    await updateProfile(user, {
      displayName: data.name ?? user.displayName ?? undefined,
      photoURL: data.avatar_url ?? user.photoURL ?? undefined
    });
  },

  changePassword: async (email: string, currentPassword: string, newPassword: string) => {
    const auth = getAuthInstance();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('Nenhum usuario autenticado para alterar a senha.');
    }

    const credential = EmailAuthProvider.credential(email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  },

  observeAuthState: (callback: (user: User | null) => void) => {
    const auth = getAuthInstance();
    return onAuthStateChanged(auth, callback);
  }
};
