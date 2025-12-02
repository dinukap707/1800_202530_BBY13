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

  // Ensure post.timestamp is converted to a Date object for timeAgo
  let displayDate =
   post.timestamp && typeof post.timestamp.toDate === "function"
    ? post.timestamp.toDate()
    : new Date();

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
   contactBtn.addEventListener("click", () => handleContact(post));
  }

    // 6. Set up the PROFILE button listener (Moved to here, so it runs immediately)
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
 const ownerUid = post.ownerUid; // Ensure this property exists in your Firestore document

 try {
  // THIS ADDS TO THE FINDERS SCORE
  await updateDoc(doc(db, "users", finderUid), {
   points: increment(1),
   contactsMade: increment(1),
   activeQuests: increment(1),
  });

  // OWNER ACTIVATES QUEST ON THEIR PAGE
  if (ownerUid && ownerUid !== finderUid) {
   await updateDoc(doc(db, "users", ownerUid), {
    activeQuests: increment(1),
   });
  }

  alert("Contact started! Quest added to your profile.");
 } catch (error) {
  console.error("Error updating Firestore:", error);
  alert("Failed to start quest.");
 }
}

//THIS STUFF BELOW WAS FROM SPRINT 4, JORJA ADDED PART, NOT NEEDED BUT MIGHT NEED AFTER POSTS GET IMPLENTED ON LIVE SERVER
// /src/details.js (or wherever your post loading logic is)

// import { doc, getDoc, getFirestore } from "firebase/firestore";
// Assume you've initialized Firebase/Firestore correctly
// Helper to get the post ID from the URL (as used in previous response)
/** function getPostIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("postId");
}

async function loadPostDetailsAndSetupProfileLink() {
  const postId = getPostIdFromUrl();
  if (!postId) return; // Exit if no post ID is found

  try {
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
      const postData = postSnap.data();
      const authorUid = postData.userId; // Get the UID of the author

      // --- CRITICAL STEP ---
      // 1. Get the Profile button element
      const profileButton = document.getElementById("profile-btn");

      // 2. Update the button's action to redirect to profileView.html
      //    and pass the author's UID as a query parameter (uid)
      profileButton.onclick = () => {
        window.location.href = `profileView.html?uid=${userId}`;
      };

      // (Continue with displaying post content here...)
      // Example: document.getElementById('postDetailsContainer').innerHTML = ...
    } else {
      console.log("Post not found.");
    }
  } catch (error) {
    console.error("Error loading post details:", error);
  }
}

loadPostDetailsAndSetupProfileLink(); */
