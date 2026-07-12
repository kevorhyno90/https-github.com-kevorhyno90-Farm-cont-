import { initializeApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCw6SULwl9xwLkgAw4Ls-R-DvESldXxFts",
  authDomain: "dairy-farm-app-b95a9.firebaseapp.com",
  databaseURL: "https://dairy-farm-app-b95a9-default-rtdb.firebaseio.com",
  projectId: "dairy-farm-app-b95a9",
  storageBucket: "dairy-farm-app-b95a9.firebasestorage.app",
  messagingSenderId: "461702776121",
  appId: "1:461702776121:web:2d48859517758da0c9d4e8",
  measurementId: "G-P2ZS9GZ4HK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const isFirestoreSyncEnabled = String(import.meta.env.VITE_ENABLE_FIRESTORE_SYNC || '').toLowerCase() === 'true';
let db: Firestore | null = null;
if (isFirestoreSyncEnabled) {
  try {
    db = getFirestore(app);
  } catch (error) {
    console.warn('[Firebase] Firestore init failed. Cloud sync will be disabled.', error);
    db = null;
  }
}
const realtimeDb = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, realtimeDb, auth, googleProvider, isFirestoreSyncEnabled };
