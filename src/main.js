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

const filterBtn = document.getElementById("filter-btn");
const filterPopup = document.getElementById("filter-popup");
const searchInput = document.getElementById("search-bar");

// ====== STATE FOR FILTERING + SEARCH ======
let currentFilter = "recent"; // "recent" | "oldest" | "az" | "za"
let currentSearch = ""; // search text
let currentPosts = [];
let postsContainer = null;

// ---------- FILTER POPUP TOGGLE ----------
if (filterBtn && filterPopup) {
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
        case "oldest":
        case "az":
        case "za":
          currentFilter = filterType;
          break;
        default:
          currentFilter = "recent";
      }

      filterPopup.classList.add("hidden");
      renderPosts();
    });
  });
}

// ---------- SEARCH BAR ----------
if (searchInput) {
  searchInput.addEventListener("input", () => {
    currentSearch = searchInput.value.trim().toLowerCase();
    renderPosts();
  });
}

// ---------- TIME AGO HELPER ----------
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

// ========== FIRESTORE + INITIAL LOAD ==========
document.addEventListener("DOMContentLoaded", async () => {
  postsContainer = document.getElementById("uploadedFilesContainer");

  if (!postsContainer) {
    console.error("Error: Could not find #uploadedFilesContainer on the page.");
    return;
  }

  postsContainer.innerHTML =
    '<p style="text-align: center; color: #555;">Loading posts...</p>';

  // still waiting a bit for auth to be ready (for your peers’ logic)
  setTimeout(async () => {
    const currentUserId = auth.currentUser ? auth.currentUser.uid : null;
    // ^ kept here in case teammates use it later

    try {
      // Pending / unclaimed quests only
      const postsQuery = query(
        collection(db, POSTS_COLLECTION),
        where("isActiveQuest", "==", false),
        where("isCompletedQuest", "==", false),
        orderBy("createdAt", "desc")
      );

      onSnapshot(postsQuery, (snapshot) => {
        currentPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        renderPosts();
      });
    } catch (error) {
      console.error("Error loading posts from Firebase:", error);
      postsContainer.innerHTML =
        '<p style="text-align: center; color: red;">Error loading posts from the database.</p>';
    }
  }, 2000);
});

// ========== RENDER POSTS (FILTER + SEARCH) ==========
function renderPosts() {
  if (!postsContainer) return;

  if (!currentPosts || currentPosts.length === 0) {
    postsContainer.innerHTML =
      '<p style="text-align: center; color: #555;">No lost or found items posted yet! Click the + button to post one!</p>';
    return;
  }

  // 1) start from all posts
  let posts = [...currentPosts];

  // 2) apply search filter first
  if (currentSearch) {
    posts = posts.filter((p) => {
      const haystack = (
        (p.item || "") +
        " " +
        (p.description || "") +
        " " +
        (p.hashtags || "") +
        " " +
        (p.location || "")
      ).toLowerCase();
      return haystack.includes(currentSearch);
    });
  }

  // 3) apply sort filter
  switch (currentFilter) {
    case "recent":
      posts.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime; // newest first
      });
      break;

    case "oldest":
      posts.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return aTime - bTime; // oldest first
      });
      break;

    case "az":
      posts.sort((a, b) =>
        (a.item || "").localeCompare(b.item || "", undefined, {
          sensitivity: "base",
        })
      );
      break;

    case "za":
      posts.sort((a, b) =>
        (b.item || "").localeCompare(a.item || "", undefined, {
          sensitivity: "base",
        })
      );
      break;
  }

  // 4) render
  postsContainer.innerHTML = "";

  if (posts.length === 0) {
    postsContainer.innerHTML =
      '<p style="text-align: center; color: #555;">No posts match your search.</p>';
    return;
  }

  posts.forEach((post) => {
    const postCard = document.createElement("div");
    postCard.className = "post-card";
    postCard.dataset.postId = post.id;

    const imageElement = document.createElement("img");
    imageElement.src = post.imageBase64;
    imageElement.alt = post.item;
    imageElement.style.cursor = "pointer";
    imageElement.onclick = () => {
      window.location.href = `details.html?postId=${post.id}`;
    };

    const itemName = document.createElement("h3");
    itemName.textContent = post.item || "Untitled Item";

    const itemStatus = document.createElement("h2");
    itemStatus.textContent = post.status || "No status";

    const postTime = document.createElement("p");
    const displayDate =
      post.createdAt && typeof post.createdAt.toDate === "function"
        ? post.createdAt.toDate()
        : new Date();
    postTime.textContent = `Posted ${timeAgo(displayDate)}`;

    const detailsButton = document.createElement("button");
    detailsButton.textContent = "View Details";
    detailsButton.className = "details-button";
    detailsButton.onclick = () => {
      window.location.href = `details.html?postId=${post.id}`;
    };

    const footerDiv = document.createElement("div");
    footerDiv.className = "post-footer";
    footerDiv.appendChild(postTime);
    footerDiv.appendChild(detailsButton);

    postCard.appendChild(imageElement);
    postCard.appendChild(itemName);
    postCard.appendChild(itemStatus);
    postCard.appendChild(footerDiv);

    postsContainer.appendChild(postCard);
  });
}
