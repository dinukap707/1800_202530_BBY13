// --- Code for upload.js ---

import mapboxgl from "mapbox-gl";
import { auth, db } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { awardForNewPost } from "./userStats.js";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const POSTS_COLLECTION = "posts";

// Since this is a module, we can safely query for elements
// Get all the necessary elements from upload.html

const uploadBox = document.querySelector(".box");
const addButton = document.querySelector(".add-button");
const statusSelect = document.querySelector(".form-group.status select");
const itemInput = document.querySelector(".form-group.item input");
const descriptionInput = document.querySelector(
  ".form-group.description textarea"
);

const hashtagsInput = document.querySelector(".form-group.hashtags input");
const locationInput = document.querySelector(".form-group.locations input");
const clearBtn = document.getElementById("clearBtn");
const submitBtn = document.getElementById("submitBtn");

const MAX_IMAGE_WIDTH = 600;
const MAX_IMAGE_HEIGHT = 600;

// This will set default location IDS on the map to help simplify placing items on the map
const CAMPUS_LOCATIONS = {
  NW1: {
    lat: 49.25275510980522,
    lng: -123.00337575113906,
    label: "NW1 – BCIT Burnaby Campus",
  },
  SW2: {
    lat: 49.250555,
    lng: -122.989333,
    label: "SW2 – BCIT Burnaby Campus",
  },
  SE12: {
    lat: 49.24991567402966,
    lng: -123.0016059661734,
    label: "SE12 – BCIT Burnaby Campus",
  },
  SW5: {
    lat: 49.249737742331575,
    lng: -123.00264986388088,
    label: "SW5 – BCIT Burnaby Campus",
  },
  SW9: {
    lat: 49.24857386706732,
    lng: -123.00277286976299,
    label: "SW9 – BCIT Burnaby Campus",
  },
  SE16: {
    lat: 49.248810060183445,
    lng: -123.00104758185466,
    label: "SE16 – BCIT Burnaby Campus",
  },
  SE14: {
    lat: 49.249514440178004,
    lng: -123.00076881078813,
    label: "SE14 – BCIT Burnaby Campus",
  },
  SW3: {
    lat: 49.25003478934726,
    lng: -123.00265109072744,
    label: "SW3 – BCIT Burnaby Campus",
  },
  SW1: {
    lat: 49.25109603261354,
    lng: -123.00262682280521,
    label: "SW1 – BCIT Burnaby Campus",
  },
  NW4: {
    lat: 49.25212418563052,
    lng: -123.00326976780958,
    label: "NW4 – BCIT Burnaby Campus",
  },
  NW6: {
    lat: 49.25210241059102,
    lng: -123.00245339561788,
    label: "NW6 – BCIT Burnaby Campus",
  },
  NE20: {
    lat: 49.252051491297664,
    lng: -123.0015315081214,
    label: "NE20 – BCIT Burnaby Campus",
  },
  NE18: {
    lat: 49.252013040194235,
    lng: -123.00069151867292,
    label: "NE18 – BCIT Burnaby Campus",
  },
  NE16: {
    lat: 49.2520364171085,
    lng: -122.99994036276397,
    label: "NE16 – BCIT Burnaby Campus",
  },
  SE1: {
    lat: 49.25128025530573,
    lng: -122.99907982934992,
    label: "SE1 – BCIT Burnaby Campus",
  },
  SE6: {
    lat: 49.25089568676916,
    lng: -123.00039819908338,
    label: "SE6 – BCIT Burnaby Campus",
  },
  SE4: {
    lat: 49.25126941970805,
    lng: -123.00022249451371,
    label: "SE4 – BCIT Burnaby Campus",
  },
  NE28: {
    lat: 49.25246384618371,
    lng: -122.99990866575621,
    label: "NE28 – BCIT Burnaby Campus",
  },
  NE24: {
    lat: 49.25248648550547,
    lng: -123.00110345977615,
    label: "NE24 – BCIT Burnaby Campus",
  },
  NE5: {
    lat: 49.25251728677917,
    lng: -123.00234466790789,
    label: "NE5 – BCIT Burnaby Campus",
  },
  NE2: {
    lat: 49.25334784521614,
    lng: -123.0015244657414,
    label: "NE2 – BCIT Burnaby Campus",
  },
  NE4: {
    lat: 49.25329347474829,
    lng: -123.00067053457634,
    label: "NE4 – BCIT Burnaby Campus",
  },
  NE6: {
    lat: 49.253302428736994,
    lng: -122.99979438528591,
    label: "NE6 – BCIT Burnaby Campus",
  },
  NE8: {
    lat: 49.25330138275326,
    lng: -122.99923973369329,
    label: "NE8 – BCIT Burnaby Campus",
  },
  NE10: {
    lat: 49.253273576467045,
    lng: -122.99846166518044,
    label: "NE10 – BCIT Burnaby Campus",
  },
};

