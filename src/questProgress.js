// questProgress.js
import { db, auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Elements on the Quest Progress page
const displayName = document.getElementById("realName");
const levelSpan = document.getElementById("level");
const qpSpan = document.getElementById("qp-count");
const contactsSpan = document.getElementById("contacts-count");
const myItemsSpan = document.getElementById("myitems-count");
const qcSpan = document.getElementById("qc-count");
const progressPointsSpan = document.getElementById("progress-points");
const progressBarInner = document.getElementById("progress-bar-inner");

// Level from points
function getLevelFromPoints(points) {
  if (points >= 100) return "ACE";
  if (points >= 50) return "SCOUT";
  return "ROOKIE";
}

// Progress bar 0–100
function updateProgressBar(points) {
  if (!progressBarInner || !progressPointsSpan) return;

  const maxForBar = 100;
  const clamped = Math.min(points, maxForBar);
  const percent = (clamped / maxForBar) * 100;

  progressBarInner.style.width = `${percent}%`;
  progressPointsSpan.textContent = clamped.toString();
}

// Auth listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    fetchUserData(user.uid);
  } else {
    console.log("No user is signed in.");
    if (displayName) displayName.textContent = "Your Name";
    if (levelSpan) levelSpan.textContent = "ROOKIE";
    if (qpSpan) qpSpan.textContent = "0";
    if (contactsSpan) contactsSpan.textContent = "0";
    if (myItemsSpan) myItemsSpan.textContent = "0";
    if (qcSpan) qcSpan.textContent = "0";
    updateProgressBar(0);
  }
});

// Load user stats for progress page
async function fetchUserData(userId) {
  const docRef = doc(db, "users", userId);

  try {
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const fullName = data.fullName || "Your Name";
      const points = data.points || 0;

      if (displayName) displayName.textContent = fullName;

      const level = getLevelFromPoints(points);
      if (levelSpan) levelSpan.textContent = level;

      if (qpSpan) qpSpan.textContent = (data.questsPublished || 0).toString();
      if (contactsSpan)
        contactsSpan.textContent = (data.contactsMade || 0).toString();
      if (myItemsSpan)
        myItemsSpan.textContent = (data.myItemsFound || 0).toString();
      if (qcSpan) qcSpan.textContent = (data.questsCompleted || 0).toString();

      updateProgressBar(points);
    } else {
      if (displayName) displayName.textContent = "Your Name";
      if (levelSpan) levelSpan.textContent = "ROOKIE";
      if (qpSpan) qpSpan.textContent = "0";
      if (contactsSpan) contactsSpan.textContent = "0";
      if (myItemsSpan) myItemsSpan.textContent = "0";
      if (qcSpan) qcSpan.textContent = "0";
      updateProgressBar(0);
    }
  } catch (err) {
    console.error("Error loading quest progress:", err);
    if (displayName) displayName.textContent = "Your Name";
    if (levelSpan) levelSpan.textContent = "ROOKIE";
    updateProgressBar(0);
  }
}
