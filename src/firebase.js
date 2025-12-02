// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { 
  getFirestore, 
  FieldValue, 
  serverTimestamp,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  where,
} from "firebase/firestore";

// ⬇️ Replace with your config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCcngqt6esZNLn9-XSSaMigKcfM7y_71Bs",
  authDomain: "login-function-d3a97.firebaseapp.com",
  projectId: "login-function-d3a97",
  appId: "1:133868860731:web:b8c7e7399d2e64779ff31e",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

const db = getFirestore(app);

export { app, auth, db, FieldValue, serverTimestamp, collection, addDoc, onSnapshot, query, orderBy, getDocs, where, onAuthStateChanged };
