import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase config - using the existing tourism-development-d620c project
// These values are safe to expose in client-side code
const firebaseConfig = {
  apiKey: "AIzaSyD_oUwfnUATP48ah2K48AWSaNEYJLgoaW4",
  authDomain: "tourism-development-d620c.firebaseapp.com",
  projectId: "tourism-development-d620c",
  storageBucket: "tourism-development-d620c.firebasestorage.app",
  messagingSenderId: "371342128529",
  appId: "1:371342128529:web:85a53abe8896ed40839630",
  measurementId: "G-ZDTGSL20EQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;

