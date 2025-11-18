// main.js (updated)
import { db, auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const displayName = document.getElementById("realName");
const levelSpan = document.getElementById("level");
const qpSpan = document.getElementById("qp-count");
const contactsSpan = document.getElementById("contacts-count");
const myItemsSpan = document.getElementById("myitems-count");
const qcSpan = document.getElementById("qc-count");
const progressPointsSpan = document.getElementById("progress-points");
const progressBarInner = document.getElementById("progress-bar-inner");

function getLevelFromPoints(points) {
  if (points >= 100) return "SCOUT"; // tweak this range later if needed
  if (points >= 50) return "SCOUT";
  return "ROOKIE";
}

// Map points to 0–100 bar
function updateProgressBar(points) {
  if (!progressBarInner || !progressPointsSpan) return;

  const maxForBar = 100;
  const clamped = Math.min(points, maxForBar);
  const percent = (clamped / maxForBar) * 100;

  progressBarInner.style.width = `${percent}%`;
  progressPointsSpan.textContent = clamped.toString();
}

// Use an observer to get the current user's UID when the auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    const uid = user.uid;
    console.log("Current user UID:", uid);

    // Now call a function to fetch their specific data using the UID
    fetchUserData(uid);
  } else {
    // User is signed out
    console.log("No user is signed in.");
    displayName.textContent = "Your Name";
    levelSpan.textContent = "ROOKIE";
    qpSpan.textContent = "0";
    contactsSpan.textContent = "0";
    myItemsSpan.textContent = "0";
    qcSpan.textContent = "0";
    updateProgressBar(0);
  }
});

// Function to fetch data from Firestore using the user's UID
async function fetchUserData(userId) {
  // Use the provided userId (the UID) as the document ID
  const docRef = doc(db, "users", userId);

  try {
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const fullName = data.fullName || "Your Name";
      const points = data.points || 0;

      displayName.textContent = fullName;

      const level = getLevelFromPoints(points);
      levelSpan.textContent = level;

      qpSpan.textContent = (data.questsPublished || 0).toString();
      contactsSpan.textContent = (data.contactsMade || 0).toString();
      myItemsSpan.textContent = (data.myItemsFound || 0).toString();
      qcSpan.textContent = (data.questsCompleted || 0).toString();

      updateProgressBar(points);
    } else {
      displayName.textContent = "Your Name";
      levelSpan.textContent = "ROOKIE";
      qpSpan.textContent = "0";
      contactsSpan.textContent = "0";
      myItemsSpan.textContent = "0";
      qcSpan.textContent = "0";
      updateProgressBar(0);
    }
  } catch (err) {
    console.error("Error loading quest progress:", err);
    displayName.textContent = "Your Name";
    levelSpan.textContent = "ROOKIE";
    updateProgressBar(0);
  }
}
