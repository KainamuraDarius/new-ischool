export { app, auth, db, storage, rtdb } from './config';
export { signUp, signIn, signInWithGoogle, logOut, auth as firebaseAuth } from './auth';
export type { FirebaseUser, FirebaseAuthError } from './auth';
