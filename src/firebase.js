// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeFirestore, persistentLocalCache, persistentSingleTabManager } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQpGT4ID89rPCikmbV-7NuSHKCtfwf62U",
  authDomain: "percegidb.firebaseapp.com",
  projectId: "percegidb",
  storageBucket: "percegidb.firebasestorage.app",
  messagingSenderId: "581615278667",
  appId: "1:581615278667:web:c171bc20c0e6b765bd4bce",
  measurementId: "G-QFR13KXG87"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Initialize Firestore with persistent local cache for offline-first performance
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentSingleTabManager() })
});
