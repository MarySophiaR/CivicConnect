import { useEffect, useRef } from "react";

/* =========================================================
   MAP TILE CONFIG
   Reads the MapTiler key from Vite's import.meta.env first
   (VITE_MAPTILER_KEY in your frontend .env file). Falls back
   to process.env safely (guarded with typeof) for CRA-based
   setups, and to plain OpenStreetMap tiles if no key exists.
========================================================= */
const MAPTILER_KEY =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_MAPTILER_KEY) ||
  (typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_MAPTILER_KEY) ||
  "";

const TILE_URL = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const TILE_ATTRIBUTION = MAPTILER_KEY
  ? '\u00a9 <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> \u00a9 OpenStreetMap contributors'
  : "&copy; OpenStreetMap contributors";

/* =========================================================
   LEAFLET CDN LOADER
========================================================= */
let leafletLoadingPromise = null;

function loadLeaflet() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("No window available"));
  }

  if (window.L) {
    return Promise.resolve(window.L);
  }

  if (leafletLoadingPromise) {
    return leafletLoadingPromise;
  }

  leafletLoadingPromise = new Promise((resolve, reject) => {
    const cssId = "leaflet-css-cdn";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const scriptId = "leaflet-js-cdn";
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.L));
      existingScript.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://unpkg.com/leaflet/dist/leaflet.js";
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return leafletLoadingPromise;
}

/* =========================================================
   MAP PREVIEW COMPONENT
   - latitude / longitude: required, real coordinates only
   - label: text shown in the marker popup
   - showNavigate: adds a "Navigate to this location" button
     (Google Maps deep link) — use true for officer view,
     false/omitted for citizen view
========================================================= */
function MapPreview({ latitude, longitude, label, showNavigate = false }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const lat = Number(latitude);
  const lng = Number(longitude);

  const hasCoords =
    latitude !== null &&
    latitude !== undefined &&
    latitude !== "" &&
    longitude !== null &&
    longitude !== undefined &&
    longitude !== "" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng);

  useEffect(() => {
    if (!hasCoords) {
      return undefined;
    }

    let isMounted = true;

    loadLeaflet()
      .then((L) => {
        if (!isMounted || !mapContainerRef.current) {
          return;
        }

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current).setView([lat, lng], 15);
        mapInstanceRef.current = map;

        L.tileLayer(TILE_URL, {
          attribution: TILE_ATTRIBUTION,
        }).addTo(map);

        L.marker([lat, lng])
          .addTo(map)
          .bindPopup(label || "Complaint location")
          .openPopup();
      })
      .catch((error) => {
        console.error("Failed to load map:", error);
      });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCoords, lat, lng, label]);

  if (!hasCoords) {
    return null;
  }

  const navigateUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div style={{ marginTop: "14px" }}>
      <div
        ref={mapContainerRef}
        style={{
          height: "260px",
          width: "100%",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      />

      {showNavigate && (
        <a
          href={navigateUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            marginTop: "10px",
            padding: "8px 16px",
            background: "#0055A4",
            color: "#fff",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          Navigate to Site
        </a>
      )}
    </div>
  );
}

export default MapPreview;