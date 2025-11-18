const uploadBox = document.querySelector(".box");
const addButton = document.querySelector(".add-button");
const itemInput = document.querySelector(".form-group.item input");
const descriptionInput = document.querySelector(
  ".form-group.description input"
);
const hashtagsInput = document.querySelector(".form-group.hashtags input");
const locationInput = document.querySelector(".form-group.locations input");
const clearBtn = document.getElementById("clearBtn");
const submitBtn = document.getElementById("submitBtn");

// This will store the image data as a Base64 string
let uploadedImageBase64 = null;

// 1. Create a hidden file input element
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "image/*"; // Only accept image files
fileInput.style.display = "none";
document.body.appendChild(fileInput); // Add it to the page

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
      // e.target.result contains the Base64 string
      uploadedImageBase64 = e.target.result;

      // Replace the '+' button with the image preview
      uploadBox.innerHTML = `<img src="${e.target.result}" alt="Image preview" style="width: 100%; height: 100%; object-fit: contain;">`;

      // Make the new image clickable to change it
      uploadBox.style.cursor = "pointer";
      uploadBox.addEventListener("click", () => fileInput.click());
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
  descriptionInput.value = "";
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
submitBtn.addEventListener("click", (e) => {
  e.preventDefault();

  // Check if an image has been uploaded
  if (!uploadedImageBase64) {
    alert("Please upload an image before posting.");
    return; // Stop the function
  }

  // Create an object to store all the post data
  const postData = {
    image: uploadedImageBase64,
    item: itemInput.value,
    description: descriptionInput.value,
    hashtags: hashtagsInput.value,
    location: locationInput.value,
    time: new Date().toISOString(), 
  };

  // Retrieve existing posts from localStorage, or create an empty array
  let posts = JSON.parse(localStorage.getItem("posts")) || [];

  // Add the new post to the *beginning* of the array
  posts.unshift(postData);

  // Save the updated array back to localStorage
  localStorage.setItem("posts", JSON.stringify(posts));

  const GO_TIMEOUT_MS = 3000; // optional safety net

  let redirected = false;
  function go() {
    if (!redirected) {
      redirected = true;
      window.location.href = "main.html";
    }
  }
});
