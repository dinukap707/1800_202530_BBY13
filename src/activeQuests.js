// activeQuests.js – ONLY for Active Quests page
import { db, auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const realNameEl = document.getElementById("realName");
const itemsLostEl = document.getElementById("items-lost-count");
const itemsFoundEl = document.getElementById("items-found-count");

function safeSetText(el, value) {
  if (el) el.textContent = String(value);
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    safeSetText(realNameEl, "Your Name");
    safeSetText(itemsLostEl, 0);
    safeSetText(itemsFoundEl, 0);
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      safeSetText(realNameEl, "Your Name");
      safeSetText(itemsLostEl, 0);
      safeSetText(itemsFoundEl, 0);
      return;
    }

    const data = snap.data();

    safeSetText(realNameEl, data.fullName || "Your Name");
    safeSetText(itemsLostEl, data.questsPublished ?? 0); // items I lost (posted)
    safeSetText(itemsFoundEl, data.myItemsFound ?? 0); // items I found
  } catch (err) {
    console.error("Error loading Active Quests data:", err);
    safeSetText(realNameEl, "Your Name");
    safeSetText(itemsLostEl, 0);
    safeSetText(itemsFoundEl, 0);
  }
});
