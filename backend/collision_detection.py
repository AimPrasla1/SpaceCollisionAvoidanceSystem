import math
import joblib
from backend.orbit_calculator import get_live_positions
from backend.avoidance_maneuver import calculate_maneuver

# Load the trained ML model for collision risk prediction
model = joblib.load("data/model/collision_model.pkl")

def calculate_distance(pos1, pos2):
    """
    Calculate the Euclidean distance between two 3D positions.
    """
    return math.sqrt((pos1[0] - pos2[0]) ** 2 +
                     (pos1[1] - pos2[1]) ** 2 +
                     (pos1[2] - pos2[2]) ** 2)

def predict_collisions():
    """
    Predict potential collisions and calculate necessary maneuvers.

    Returns:
        list: A list of collision details with descriptive fields.
    """
    satellites = get_live_positions()
    results = []

    for i, sat1 in enumerate(satellites):
        for j, sat2 in enumerate(satellites):
            if i < j:
                distance = calculate_distance(sat1["position"], sat2["position"])
                relative_velocity = 7.5  # Assume constant relative velocity in km/s

                # Predict collision risk using the ML model
                collision_risk = model.predict([[relative_velocity, distance, 500, 500]])[0]

                # If a collision is predicted, calculate the required maneuver
                if collision_risk == 1 and distance < 10:  # Threshold = 10 km
                    delta_v = calculate_maneuver(relative_velocity, distance)
                    results.append({
                        "satellite_1": sat1["name"],
                        "satellite_2": sat2["name"],
                        "collision_details": {
                            "distance": {
                                "value_km": round(distance, 5),
                                "description": "Closest approach distance between the two satellites in kilometers."
                            },
                            "maneuver": {
                                "delta_v_km_per_s": delta_v,
                                "description": f"Change in velocity required for {sat1['name']} to avoid a potential collision with {sat2['name']}."
                            }
                        }
                    })
    return results
