// EarthView.js
import React, { useEffect, useState, useRef } from "react";
import Globe from "react-globe.gl";
import * as satellite from "satellite.js";

const EarthView = () => {
  const globeRef = useRef(null); // Reference to the Globe component
  const [satelliteData, setSatelliteData] = useState([]); // State to hold satellite data
  const [hoveredSatellite, setHoveredSatellite] = useState(null); // State for displaying hovered satellite

  // Fetch TLE data
  const fetchTLEData = async () => {
    const tleUrl = "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle";
    try {
      const response = await fetch(tleUrl);
      const tleText = await response.text();
      const tleLines = tleText.trim().split("\n");

      const satellites = [];
      for (let i = 0; i < tleLines.length; i += 3) {
        const name = tleLines[i].trim();
        const tleLine1 = tleLines[i + 1].trim();
        const tleLine2 = tleLines[i + 2].trim();
        satellites.push({ name, tleLine1, tleLine2 });
      }
      return satellites;
    } catch (error) {
      console.error("Failed to fetch TLE data:", error);
      return [];
    }
  };

  // Calculate satellite positions and detect collisions
  const updateSatellitePositionsWithCollisions = (satellites) => {
    const now = new Date();
    const updatedSatellites = satellites
      .map(({ name, tleLine1, tleLine2 }) => {
        const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
        const positionAndVelocity = satellite.propagate(satrec, now);

        if (positionAndVelocity.position) {
          const { latitude, longitude, height } = satellite.eciToGeodetic(
            positionAndVelocity.position,
            satellite.gstime(now)
          );

          return {
            name,
            lat: (latitude * 180) / Math.PI, // Convert radians to degrees
            lng: (longitude * 180) / Math.PI, // Convert radians to degrees
            alt: (height / 1000) * 0.621371, // Convert altitude to miles
            eciPosition: positionAndVelocity.position, // Store ECI coordinates
            isColliding: false, // Default collision status
            collidingWith: null, // Default colliding satellite
          };
        }
        return null;
      })
      .filter((sat) => sat !== null);

    // Detect collisions
    for (let i = 0; i < updatedSatellites.length; i++) {
      for (let j = i + 1; j < updatedSatellites.length; j++) {
        const sat1 = updatedSatellites[i];
        const sat2 = updatedSatellites[j];

        const distance = Math.sqrt(
          Math.pow(sat2.eciPosition.x - sat1.eciPosition.x, 2) +
          Math.pow(sat2.eciPosition.y - sat1.eciPosition.y, 2) +
          Math.pow(sat2.eciPosition.z - sat1.eciPosition.z, 2)
        ) / 1609.34; // Convert meters to miles

        // Check collision condition
        if (distance <= 5) {
          sat1.isColliding = true;
          sat1.collidingWith = sat2.name;
          sat2.isColliding = true;
          sat2.collidingWith = sat1.name;
        }
      }
    }

    setSatelliteData(updatedSatellites); // Update state
  };

  // Fetch and update satellite data every 3 seconds
  useEffect(() => {
    const loadSatellites = async () => {
      const satellites = await fetchTLEData();
      const updatePositions = () => {
        updateSatellitePositionsWithCollisions(satellites);
      };

      updatePositions();
      const interval = setInterval(updatePositions, 3000); // Update every 3 seconds
      return () => clearInterval(interval);
    };

    loadSatellites();
  }, []);

  return (
    <div style={{ height: "100vh", backgroundColor: "#000" }}>
      <Globe
        ref={globeRef}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-day.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={satelliteData} // Display all satellites
        pointLat={(d) => d.lat} // Latitude
        pointLng={(d) => d.lng} // Longitude
        pointAltitude={(d) => d.alt / 10000} // Normalize altitude for visualization
        pointColor={(d) => (d.isColliding ? "rgba(255, 0, 0, 1)" : "rgba(255, 255, 255, 1)")} // Red for colliding satellites
        pointRadius={0.3} // Adjust point size
        showAtmosphere={true}
        atmosphereColor="rgba(173, 216, 230, 0.5)"
        atmosphereAltitude={0.15}
        onPointHover={(point) => setHoveredSatellite(point ? point.name : null)} // Show satellite name on hover
      />
      {hoveredSatellite && (
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            pointerEvents: "none",
          }}
        >
          {hoveredSatellite}
        </div>
      )}
    </div>
  );
};

export default EarthView;
