import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore"; // Added updateDoc, increment
import {
    auth,
    db,
    collection,
    query,
    onSnapshot,
    orderBy,
    where,
} from "./firebase.js";

const POSTS_COLLECTION = "posts";

// --- DOM Elements ---
const lostQuestsContainer = document.getElementById("lostActiveQuestsContainer");
const foundQuestsContainer = document.getElementById("foundActiveQuestsContainer");
const realNameEl = document.getElementById("realName");
const itemsLostEl = document.getElementById("items-lost-count");
const itemsFoundEl = document.getElementById("items-found-count");

function safeSetText(el, value) {
    if (el) el.textContent = String(value);
}

// --- Helper Functions ---

/**
 * Helper function to calculate "time ago"
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

/**
 * Creates the base post card HTML without the "Quest Completed" button.
 */function createPostCard(post) {
    const postCard = document.createElement("div");
    postCard.className = "post-card";
    postCard.dataset.postId = post.id;
    
    // 1. Image
    const imageElement = document.createElement("img");
    imageElement.src = post.imageBase64;
    imageElement.alt = post.item;
    imageElement.className = "post-card-image"; // Optional: for styling
    
    // === NEW LOGIC: Make the image clickable ===
    imageElement.onclick = function () {
        window.location.href = `details.html?postId=${post.id}`;
    };
    // ============================================

    // 2. Item name
    const itemName = document.createElement("h3");
    itemName.textContent = post.item || "Untitled Item";

    // 3. Status text
    const itemStatus = document.createElement("h2");
    itemStatus.textContent = post.status || "Quest Active"; 

    // 4. Time text
    const postTime = document.createElement("p");
    let displayDate =
        post.createdAt && typeof post.createdAt.toDate === "function"
            ? post.createdAt.toDate()
            : new Date();
    postTime.textContent = `Posted ${timeAgo(displayDate)}`;

    // 5. Details button (Now optional, since the image works)
    const detailsButton = document.createElement("button");
    detailsButton.textContent = "View Quest"; // Adjusted text
    detailsButton.className = "details-button";

    detailsButton.onclick = function () {
        window.location.href = `details.html?postId=${post.id}`;
    };

    const footerDiv = document.createElement("div");
    footerDiv.className = "post-footer";
    footerDiv.appendChild(postTime);
    footerDiv.appendChild(detailsButton);

    // Append everything to the card
    postCard.appendChild(imageElement); // The clickable image
    postCard.appendChild(itemName);
    postCard.appendChild(itemStatus);
    postCard.appendChild(footerDiv);
    
    return postCard;
}

/**
 * Marks a post as completed, updates the owner's and helper's stats.
 */
async function markQuestCompleted(postId, ownerUid, helperUid) {
    if (!postId || !ownerUid || !helperUid) {
        alert("Cannot complete quest: missing post or user IDs.");
        return;
    }

    try {
        // --- 1. Update the POST document ---
        await updateDoc(doc(db, POSTS_COLLECTION, postId), {
            isActiveQuest: false,
            isCompletedQuest: true,
            status: "Found & Returned",
            completedAt: new Date(),
        });
        
        // --- 2. Update the OWNER's Stats ---
        await updateDoc(doc(db, "users", ownerUid), {
            activeQuests: increment(-1), 
            questsCompleted: increment(1), 
        });

        // --- 3. Update the HELPER's Stats ---
        await updateDoc(doc(db, "users", helperUid), {
            activeQuests: increment(-1),
            myItemsFound: increment(1), 
            points: increment(10), 
        });

        alert("Quest successfully marked as Completed!");
    } catch (error) {
        console.error("Error marking quest as completed:", error);
        alert("Failed to mark quest as completed.");
    }
}


/**
 * Loads and displays active quests based on the query.
 */
function loadActiveQuests(userId, field, container, label) {
    if (!container) return;
    
    container.innerHTML = '<p style="text-align: center; color: #555;">Loading quests...</p>';

    try {
        const activeQuestsQuery = query(
            collection(db, POSTS_COLLECTION),
            where(field, "==", userId),
            where("isActiveQuest", "==", true),
            orderBy("createdAt", "desc")
        );

        onSnapshot(activeQuestsQuery, (snapshot) => {
            const posts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (posts.length === 0) {
                container.innerHTML = 
                    `<p style="text-align: center; color: #555;">No active quests for ${label}.</p>`;
                return;
            }

            // Clear and render posts
            container.innerHTML = "";
            posts.forEach(post => {
                const postCard = createPostCard(post);

                // --- CONDITIONAL BUTTON LOGIC ---
                // The button only appears if:
                // 1. The current user is the OWNER (the one who posted it)
                // 2. The quest is ACTIVE and NOT already completed.
                const isOwner = post.ownerUid === userId;
                const isCompleted = post.isCompletedQuest === true;
                
                if (!isOwner && !isCompleted) { 
                    const completedButton = document.createElement("button");
                    completedButton.textContent = "Quest Completed!";
                    completedButton.className = "completed-button";
                    completedButton.onclick = function () {
                        // Pass required IDs to the completion function
                        markQuestCompleted(post.id, post.ownerUid, post.helperUid);
                    };
                    postCard.appendChild(completedButton);
                }
                // ---------------------------------

                container.appendChild(postCard);
            });
        });
        
    } catch (error) {
        console.error(`Error loading active quests for ${field}:`, error);
        container.innerHTML =
            '<p style="text-align: center; color: red;">Error loading quests.</p>';
    }
}


// --- Main Authentication and Initialization Logic ---

onAuthStateChanged(auth, async (user) => {
    // Handle unauthenticated state
    if (!user) {
        safeSetText(realNameEl, "Guest");
        safeSetText(itemsLostEl, 0);
        safeSetText(itemsFoundEl, 0);
        
        if (lostQuestsContainer) lostQuestsContainer.innerHTML = '<p style="text-align: center; color: #555;">Please log in.</p>';
        if (foundQuestsContainer) foundQuestsContainer.innerHTML = '<p style="text-align: center; color: #555;">Please log in.</p>';
        return;
    }

    // --- 1. Load User Data and Stats ---
    try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
            const data = snap.data();
            safeSetText(realNameEl, data.fullName || "Your Name");
            safeSetText(itemsLostEl, data.questsPublished ?? 0); 
            safeSetText(itemsFoundEl, data.myItemsFound ?? 0); 
        }
    } catch (err) {
        console.error("Error loading user data:", err);
    }
    
    // --- 2. Load Active Quests (LOGIC SWAPPED AS REQUESTED) ---
    
    // A. "Items I lost": Displays Quests you ACCEPTED/FOUND (helperUid == user.uid)
    // The Completed button logic will skip this because the user is NOT the owner.
    loadActiveQuests(user.uid, "helperUid", lostQuestsContainer, "items you are helping to find");
    
    // B. "Items I found": Displays Quests you POSTED/OWNED (ownerUid == user.uid)
    // The Completed button logic WILL show the button for these posts.
    loadActiveQuests(user.uid, "ownerUid", foundQuestsContainer, "items you have posted");
});