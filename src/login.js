// /src/login.js
import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { ensureUserStats } from "./userStats.js";

// DOM References
const form = document.querySelector(".login-form");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const signoutBtn = document.getElementById("signout-btn");
const msg = document.getElementById("msg");

// Helpers
function setBusy(busy) {
  if (!loginBtn) return;
  loginBtn.disabled = busy;
  loginBtn.textContent = busy ? "Logging in…" : "LOGIN";
}

function prettyError(err) {
  const map = {
    "auth/invalid-email": "Please enter a valid email.",
    "auth/missing-email": "Email is required.",
    "auth/missing-password": "Password is required.",
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/email-already-in-use": "That email is already registered.",
    "auth/weak-password": "Use at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Try again shortly.",
  };
  return map[err?.code] || err?.message || "Something went wrong.";
}

// Authentication State
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (signoutBtn) signoutBtn.style.display = "inline-block";
    if (msg) msg.textContent = `Logged in as ${user.email}`;
  } else {
    if (signoutBtn) signoutBtn.style.display = "none";
    if (msg) msg.textContent = "Not signed in";
  }
});

// Sign In
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  setBusy(true);
  try {
    const email = (emailEl?.value || "").trim();
    const pass = passwordEl?.value || "";

    if (!email) throw { code: "auth/missing-email" };
    if (!pass) throw { code: "auth/missing-password" };

    await signInWithEmailAndPassword(auth, email, pass);
    if (msg) msg.textContent = "Signed in!";
    // go to main after successful login
    window.location.href = "/main.html";
  } catch (err) {
    if (msg) msg.textContent = prettyError(err);
  } finally {
    setBusy(false);
  }
});

// Create Account (Sprint 2 added to go to new page here)
signupBtn?.addEventListener("click", () => {
  window.location.href = "/signup.html";
});

// Sign Out
signoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  if (msg) msg.textContent = "Signed out";
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    await ensureUserStats(user);
    // then load pages etc.
  }
});
