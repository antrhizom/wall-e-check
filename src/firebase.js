import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBd8Ul-Ex4Z2ufo8V-lb_7ox5SYVefAmjw",
  authDomain: "maurercheck.firebaseapp.com",
  projectId: "maurercheck",
  storageBucket: "maurercheck.firebasestorage.app",
  messagingSenderId: "309003950622",
  appId: "1:309003950622:web:ff794fcbac0258df5dac0f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