// This helps check and relay data to the map based on location data points
async function geocodeLocation(rawInput) {
  const query = (rawInput || "").trim();

  if (!query) {
    throw new Error("Missing location");
  }

  // 🔹 1. Campus short-code check
  const key = query.toUpperCase();
  const campusLoc = CAMPUS_LOCATIONS[key];

  if (campusLoc) {
    console.log("Using campus location for", key, campusLoc);
    return {
      lat: campusLoc.lat,
      lng: campusLoc.lng,
      place_name: campusLoc.label,
      locationName: key,
    };
  }

  console.log("Falling back to Mapbox geocoding for:", query);

  // 🔹 2. Fallback to Mapbox forward geocoding
  const url =
    "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
    encodeURIComponent(query) +
    ".json?access_token=" +
    mapboxgl.accessToken +
    "&limit=1";

  let resp;
  try {
    resp = await fetch(url);
  } catch (networkErr) {
    console.error("Network error calling Mapbox:", networkErr);
    throw new Error("Unable to contact geocoding service");
  }

  if (!resp.ok) {
    console.error("Mapbox HTTP error:", resp.status, await resp.text());
    throw new Error("Geocoding service error");
  }

  const data = await resp.json();

  if (!data.features || data.features.length === 0) {
    throw new Error("Location not found");
  }

  const feature = data.features[0];

  return {
    lng: feature.center[0],
    lat: feature.center[1],
    place_name: feature.place_name,
    locationName: query,
  };
}

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
        uploadedImageBase64 = resizeImage(
          img,
          MAX_IMAGE_WIDTH,
          MAX_IMAGE_HEIGHT
        );

        // Display the new, small preview image
        uploadBox.innerHTML = `<img src="${uploadedImageBase64}
          " alt="Image preview" style="width: 100%; height: 100%; object-fit: contain;">`;

        // Make the new image clickable to change it
        uploadBox.style.cursor = "pointer";
        uploadBox.addEventListener("click", () => fileInput.click());
      };
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

// 5. Add click listener for the 'Post' button, updated this to use mapbox/preset data set I created
submitBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to create a post.");
    return;
  }

  if (!uploadedImageBase64) {
    alert("Please upload an image before posting.");
    return;
  }

  if (!statusSelect) {
    console.error("statusSelect element not found in upload.js");
    alert("Internal error: status dropdown missing.");
    return;
  }

  if (!statusSelect.value) {
    alert("Please select whether the item is Lost or Found.");
    submitBtn.disabled = false;
    return;
  }

  // Safely read all values
  const itemValue = (itemInput?.value || "").trim();
  const descriptionValue = (descriptionInput?.value || "").trim();
  const hashtagsValue = (hashtagsInput?.value || "").trim();
  const locationText = (locationInput?.value || "").trim();

  if (!itemValue) {
    alert("Please enter an item name.");
    return;
  }

  if (!locationText) {
    alert("Please enter a location (e.g., NW1, SW2, or an address).");
    return;
  }

  submitBtn.disabled = true;

  try {
    // 🔹 Get campus or Mapbox coordinates
    const geo = await geocodeLocation(locationText);
    console.log("Using geocoded location:", geo);

    const postData = {
      ownerUid: user.uid,
      item: itemValue,
      status: statusSelect.value,
      description: descriptionValue, // FIXED
      hashtags: hashtagsValue,

      location: locationText,
      locationName: geo.locationName,
      geo: {
        lat: geo.lat,
        lng: geo.lng,
        place_name: geo.place_name,
      },

      imageBase64: uploadedImageBase64,
      createdAt: serverTimestamp(),

      // JORJA LOOK HERE!! NEW FIELDS I ADDED TO PULL POSTS FOR STUFF
      isActiveQuest: false,
      isCompletedQuest: false,
      helperUid: null,
    };

    // 🔹 Actually write to Firestore
    const docRef = await addDoc(collection(db, POSTS_COLLECTION), postData);
    console.log("Post saved to Firestore from upload.js with id:", docRef.id);

    // 🔹 Update user stats, then go back to main
    await awardForNewPost(user.uid);
    go();
  } catch (error) {
    console.error("Error creating post in upload.js:", error);
    alert(
      "There was a problem with the location/post. Try a campus code like NW1."
    );
    submitBtn.disabled = false;
  }
});
