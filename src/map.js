import mapboxgl from "mapbox-gl";
import { db } from "./firebase.js";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

// Token from .env (Vite): VITE_MAPBOX_TOKEN=pk.xxx
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// start map focused on BCIT
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: [-123.00088, 49.25082], // e.g. NW1 coords
  zoom: 15, // closer zoom for campus
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
    // Only show posts with coordinates (we saved these at upload time if token was set)
    if (p?.geo?.lat && p?.geo?.lng) {
      // simple custom marker, sets basic elements for the stock map
      const el = document.createElement("div");
      el.style.width = "18px";
      el.style.height = "18px";
      el.style.borderRadius = "50%";
      el.style.background = "#ffea00";
      el.style.border = "2px solid #000";
      el.title = `${p.item || "Item"} @ ${p.locationName || ""}`;

      new mapboxgl.Marker(el)
        .setLngLat([p.geo.lng, p.geo.lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <strong>${p.item || "Item"}</strong><br/>
            ${p.description || ""}<br/>
            <small>${p.locationName || p.geo?.place_name || ""}</small>
          `)
        )
        .addTo(map);
    }
  });
}

map.on("load", loadPosts);
