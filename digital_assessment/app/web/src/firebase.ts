import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported as analyticsSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyD_oUwfnUATP48ah2K48AWSaNEYJLgoaW4',
  authDomain: 'tourism-development-d620c.firebaseapp.com',
  projectId: 'tourism-development-d620c',
  storageBucket: 'tourism-development-d620c.firebasestorage.app',
  messagingSenderId: '371342128529',
  appId: '1:371342128529:web:85a53abe8896ed40839630',
  measurementId: 'G-ZDTGSL20EQ'
};

export const firebaseApp = initializeApp(firebaseConfig);
export async function initAnalytics() {
  try {
    if (await analyticsSupported()) {
      return getAnalytics(firebaseApp);
    }
  } catch {
    // ignore if not supported (e.g., Node or unsupported browser)
  }
  return null;
}


