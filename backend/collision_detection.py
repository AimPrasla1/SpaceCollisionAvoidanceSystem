import math
import joblib
from backend.orbit_calculator import get_live_positions
from backend.avoidance_maneuver import calculate_maneuver

model = joblib.load("data/model/collision_model.pkl")

def calculate_distance(pos1, pos2):
    return math.sqrt((pos1[0] - pos2[0]) ** 2 +
                     (pos1[1] - pos2[1]) ** 2 +
                     (pos1[2] - pos2[2]) ** 2)

def predict_collisions():
    satellites = get_live_positions()
    results = []
    for i, sat1 in enumerate(satellites):
        for j, sat2 in enumerate(satellites):
            if i < j:
                distance = calculate_distance(sat1["position"], sat2["position"])
                if distance < 10:
                    collision_risk = model.predict([[7.5, distance, 500, 500]])[0]
                    if collision_risk == 1:
                        results.append({
                            "satellite_1": sat1["name"],
                            "satellite_2": sat2["name"],
                            "distance": distance
                        })
    return results
