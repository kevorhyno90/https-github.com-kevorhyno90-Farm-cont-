import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCw6SULwl9xwLkgAw4Ls-R-DvESldXxFts",
  authDomain: "dairy-farm-app-b95a9.firebaseapp.com",
  projectId: "dairy-farm-app-b95a9",
  storageBucket: "dairy-farm-app-b95a9.firebasestorage.app",
  messagingSenderId: "461702776121",
  appId: "1:461702776121:web:2d48859517758da0c9d4e8",
  measurementId: "G-P2ZS9GZ4HK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);

export { db, realtimeDb };
