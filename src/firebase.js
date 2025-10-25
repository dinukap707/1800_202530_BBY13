// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

// ⬇️ Replace with your config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCcngqt6esZNLn9-XSSaMigKcfM7y_71Bs",
  authDomain: "login-function-d3a97.firebaseapp.com",
  projectId: "login-function-d3a97",
  appId: "1:133868860731:web:b8c7e7399d2e64779ff31e",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const auth = getAuth(app);
// Keep users signed in across reloads (change to session if you prefer)
await setPersistence(auth, browserLocalPersistence);

export { app, auth };
