import {
  auth,
  db,
  collection,
  query,
  onSnapshot,
  orderBy,
  getDocs,
  where,
} from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";


const POSTS_COLLECTION = "posts";

// Elements on the Completed Quest page (kept for context, but not used in the feed logic)
const displayName = document.getElementById("realName");
const levelSpan = document.getElementById("level");
const qpSpan = document.getElementById("qp-count");
const contactsSpan = document.getElementById("contacts-count");
const myItemsSpan = document.getElementById("myitems-count");
const qcSpan = document.getElementById("qc-count");
const progressPointsSpan = document.getElementById("progress-points");
const progressBarInner = document.getElementById("progress-bar-inner");



onAuthStateChanged(auth, (user) => {
  if (user) {
    fetchUserData(user.uid);
  } else {
    console.log("No user is signed in.");
    displayName.textContent = "Your Name";

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

      displayName.textContent = fullName;

    } else {
      console.log("No user data found in Firestore for UID:", userId);
      displayName.textContent = "Your Name";

    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    displayName.textContent = "Your Name";

  }
}










document.addEventListener("DOMContentLoaded", () => {
  // Find the container outside of the auth state listener for safety
  const postsContainer = document.getElementById("uploadedFilesContainer");

  if (!postsContainer) {
    console.error("Error: Could not find #uploadedFilesContainer on the page.");
    return;
  }

  postsContainer.innerHTML =
    '<p style="text-align: center; color: #555;">Checking user login status...</p>';

  // Use onAuthStateChanged to ensure we have the user object
  // NOTE: Assuming auth.onAuthStateChanged is available (exported from firebase.js)
  auth.onAuthStateChanged((user) => {
    // --- CRITICAL CHECK ---
    // If user is null or user.uid is unavailable, stop here and show a message.
    if (!user || !user.uid) {
      postsContainer.innerHTML =
        '<p style="text-align: center; color: #555;">Please log in to view your completed quests.</p>';
      return;
    }

    // Now that we have a valid user.uid, proceed with the query setup.
    const currentUserId = user.uid;
    postsContainer.innerHTML =
      '<p style="text-align: center; color: #555;">Loading your completed quests...</p>';

    try {
      // Define the filters for the current user's completed quests
      const userFilter = where("ownerUid", "==", currentUserId);
      const completionFilter = where("isCompletedQuest", "==", true);

      const postsQuery = query(
        collection(db, POSTS_COLLECTION),
        userFilter,
        completionFilter,
        orderBy("createdAt", "desc")
      );

      onSnapshot(postsQuery, (snapshot) => {

        const posts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (posts.length === 0) {
          postsContainer.innerHTML =
            '<p style="text-align: center; color: #555;">No completed quests found for you. Keep hunting!</p>';
          return;
        }

        // Clear the container
        postsContainer.innerHTML = "";

        // Loop through posts and append cards
        posts.forEach((post, index) => {
          // Create the main card element
          const postCard = document.createElement("div");
          postCard.className = "post-card";
          postCard.dataset.postId = post.id;

          // 1. Create the image
          const imageElement = document.createElement("img");
          imageElement.src = post.imageBase64;
          imageElement.alt = post.item;
          imageElement.style.cursor = "pointer";

          // Click handler for image
          imageElement.onclick = function () {
            window.location.href = `details.html?postId=${post.id}`;
          };

          // 2. Create the item name
          const itemName = document.createElement("h3");
          itemName.textContent = post.item || "Untitled Item";

          // 3. Create the status text
          const itemStatus = document.createElement("h2");
          itemStatus.textContent = post.status || "No status";

          // 4. Create the time text
          const postTime = document.createElement("p");
          let displayDate =
            post.createdAt && typeof post.createdAt.toDate === "function"
              ? post.createdAt.toDate()
              : new Date();
          postTime.textContent = `Posted ${timeAgo(displayDate)}`;

          // 5. Create the view button
          const detailsButton = document.createElement("button");
          detailsButton.textContent = "View Details";
          detailsButton.className = "details-button";

          detailsButton.onclick = function () {
            window.location.href = `details.html?postId=${post.id}`;
          };

          const footerDiv = document.createElement("div");
          footerDiv.className = "post-footer";
          footerDiv.appendChild(postTime);
          footerDiv.appendChild(detailsButton);

          // Add all new elements to the card
          postCard.appendChild(imageElement);
          postCard.appendChild(itemName);
          postCard.appendChild(itemStatus);
          postCard.appendChild(footerDiv);

          // Add the finished card to the page
          postsContainer.appendChild(postCard);
        });
      });
    } catch (error) {
      console.error("Error loading posts from Firebase:", error);
      postsContainer.innerHTML =
        '<p style="text-align: center; color: red;">Error loading posts from the database.</p>';
    }
  });
});

/**
 * Helper function to calculate "time ago"
 * e.g., "5 minutes ago"
 */
function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";

  return Math.floor(seconds) + " seconds ago";
}