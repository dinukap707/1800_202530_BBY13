import { auth, db } from "./firebase.js";
import { doc, updateDoc, increment } from "firebase/firestore";

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("postId");

  const container = document.getElementById("postDetailsContainer");

  if (!container) {
    console.error("Error: Could not find #postDetailsContainer.");
    return;
  }

  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const post = posts.find((p) => p.id === postId);

  if (!post) {
    container.innerHTML = "<h2>Post Not Found</h2>";
    return;
  }

  if (posts.length > postIndex && postIndex >= 0) {
    const post = posts[postIndex];

    // START OF MISSING HTML INJECTION CODE
    container.innerHTML = `
        <div class="detailed-post-card">
            <img src="${post.image}" alt="${post.item}" class="detailed-image">
            <div class="detailed-content">
                <h1>${post.item}</h1>
                <p class="posted-time">Posted ${timeAgo(
                  new Date(post.time)
                )}</p>

                <h3>Description</h3>
                <p>${post.description || "No description"}</p>

                <h3>Location</h3>
                <p>${post.location || "N/A"}</p>

                <h3>Hashtags</h3>
                <p>${post.hashtags || "None"}</p>

                <button id="contactBtn" class="contact-button">Contact</button>
            </div>
        </div>
    `;
    // END OF MISSING HTML INJECTION CODE
  } else {
    container.innerHTML = "<h2>Post Not Found</h2>";
  }
});

// Contact Helper
document.getElementById("contactBtn").addEventListener("click", () => {
  handleContact(post);
});

/*
 * THIS PART HANDLES THE CONTACT BTN APPLYING POINTS + QUEST START FUNCTION
 */
async function handleContact(post) {
  const user = auth.currentUser;

  if (!user) {
    alert("Please sign in before contacting.");
    return;
  }

  const finderUid = user.uid;
  const ownerUid = post.ownerUid; // From upload.js

  try {
    // Finder gets the rewards
    await updateDoc(doc(db, "users", finderUid), {
      points: increment(1),
      contactsMade: increment(1),
      activeQuests: increment(1),
    });

    // Owner gets active quest (only if not same user)
    if (ownerUid && ownerUid !== finderUid) {
      await updateDoc(doc(db, "users", ownerUid), {
        activeQuests: increment(1),
      });
    }

    alert("Contact started! Quest added to your profile.");

    // OPTIONAL: redirect to your DM page
    window.location.href = "direct_messages.html";
  } catch (error) {
    console.error("Failed to start quest:", error);
    alert("Error updating quest data.");
  }
}

/**
 * Helper function to calculate "time ago" (Must be outside the main listener)
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
