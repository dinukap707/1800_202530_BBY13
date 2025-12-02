// --- Code for upload.js ---

import { auth, db, serverTimestamp, collection, addDoc } from "./firebase.js";
import { awardForNewPost } from "./userStats.js";

const POSTS_COLLECTION = "posts";

// Since this is a module, we can safely query for elements
// Get all the necessary elements from upload.html

const uploadBox = document.querySelector(".box");
const addButton = document.querySelector(".add-button");
const statusSelect = document.querySelector(".form-group.status select");
const itemInput = document.querySelector(".form-group.item input");
const description = document.querySelector(".form-group.description textareanvm shou");
const hashtagsInput = document.querySelector(".form-group.hashtags input");
const locationInput = document.querySelector(".form-group.locations input");
const clearBtn = document.getElementById("clearBtn");
const submitBtn = document.getElementById("submitBtn");

const MAX_IMAGE_WIDTH = 600; 
const MAX_IMAGE_HEIGHT = 600;

// This will store the image data as a Base64 string
let uploadedImageBase64 = null;

function go() {
    window.location.href = "main.html";
}

// 1. Create a hidden file input element
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "image/*"; // Only accept image files
fileInput.style.display = "none";
document.body.appendChild(fileInput); // Add it to the page

// Helper function to resize the image using a Canvas
function resizeImage(img, maxWidth, maxHeight) {
    let width = img.width;
    let height = img.height;

    if (width > height) {
        if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
        }
    } else {
        if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
        }
    }

    // Create a canvas element
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    // Draw the resized image onto the canvas
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);

    // Get the Base64 data from the canvas (JPEG format, 70% quality)
    // Using JPEG is usually smaller than PNG
    return canvas.toDataURL("image/jpeg", 0.9);
}

// 2. Add click listener to the '+' button
addButton.addEventListener("click", (e) => {
  e.preventDefault(); // Prevent any default button behavior
  fileInput.click(); // Trigger the hidden file input
});

// 3. Add listener for when a file is selected
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();

    // This runs when the file is finished reading
    reader.onload = (e) => {
      uploadedImageBase64 = e.target.result;

      // Create a temporary Image Object to handle resizing
      const img = new Image();
      img.onload = () => {
          // Resize the image and get the small Base64 string
          uploadedImageBase64 = resizeImage(img, MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT);

          // Display the new, small preview image
          uploadBox.innerHTML = `<img src="${uploadedImageBase64}
          " alt="Image preview" style="width: 100%; height: 100%; object-fit: contain;">`;

          // Make the new image clickable to change it
          uploadBox.style.cursor = "pointer";
          uploadBox.addEventListener("click", () => fileInput.click());
      }
      img.src = uploadedImageBase64;
    };

    // Read the file as a Data URL (Base64)
    reader.readAsDataURL(file);
  }
});

// 4. Add click listener for the 'Clear' button
clearBtn.addEventListener("click", (e) => {
  e.preventDefault();

  // Clear all text inputs
  itemInput.value = "";
  statusSelect.value = "";
  description.value = "";
  hashtagsInput.value = "";
  locationInput.value = "";

  // Reset the image box
  uploadBox.innerHTML = "";
  uploadBox.appendChild(addButton); // Put the original '+' button back
  uploadBox.style.cursor = "default";

  // Clear the stored image data
  uploadedImageBase64 = null;
  fileInput.value = ""; // Important to clear the file input
});

// 5. Add click listener for the 'Post' button 
submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        // Use a custom modal instead of alert() in production apps
        alert("You must be logged in to create a post."); 
        return;
    }
    
    if (!uploadedImageBase64) {
        alert("Please upload an image before posting.");
        return;
    }

    // Check if status is selected
    if (!statusSelect.value) {
        alert("Please select whether the item is Lost or Found.");
        submitBtn.disabled = false;
        return;
    }

    submitBtn.disabled = true;

    try {
        // 1. Prepare post data using the small Base64 image
        const postData = {
            ownerUid: user.uid,
            item: itemInput.value.trim(),
            status: statusSelect.value,
            description: description.value.trim(),
            hashtags: hashtagsInput.value.trim(),
            location: locationInput.value.trim(),
            
            // Store the small Base64 string directly in Firestore
            imageBase64: uploadedImageBase64, 
            
            timestamp: serverTimestamp(), 
        };

        // 2. Save the document to Firestore
        await addDoc(collection(db, POSTS_COLLECTION), postData);

        // 3. Update user stats
        await awardForNewPost(user.uid);

        go();

    } catch (error) {
        console.error("Error creating post:", error);
        submitBtn.disabled = false;
    }
});
