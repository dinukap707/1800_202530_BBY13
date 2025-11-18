import { db, auth } from './firebase.js';
import {
    onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// --- Initialize Firebase Services ---
// (Ensure your app is initialized globally or imported here)
// const db = getFirestore();
// const auth = getAuth(); // Only needed if you rely on auth for current user's profile

// --- Helper: Get UID from URL ---
function getUidFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('uid'); 
}

// --- Function to fetch and display profile data ---
async function fetchAndDisplayProfile(uid) {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    // Get references to elements once, ensuring they exist
    const realNameEl = document.getElementById('realName');
    const userNameEl = document.getElementById('userName');
    const emailEl = document.getElementById('email');

    if (userSnap.exists()) {
      const userData = userSnap.data();

      // **If the error persists, it is one of these three lines below (a null check)**
      if (realNameEl) realNameEl.textContent = userData.fullName || 'No Name Provided';
      if (userNameEl) userNameEl.textContent = `@${userData.username || 'unknown'}`;
      if (emailEl) emailEl.textContent = userData.email || 'N/A';
      
    } else {
      if (realNameEl) realNameEl.textContent = "User Profile Not Found";
      if (userNameEl) userNameEl.textContent = "This user may have been deleted.";
      if (emailEl) emailEl.textContent = "";
    }
  } catch (error) {
    console.error("Error fetching user data:", error); // Logs to line ~51/61
    // You might get here if the Firestore query fails
  }
}

// --- Main Execution Logic ---
function initProfileView() {
    const externalUid = getUidFromUrl();

    // The logic below handles three cases:
    // 1. External UID in URL (viewing another user's profile)
    // 2. No external UID, but a user is logged in (viewing own profile)
    // 3. Neither (Error or Logged Out)

    if (externalUid) {
        // Case 1: Load the external user profile immediately
        fetchAndDisplayProfile(externalUid);
    } else {
        // Case 2 & 3: Wait for auth state to determine the current user (if logged in)
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // Load the currently logged-in user's profile
                fetchAndDisplayProfile(user.uid);
            } else {
                // Handle case where no UID is available (not logged in and no external UID)
                document.getElementById('realName').textContent = "Please log in to view a profile.";
            }
        });
    }
}

// Ensure the HTML elements are ready before we try to access them
// If you moved the script tag to the end of <body>, this is still a good safety check.
document.addEventListener('DOMContentLoaded', initProfileView);