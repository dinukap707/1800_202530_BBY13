// /src/uploadFirebase.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

console.log("Post saved to Firestore.");
document.dispatchEvent(new CustomEvent("post:saved"));

const submitBtn = document.getElementById("submitBtn");
const locationEl = document.querySelector(".form-group.locations input");
const itemEl = document.querySelector(".form-group.item input");
const descEl = document.querySelector(".form-group.description input");
const tagsEl = document.querySelector(".form-group.hashtags input");

let currentUser = null;
onAuthStateChanged(auth, (u) => (currentUser = u || null));

const MAPBOX_TOKEN =
  import.meta.env?.VITE_MAPBOX_TOKEN ||
  "pk.eyJ1IjoiZHBpbm5hbGEiLCJhIjoiY21odnF2NDJmMGQ5NjJrcHE4emw0NWtrNCJ9.M9h0yKYVz5fPbwqftQ_uNA";

async function geocode(locationName) {
  if (!MAPBOX_TOKEN || !locationName) return null;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    locationName
  )}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
  const res = await fetch(url);
  const data = await res.json();
  const f = data?.features?.[0];
  if (f?.center?.length === 2) {
    const [lng, lat] = f.center;
    return { lat, lng, place_name: f.place_name };
  }
  return null;
}

submitBtn?.addEventListener("click", async (e) => {
  e.preventDefault();
  const item = itemEl.value.trim();
  const description = descEl.value.trim();
  const hashtags = tagsEl.value.trim();
  const locationName = locationEl.value.trim();

  if (!item || !locationName) return;

  try {
    const geo = await geocode(locationName);

    // Add post data to Firestore
    await addDoc(collection(db, "posts"), {
      userId: currentUser?.uid || null,
      item,
      description,
      hashtags,
      locationName,
      geo,
      createdAt: serverTimestamp(),
    });

    console.log("Post saved to Firestore.");

    // Optional short delay before redirect (for smoother UX)
    setTimeout(() => {
      window.location.href = "main.html";
    }, 800);
  } catch (err) {
    console.error("Firestore save failed:", err);
    alert("Failed to save post. Please try again.");
  }
});
