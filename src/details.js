document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId');
    const postIndex = parseInt(postId, 10);

    const container = document.getElementById('postDetailsContainer');
    
    if (!container) {
        console.error('Error: Could not find #postDetailsContainer.');
        return; 
    }

    const posts = JSON.parse(localStorage.getItem('posts')) || []; 

    if (posts.length > postIndex && postIndex >= 0) {
        const post = posts[postIndex];

        // START OF MISSING HTML INJECTION CODE
        container.innerHTML = `
            <div class="detailed-post-card">
                <img src="${post.image}" alt="${post.item}" class="detailed-image">
                <div class="detailed-content">
                    <h1>${post.item || 'Untitled Item'}</h1>
                    <p class="posted-time">Posted ${timeAgo(new Date(post.time))}</p>
                    
                    <h3>Description</h3>
                    <p>${post.description || 'No description provided.'}</p>
                    
                    <h3>Location</h3>
                    <p>${post.location || 'N/A'}</p>
                    
                    <h3>Hashtags</h3>
                    <p class="hashtags-list">${post.hashtags || 'None'}</p>
                </div>
            </div>
        `;
        // END OF MISSING HTML INJECTION CODE
        
    } else {
        container.innerHTML = '<h2>Post Not Found</h2>';
    }
});


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
