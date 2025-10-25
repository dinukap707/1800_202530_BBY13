// src/login.js
import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

const form = document.querySelector(".login-form");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const signoutBtn = document.getElementById("signout-btn");
const msg = document.getElementById("msg");

// Sign in (submit)
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, emailEl.value, passwordEl.value);
    msg.textContent = "Signed in!";
    // Optional: redirect after login
    // window.location.href = "/app.html";
  } catch (err) {
    msg.textContent = err.message;
  }
});

// Create account
signupBtn.addEventListener("click", async () => {
  try {
    await createUserWithEmailAndPassword(auth, emailEl.value, passwordEl.value);
    msg.textContent = "Account created & signed in!";
    // Optional: redirect
    // window.location.href = "/app.html";
  } catch (err) {
    msg.textContent = err.message;
  }
});

// Sign out
signoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

// React to auth state (show/hide sign out, status)
onAuthStateChanged(auth, (user) => {
  if (user) {
    signoutBtn.style.display = "inline-block";
    msg.textContent = `Logged in as ${user.email}`;
  } else {
    signoutBtn.style.display = "none";
    msg.textContent = "Not signed in";
  }
});
