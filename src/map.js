// --- map.js ---

import mapboxgl from "mapbox-gl";
import { db } from "./firebase.js";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

// Token from .env (Vite): VITE_MAPBOX_TOKEN=...
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// Initialize map focused on BCIT
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: [-123.00088, 49.25082], // campus area
  zoom: 15,
});

async function loadPosts() {
  const q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc"),
    limit(300)
  );

  const snap = await getDocs(q);

  snap.forEach((docSnap) => {
    const p = docSnap.data();
    const postId = docSnap.id;

    // Only show posts with coordinates
    if (p?.geo?.lat && p?.geo?.lng) {
      // --- Marker dot ---
      const el = document.createElement("div");
      el.style.width = "18px";
      el.style.height = "18px";
      el.style.borderRadius = "50%";
      el.style.background = "#ffea00";
      el.style.border = "2px solid #000";
      el.title = `${p.item || "Item"} @ ${p.locationName || ""}`;

      // --- Popup content (DOM instead of raw HTML so we can attach events) ---
      const popupDiv = document.createElement("div");

      popupDiv.innerHTML = `
        <strong>${p.item || "Item"}</strong><br/>
        ${p.description || ""}<br/>
        <small>${p.locationName || p.geo?.place_name || ""}</small><br/>
      `;

      // View Post button
      const btn = document.createElement("button");
      btn.textContent = "View Item";
      btn.className = "map-popup-button";
      btn.addEventListener("click", () => {
        window.location.href = `details.html?postId=${postId}`;
      });

      popupDiv.appendChild(btn);

      // --- Attach marker + popup to map ---
      new mapboxgl.Marker(el)
        .setLngLat([p.geo.lng, p.geo.lat])
        .setPopup(new mapboxgl.Popup().setDOMContent(popupDiv))
        .addTo(map);
    }
  });
}

map.on("load", loadPosts);
