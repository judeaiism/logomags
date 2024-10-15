import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID
};

// Add this check to ensure all required config values are present
const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
for (const key of requiredConfigKeys) {
  if (!firebaseConfig[key as keyof typeof firebaseConfig]) {
    console.error(`Missing Firebase config key: ${key}`);
    console.error('Current Firebase config:', firebaseConfig);
    throw new Error(`Missing Firebase config key: ${key}`);
  }
}

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);

if (process.env.NODE_ENV !== 'production') {
  console.log('Firebase Storage Bucket:', firebaseConfig.storageBucket);
}
