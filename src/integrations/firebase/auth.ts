import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  Auth,
  AuthError,
} from 'firebase/auth';
import { auth } from './config';

export type FirebaseUser = User | null;

export interface FirebaseAuthError extends AuthError {
  message: string;
}

// Sign up with email and password
export const signUp = async (email: string, password: string, displayName?: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && userCredential.user) {
      // Note: Firebase doesn't have built-in display name update on signup
      // You'll need to update it separately or use custom claims
    }
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error as FirebaseAuthError };
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error as FirebaseAuthError };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error as FirebaseAuthError };
  }
};

// Sign out
export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error as FirebaseAuthError };
  }
};

// Get current auth instance
export { auth };
