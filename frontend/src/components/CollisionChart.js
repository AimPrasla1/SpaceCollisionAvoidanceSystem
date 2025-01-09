import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TextField,
  TablePagination,
} from "@mui/material";
import * as satellite from "satellite.js";

const CollisionChart = () => {
  // State to store satellite data and filtered results
  const [satelliteData, setSatelliteData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 50; // Number of rows per page

  // Fetch satellite data from the TLE API
  const fetchSatelliteData = async () => {
    const tleUrl = "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle";

    try {
      const response = await fetch(tleUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch TLE data");
      }

      const tleText = await response.text();
      const tleLines = tleText.trim().split("\n");

      const satellites = [];
      const now = new Date();

      // Parse TLE data and compute satellite positions
      for (let i = 0; i < tleLines.length; i += 3) {
        const name = tleLines[i].trim();
        const tleLine1 = tleLines[i + 1].trim();
        const tleLine2 = tleLines[i + 2].trim();

        try {
          const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
          const positionAndVelocity = satellite.propagate(satrec, now);
          const gmst = satellite.gstime(now);

          if (positionAndVelocity.position) {
            const { latitude, longitude, height } = satellite.eciToGeodetic(
              positionAndVelocity.position,
              gmst
            );

            satellites.push({
              name,
              lat: (latitude * 180) / Math.PI, // Convert radians to degrees
              lng: (longitude * 180) / Math.PI, // Convert radians to degrees
              alt: height * 0.62 / 1000, // Convert altitude from km to miles
            });
          }
        } catch (error) {
          console.warn(`Error processing satellite ${name}:`, error);
        }
      }

      // Enrich satellite data with collision risk
      const enrichedSatellites = satellites.map((sat, index) => {
        let closestDistance = Infinity;
        let closestSatellite = null;

        // Calculate distances to other satellites
        satellites.forEach((otherSat, otherIndex) => {
          if (index !== otherIndex) {
            const distance = Math.sqrt(
              Math.pow(sat.lat - otherSat.lat, 2) +
                Math.pow(sat.lng - otherSat.lng, 2) +
                Math.pow(sat.alt - otherSat.alt, 2)
            );

            if (distance < closestDistance) {
              closestDistance = distance;
              closestSatellite = otherSat;
            }
          }
        });

        return {
          ...sat,
          collisionRisk: closestDistance < 0.1 ? Math.ceil((0.1 - closestDistance) * 50) : 1, // Compute collision risk
          closestSatellite: closestDistance < 0.1 ? closestSatellite : null, // Identify the closest satellite
        };
      });

      setSatelliteData(enrichedSatellites);
      setFilteredData(enrichedSatellites);
    } catch (error) {
      console.error("Error fetching satellite data:", error.message);
    }
  };

  // Fetch data on component mount and refresh every 3 seconds
  useEffect(() => {
    fetchSatelliteData();
    const interval = setInterval(fetchSatelliteData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filter satellite data based on search query
  useEffect(() => {
    const filtered = satelliteData.filter((sat) =>
      sat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchQuery, satelliteData]);

  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <div style={{ width: "90%", margin: "0 auto", textAlign: "center" }}>
      <h2 style={{ color: "white" }}>Starlink Satellite Information</h2>

      {/* Search Bar */}
      <TextField
        placeholder="Search Satellites By Number"
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          marginBottom: "20px",
          width: "100%",
          color: "white",
          border: "1px solid lightgrey",
          borderRadius: "5px",
        }}
        InputProps={{
          style: { color: "white" },
          disableUnderline: true,
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "lightgrey",
            },
            "&:hover fieldset": {
              borderColor: "lightgrey",
            },
            "&.Mui-focused fieldset": {
              borderColor: "lightgrey",
            },
          },
        }}
      />

      {/* Table to Display Satellite Data */}
      <Paper style={{ padding: "20px", backgroundColor: "#333", color: "white" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: "bold", color: "white" }}>Name</TableCell>
              <TableCell style={{ fontWeight: "bold", color: "white" }}>Latitude</TableCell>
              <TableCell style={{ fontWeight: "bold", color: "white" }}>Longitude</TableCell>
              <TableCell style={{ fontWeight: "bold", color: "white" }}>Altitude (miles)</TableCell>
              <TableCell style={{ fontWeight: "bold", color: "white" }}>Collision Risk</TableCell>
              <TableCell style={{ fontWeight: "bold", color: "white" }}>Colliding Object</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((sat, index) => (
                <TableRow key={index}>
                  <TableCell style={{ color: "white" }}>{sat.name}</TableCell>
                  <TableCell style={{ color: "white" }}>{sat.lat.toFixed(2)}</TableCell>
                  <TableCell style={{ color: "white" }}>{sat.lng.toFixed(2)}</TableCell>
                  <TableCell style={{ color: "white" }}>{sat.alt.toFixed(2)}</TableCell>
                  <TableCell style={{ color: "white" }}>{sat.collisionRisk}</TableCell>
                  <TableCell style={{ color: "red" }}>
                    {sat.collisionRisk >= 3 && sat.closestSatellite
                      ? sat.closestSatellite.name
                      : "None"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[rowsPerPage]}
        />
      </Paper>
    </div>
  );
};

export default CollisionChart;
