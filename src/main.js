

const filterBtn = document.getElementById("filter-btn");
const filterPopup = document.getElementById("filter-popup");

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

// THE STUFF BELOW IS STRICTLY FOR UPLOADING PHOTOS

document.addEventListener('DOMContentLoaded', () => {
    // Find the container where posts should go
    const postsContainer = document.getElementById('uploadedFilesContainer');
    
    if (!postsContainer) {
        console.error('Error: Could not find #uploadedFilesContainer on the page.');
        return; 
    }

    // Get all posts from localStorage
    const posts = JSON.parse(localStorage.getItem('posts')) || [];

    // Check if there are any posts
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p style="text-align: center; color: #555;">No posts found. Click the + button to create one!</p>';
        return;
    }

    // Clear the container
    postsContainer.innerHTML = ''; 

    // Loop through each post and create the HTML for it
    posts.forEach(post => {
        // Create the main card element
        const postCard = document.createElement('div');
        // You MUST add styling for "post-card" in your test.css file
        postCard.className = 'post-card'; 

        // 1. Create the image
        const imageElement = document.createElement('img');
        imageElement.src = post.image; // This is the Base64 image data
        imageElement.alt = post.item;
        
        // 2. Create the item name
        const itemName = document.createElement('h3');
        itemName.textContent = post.item || 'Untitled Item';
        
        // 3. Create the time text
        const postTime = document.createElement('p');
        postTime.textContent = `Posted ${timeAgo(new Date(post.time))}`;
        
        // Add all new elements to the card
        postCard.appendChild(imageElement);
        postCard.appendChild(itemName);
        postCard.appendChild(postTime);
        
        // Add the finished card to the page
        postsContainer.appendChild(postCard);
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
// THE STUFF ABOVE IS STRICTLY FOR UPLOADING PHOTOS
