import {
    auth,
    db,
    collection,
    query,
    onSnapshot,
    orderBy,
    getDocs,
    where, // <<< IMPORTED: Needed for status filtering
} from "./firebase.js";

const POSTS_COLLECTION = "posts";

const filterBtn = document.getElementById("filter-btn");
const filterPopup = document.getElementById("filter-popup");

// --- Filter UI Logic (Unchanged) ---

filterBtn.addEventListener("click", () => {
    filterPopup.classList.toggle("hidden");
});

document.addEventListener("click", (e) => {
    if (!filterPopup.contains(e.target) && !filterBtn.contains(e.target)) {
        filterPopup.classList.add("hidden");
    }
});

filterPopup.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
        const filterType = btn.getAttribute("data-filter");
        console.log("Filter selected:", filterType);

        switch (filterType) {
            case "recent":
                break;
            case "oldest":
                break;
            case "az":
                break;
            case "za":
                break;
        }

        filterPopup.classList.add("hidden");
    });
});

// --- Time Ago Helper Function (Unchanged) ---

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

// THE STUFF BELOW IS STRICTLY FOR UPLOADING PHOTOS

document.addEventListener("DOMContentLoaded", async () => {
    // Find the container where posts should go
    const postsContainer = document.getElementById("uploadedFilesContainer");

    if (!postsContainer) {
        console.error("Error: Could not find #uploadedFilesContainer on the page.");
        return;
    }

    postsContainer.innerHTML =
        '<p style="text-align: center; color: #555;">Loading posts...</p>';

    // === START OF CRITICAL CHANGE: Delay execution to wait for Firebase Auth ===
    setTimeout(async () => {
        // Get the current user ID after a short delay
        const currentUserId = auth.currentUser ? auth.currentUser.uid : null;

        if (!currentUserId) {
            // If still null, alert the user and continue, knowing the filter won't work.
            console.warn("Authentication did not complete in time. Cannot guarantee exclusion of own posts.");
        }

        try {
            // === Firestore Query: Filter for Pending/Unclaimed Quests Only ===
            const postsQuery = query(
                collection(db, POSTS_COLLECTION),
                where("isActiveQuest", "==", false),     // Exclude currently claimed/active quests
                where("isCompletedQuest", "==", false),   // Exclude completed quests
                orderBy("createdAt", "desc")
            );
            // ===================================================================

            onSnapshot(postsQuery, (snapshot) => {
                // 1. Map all posts from the snapshot
                let posts = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // 2. Client-side Filter: Exclude own posts
                if (currentUserId) {
                    posts = posts.filter(post => post.ownerUid !== currentUserId);
                }
                // -------------------------------------------------------------

                if (posts.length === 0) {
                    postsContainer.innerHTML =
                        '<p style="text-align: center; color: #555;">No pending quests from other users found. Check back later!</p>';
                    return;
                }

                // Clear the container
                postsContainer.innerHTML = "";

                // Loop through each post and create the HTML for it
                posts.forEach((post, index) => {
                    // Create the main card element
                    const postCard = document.createElement("div");
                    postCard.className = "post-card";

                    // Assigns Post ID to recall for points
                    postCard.dataset.postId = post.id;

                    // 1. Create the image
                    const imageElement = document.createElement("img");
                    imageElement.src = post.imageBase64; // This is the Base64 image data
                    imageElement.alt = post.item;
                    imageElement.style.cursor = "pointer"; // Add visual cue that it's clickable

                    // === Make the image clickable to view details ===
                    imageElement.onclick = function () {
                        window.location.href = `details.html?postId=${post.id}`;
                    };
                    // ==========================================================

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
    }, 2000); // 2-second delay to wait for Firebase Auth
    // === END OF CRITICAL CHANGE ===
});
// THE STUFF ABOVE IS STRICTLY FOR UPLOADING PHOTOS