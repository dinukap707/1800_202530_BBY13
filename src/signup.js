// /src/signup.js
import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const form = document.querySelector(".signup-form");
const fullNameEl = document.getElementById("fullName");
const usernameEl = document.getElementById("username");
const emailEl = document.getElementById("email");
const phoneEl = document.getElementById("phone");
const passwordEl = document.getElementById("password");
const msg = document.getElementById("signup-msg");

function setBusy(busy) {
  const btn = document.getElementById("create-account-btn");
  if (!btn) return;
  btn.disabled = busy;
  btn.textContent = busy ? "Creating account…" : "CREATE ACCOUNT";
}

function prettyError(err) {
  const map = {
    "auth/invalid-email": "Please enter a valid email.",
    "auth/email-already-in-use": "That email is already registered.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/missing-password": "Password is required.",
    "auth/too-many-requests": "Too many attempts. Try again shortly.",
  };
  return map[err?.code] || err?.message || "Something went wrong.";
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  setBusy(true);

  const fullName = (fullNameEl?.value || "").trim();
  const username = (usernameEl?.value || "").trim();
  const email = (emailEl?.value || "").trim();
  const phone = (phoneEl?.value || "").trim();
  const password = passwordEl?.value || "";

  try {
    if (!fullName || !username || !email || !password) {
      throw new Error("Please fill in all required fields.");
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    await setDoc(doc(db, "users", uid), {
      fullName,
      username,
      email,
      phone,
    });

    msg.textContent = "Account created! Redirecting…";

    window.location.href = "/main.html";
  } catch (err) {
    msg.textContent = prettyError(err);
  } finally {
    setBusy(false);
  }
});
