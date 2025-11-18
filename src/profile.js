// main.js (updated)
import { db, auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const userNameElement = document.getElementById("userName");
const displayName = document.getElementById("realName");
const activeQuests = document.getElementById("active-quests-count");
const levelPills = document.querySelectorAll(".level-pill");

// Compute level from points
function getLevelFromPoints(points) {
  if (points >= 100) return "ace";
  if (points >= 50) return "scout";
  return "rookie";
}

function updateLevelUI(levelKey) {
  levelPills.forEach((pill) => {
    const pillLevel = pill.dataset.level; // "rookie" | "scout" | "ace"
    if (pillLevel === levelKey) {
      pill.classList.add("level-pill--active");
    } else {
      pill.classList.remove("level-pill--active");
    }
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    fetchUserData(user.uid);
  } else {
    console.log("No user is signed in.");
    userNameElement.textContent = "Username";
    displayName.textContent = "Your Name";
    activeQuests.textContent = "0";
    updateLevelUI("rookie");
  }
});

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
    userNameElement.textContent = "Username";
    displayName.textContent = "Your Name";
    activeQuests.textContent = "0";
    // You might want to redirect them to a login page here
  }
});

// Function to fetch data from Firestore using the user's UID
async function fetchUserData(userId) {
  // Use the provided userId (the UID) as the document ID
  const docRef = doc(db, "users", userId);

  try {
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      const fullName = userData.fullName;
      const userName = userData.username;
      const points = userData.points || 0;
      const questsPublished = userData.questsPublished || 0;
      const questsCompleted = userData.questsCompleted || 0;

      userNameElement.textContent = userName;
      displayName.textContent = fullName;

      const activeCount = userData.activeQuests || 0;
      activeQuests.textContent = activeCount.toString();

      const levelKey = getLevelFromPoints(points);
      updateLevelUI(levelKey);
    } else {
      console.log("No user data found in Firestore for UID:", userId);
      userNameElement.textContent = "Username";
      displayName.textContent = "Your Name";
      activeQuests.textContent = "0";
      updateLevelUI("rookie");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    userNameElement.textContent = "Username";
    displayName.textContent = "Your Name";
    activeQuests.textContent = "0";
    updateLevelUI("rookie");
  }
}
