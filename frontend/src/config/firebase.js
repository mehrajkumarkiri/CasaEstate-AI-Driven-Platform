import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDLwfZQzWDPoB4jK2cOjs4VU2we682Jgt0",
  authDomain: "thanush-1db85.firebaseapp.com",
  projectId: "thanush-1db85",
  storageBucket: "thanush-1db85.appspot.com",
  messagingSenderId: "1005349606914",
  appId: "1:1005349606914:web:cc9d59adbd3f269961791b",
  measurementId: "G-MCHYYK93XG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
