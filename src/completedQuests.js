
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

const POSTS_COLLECTION = "posts";


// Elements on the Completed Quest page
const displayName = document.getElementById("realName");
const levelSpan = document.getElementById("level");
const qpSpan = document.getElementById("qp-count");
const contactsSpan = document.getElementById("contacts-count");
const myItemsSpan = document.getElementById("myitems-count");
const qcSpan = document.getElementById("qc-count");
const progressPointsSpan = document.getElementById("progress-points");
const progressBarInner = document.getElementById("progress-bar-inner");

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
    auth.onAuthStateChanged((user) => {
        // --- CRITICAL CHECK ---
        // If user is null or user.uid is unavailable, stop here and show a message.
        if (!user || !user.uid) {
            postsContainer.innerHTML = 
                '<p style="text-align: center; color: #555;">Please log in to view your completed quests.</p>';
            return;
        }

        // Now that we have a valid user.uid, proceed with the query setup.
        postsContainer.innerHTML =
            '<p style="text-align: center; color: #555;">Loading your completed quests...</p>';

        try {
            // Define the filters using the guaranteed user.uid
            const userFilter = where("userId", "==", user.uid);
            const completionFilter = where("isCompletedQuest", "==", true);
            
            const postsQuery = query(
                collection(db, POSTS_COLLECTION),
                userFilter,
                completionFilter,
                orderBy("createdAt", "desc")
            );

            onSnapshot(postsQuery, (snapshot) => {
                // ... (rest of your snapshot processing logic remains the same)
                
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
                    // ... (HTML creation logic)
                    const postCard = document.createElement("div");
                    postCard.className = "post-card";
                    postCard.dataset.postId = post.id;
                    
                    // ... (Add image, name, status, time, button, etc.)
                    
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