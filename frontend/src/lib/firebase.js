import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCSA2TZ8TUoR9VWlUmBwiA7eoCYEEn-fDY",
  authDomain: "shiftprint-86af3.firebaseapp.com",
  projectId: "shiftprint-86af3",
  storageBucket: "shiftprint-86af3.firebasestorage.app",
  messagingSenderId: "1040737361518",
  appId: "1:1040737361518:web:1d5ec9e1d44cf4d5d9907f",
  measurementId: "G-FFL4KM4QEY"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const auth = getAuth(app);
export default app;
