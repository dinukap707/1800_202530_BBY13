// main.js (updated)
import { db, auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const userNameElement = document.getElementById("userName");
const displayName = document.getElementById("realName");
const activeQuests = document.getElementById("active-quests-count");
const levelPills = document.querySelectorAll(".level-pill");
const qpSpan = document.getElementById("qp-count");
const contactsSpan = document.getElementById("contacts-count");
const myItemsSpan = document.getElementById("myitems-count");
const qcSpan = document.getElementById("qc-count");
const progressPointsSpan = document.getElementById("progress-points");
const progressBarInner = document.getElementById("progress-bar-inner");
const barPoints = document.getElementById("bar-points");
const levelName = document.getElementById("level-name");



// Compute level from points
function getLevelFromPoints(points) {
  if (points >= 100) return "Ace";
  if (points >= 50) return "Scout";
  return "Rookie";
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

function updateProgressBar(points) {
  if (!progressBarInner || !progressPointsSpan) return;

  const maxForBar = 100;
  const clamped = Math.min(points, maxForBar);
  const percent = (clamped / maxForBar) * 100;

  progressBarInner.style.width = `${percent}%`;
  progressPointsSpan.textContent = clamped.toString();
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    fetchUserData(user.uid);
  } else {
    console.log("No user is signed in.");
    userNameElement.textContent = "Username";
    displayName.textContent = "Your Name";
    activeQuests.textContent = "0";
    qpSpan.textContent = "0";
    contactsSpan.textContent = "0";
    myItemsSpan.textContent = "0";
    qcSpan.textContent = "0";
    barPoints.textContent = "0";
    levelName.textContent = "Rookie"
    updateLevelUI("rookie");
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
      const userData = docSnap.data();

      const fullName = userData.fullName;
      const userName = userData.username;

      const points = userData.points || 0;
      const levelKey = getLevelFromPoints(points);


      const questsPublished = userData.questsPublished || 0;
      const questsCompleted = userData.questsCompleted || 0;
      const contactsMade = userData.contactsMade || 0;
      const myItemsFound = userData.myItemsFound || 0;



      userNameElement.textContent = userName;
      displayName.textContent = fullName;

      qpSpan.textContent = questsPublished;
      contactsSpan.textContent = contactsMade;
      myItemsSpan.textContent = myItemsFound;
      qcSpan.textContent = questsCompleted;

      barPoints.textContent = points;
      levelName.textContent = getLevelFromPoints(points)

      // const activeCount = userData.currentActiveQuests || 0;
      // activeQuests.textContent = activeCount.toString();

      updateLevelUI(levelKey);
      updateProgressBar(points);

    } else {
      console.log("No user data found in Firestore for UID:", userId);
      userNameElement.textContent = "Username";
      displayName.textContent = "Your Name";
      activeQuests.textContent = "0";
      qpSpan.textContent = "0";
      contactsSpan.textContent = "0";
      myItemsSpan.textContent = "0";
      qcSpan.textContent = "0";
      updateLevelUI("rookie");
      updateProgressBar(0);
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    userNameElement.textContent = "Username";
    displayName.textContent = "Your Name";
    activeQuests.textContent = "0";
    qpSpan.textContent = "0";
    contactsSpan.textContent = "0";
    myItemsSpan.textContent = "0";
    qcSpan.textContent = "0";
    updateLevelUI("rookie");
    updateProgressBar(0);
  }
}
