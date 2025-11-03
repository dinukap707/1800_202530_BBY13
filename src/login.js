// /src/login.js
import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

// --- DOM references ---
const form = document.querySelector(".login-form");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const signoutBtn = document.getElementById("signout-btn");
const msg = document.getElementById("msg");

// --- Helpers ---
function setBusy(busy) {
  if (!loginBtn || !signupBtn) return;
  loginBtn.disabled = busy;
  signupBtn.disabled = busy;
  loginBtn.textContent = busy ? "Logging in…" : "LOGIN";
  signupBtn.textContent = busy ? "Creating…" : "CREATE ACCOUNT";
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

// --- Auth state ---
// Simply updates status text; no auto redirect
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (signoutBtn) signoutBtn.style.display = "inline-block";
    if (msg) msg.textContent = `Logged in as ${user.email}`;
  } else {
    if (signoutBtn) signoutBtn.style.display = "none";
    if (msg) msg.textContent = "Not signed in";
  }
});

// --- Sign in ---
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
    // ✅ redirect only after a successful login button click
    window.location.href = "/main.html";
  } catch (err) {
    if (msg) msg.textContent = prettyError(err);
  } finally {
    setBusy(false);
  }
});

// --- Create account ---
signupBtn?.addEventListener("click", async () => {
  setBusy(true);
  try {
    const email = (emailEl?.value || "").trim();
    const pass = passwordEl?.value || "";

    if (!email) throw { code: "auth/missing-email" };
    if (!pass) throw { code: "auth/missing-password" };

    await createUserWithEmailAndPassword(auth, email, pass);
    if (msg) msg.textContent = "Account created & signed in!";
    // ✅ redirect to main after creating account
    window.location.href = "/main.html";
  } catch (err) {
    if (msg) msg.textContent = prettyError(err);
  } finally {
    setBusy(false);
  }
});

// --- Sign out ---
// This is used on your settings page: it signs out and returns to login.
signoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  if (msg) msg.textContent = "Signed out";
  // return to login screen
  window.location.href = "/index.html";
});
