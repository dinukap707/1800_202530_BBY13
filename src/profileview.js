// --- /src/profileview.js (Level Pills Removed) ---
import { db, auth } from './firebase.js';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// --- Element Selectors ---
const realNameEl = document.getElementById('realName');
const userNameEl = document.getElementById('userName');
const emailEl = document.getElementById('email');

// Stats (Level pills and related functions have been removed)
// NOTE: Ensure your profileview.html file is updated to remove the level-pill elements as well.
const activeQuestsEl = document.getElementById("foundItemsCount");
const qpCountEl = document.getElementById("qpCount");
const contactsCountEl = document.getElementById("contactsCount");
const qcCountEl = document.getElementById("qcCount");

// --- Helper Functions ---

function updateElementText(element, text) {
    if (element) {
        element.textContent = text;
    }
}

function getUidFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('uid'); 
}

// --- Function to fetch and display profile data ---
async function fetchAndDisplayProfile(uid) {
  console.log(`Attempting to fetch data for UID: ${uid}`); 

  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    // Reset UI elements to defaults
    updateElementText(realNameEl, "Loading Name...");
    updateElementText(userNameEl, "@loading_username");
    updateElementText(emailEl, "Loading Email...");

    if (userSnap.exists()) {
      const userData = userSnap.data();
      console.log("Successfully retrieved user data:", userData);

      // Update general info
      updateElementText(realNameEl, userData.fullName || 'No Name Provided');
      updateElementText(userNameEl, userData.username || 'unknown');
      updateElementText(emailEl, userData.email || 'N/A');
      
      // Update stats
      // NOTE: Point and level logic is removed here.
      updateElementText(activeQuestsEl, userData.myItemsFound || 0);
      updateElementText(qpCountEl, userData.questsPublished || 0);
      updateElementText(contactsCountEl, userData.contactsMade || 0);
      updateElementText(qcCountEl, userData.questsCompleted || 0);
      
    } else {
      console.warn(`User data not found in Firestore for UID: ${uid}`);
      updateElementText(realNameEl, "User Profile Not Found");
      updateElementText(userNameEl, `User ID: ${uid} not found.`);
      updateElementText(emailEl, "");
    }
  } catch (error) {
    console.error("Error fetching user data:", error); 
    updateElementText(realNameEl, "Error loading profile data.");
  }
}

// --- Main Execution Logic ---
function initProfileView() {
    const externalUid = getUidFromUrl();

    if (externalUid) {
        fetchAndDisplayProfile(externalUid);
    } else {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchAndDisplayProfile(user.uid);
            } else {
                updateElementText(realNameEl, "Authentication Required");
                updateElementText(userNameEl, "Please log in to view this page.");
                updateElementText(emailEl, "");
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', initProfileView);