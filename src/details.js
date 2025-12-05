import { auth, db } from "./firebase.js";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";

// Helper function to calculate "time ago"
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

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("postId");

  const container = document.getElementById("postDetailsContainer");

  if (!container) {
    console.error("Error: Could not find #postDetailsContainer.");
    return;
  }

  if (!postId) {
    container.innerHTML = "<h2>Error: Post ID not specified.</h2>";
    return;
  }

  // 1. Get a reference to the specific post document
  const postRef = doc(db, "posts", postId);

  try {
    // 2. Fetch the document
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      container.innerHTML = "<h2>Post Not Found in Database</h2>";
      return;
    }

    // 3. Extract the data
    const post = {
      id: postSnap.id,
      ...postSnap.data(),
    };

    // === START: NEW CODE TO CONVERT FIRESTORE TIMESTAMP TO DATE ===
    let displayDate = new Date(); // Default to current time if createdAt is missing

    // Check if createdAt exists and has the toDate function (meaning it's a Firestore Timestamp)
    if (post.createdAt && typeof post.createdAt.toDate === "function") {
      displayDate = post.createdAt.toDate();
    }
    // === END: NEW CODE ===

    // 4. Inject the HTML
    container.innerHTML = `
      <div class="detailed-post-card">
        <img src="${post.imageBase64}" alt="${
      post.item
    }" class="detailed-image">
        <div class="detailed-content">
          <h1>${post.item || "Untitled Item"}</h1>
          <p class="posted-time">Posted ${timeAgo(displayDate)}</p>
          
          <h3>Status</h3>
          <p>${post.status || "No Status"}</p>

          <h3>Description</h3>
          <p>${post.description || "No description"}</p>

          <h3>Location</h3>
          <p>${post.location || "N/A"}</p>

          <h3>Hashtags</h3>
          <p>${post.hashtags || "None"}</p>
        </div>
      </div>
    `;

    // 5. Set up the CONTACT button listener
    const contactBtn = document.getElementById("contact-btn");
    if (contactBtn) {
      // Pass the current post object which contains the ID
      contactBtn.addEventListener("click", () => handleContact(post));
    }

    // 6. Set up the PROFILE button listener (Unchanged)
    const profileBtn = document.getElementById("profile-btn");
    if (profileBtn) {
      profileBtn.addEventListener("click", () => {
        // Navigate to profileView.html, passing the ownerUid as a parameter
        if (post.ownerUid) {
          window.location.href = `profileView.html?uid=${post.ownerUid}`;
        } else {
          alert("Owner information is missing for this post.");
        }
      });
    }
  } catch (error) {
    console.error("Error fetching post from Firestore:", error);
    container.innerHTML = "<h2>Error loading post details.</h2>";
  }
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
  const ownerUid = post.ownerUid;
  const postId = post.id; // Get the ID of the post
  const docRef = doc(db, "users", ownerUid);
  const docSnap = await getDoc(docRef);
  const userData = docSnap.data();
  const name = userData.fullName;
  const email = userData.email;

  if (finderUid == ownerUid) {
    alert("You can't contact yourself.");
    window.location.href = "main.html";
    return;
  }

  if (post.status == "Lost") {
    alert(
      "Please help " +
        name +
        " find their lost item. Send them an email if you have any clues: " +
        email
    );
    window.location.href = "main.html";
    return;
  }

  try {
    // --- START: NEW FUNCTIONALITY TO ACTIVATE QUEST ON POST DOCUMENT ---
    // 1. Update the POST document to set isActiveQuest to true
    await updateDoc(doc(db, "posts", postId), {
      isActiveQuest: true,
      helperUid: finderUid, // Optional: Record the ID of the user who became the helper
    });
    // --- END: NEW FUNCTIONALITY ---

    // 2. THIS ADDS TO THE FINDERS SCORE (Unchanged)
    await updateDoc(doc(db, "users", finderUid), {
      points: increment(1),
      contactsMade: increment(1),
      // activeQuests: increment(1),
    });

    // 3. OWNER ACTIVATES QUEST ON THEIR PAGE (Unchanged)
    if (ownerUid && ownerUid !== finderUid) {
      await updateDoc(doc(db, "users", ownerUid), {
        // activeQuests: increment(1),
      });

      window.location.href = "main.html";
    }

    alert(
      "We hope you Find-it. Contact and Quest successfully activated and added to your profile. Contact " +
        name +
        " at: " +
        email
    );
  } catch (error) {
    console.error("Error updating Firestore:", error);
    alert("Failed to start quest.");
  }
}
