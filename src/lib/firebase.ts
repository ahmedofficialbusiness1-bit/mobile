// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, Timestamp } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "dirabiz",
  appId: "1:633275861020:web:c5ac777c3fd4fc5a2cb7d9",
  storageBucket: "dirabiz.firebasestorage.app",
  apiKey: "AIzaSyAZMNNvrYlfkBXBrcTDZpzkEJsqUrFzERs",
  authDomain: "dirabiz.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "633275861020",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, Timestamp };
