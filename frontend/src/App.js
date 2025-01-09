import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CollisionChart from "./components/CollisionChart";
import EarthView from "./components/EarthView";

function App() {
  const [data, setData] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/predict-collisions");
        setData(response.data.collisions); // Update state with fetched data
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading collision data...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Router>
      <div className="App" style={{ padding: "20px" }}>
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            backgroundColor: "#282c34",
            padding: "10px",
          }}
        >
          <h1 style={{ margin: 0, color: "white" }}>Collision Monitoring System</h1>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link to="/" style={{ color: "white", textDecoration: "none" }}>
              Collision Chart
            </Link>
            <Link to="/earth-view" style={{ color: "white", textDecoration: "none" }}>
              3D Earth View
            </Link>
          </div>
        </nav>
        <Routes>
          <Route
            path="/"
            element={
              data && data.length > 0 ? (
                <CollisionChart data={data} />
              ) : (
                <p>No collision data available.</p>
              )
            }
          />
          <Route path="/earth-view" element={<EarthView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
