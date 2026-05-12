import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD1YMJXwrL5RjyubYVQ5viVMmJMLkX-tSA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ischoolverse.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ischoolverse",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ischoolverse.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "825581312531",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:825581312531:web:e718df15b2382847757de6",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://ischoolverse.firebaseio.com",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Initialize Realtime Database (for real-time synchronization)
export const rtdb = getDatabase(app);
