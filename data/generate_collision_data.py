import pandas as pd
import numpy as np

def generate_collision_data(num_samples=1000):
    # Randomly generate data within realistic ranges
    relative_velocity = np.random.uniform(0.5, 15, num_samples)  # km/s
    distance = np.random.uniform(1, 50, num_samples)  # km
    sat_mass = np.random.uniform(100, 10000, num_samples)  # kg
    debris_mass = np.random.uniform(0.1, 1000, num_samples)  # kg
    
    # Collision risk: 1 if distance < 10 km, else 0
    collision_risk = (distance < 10).astype(int)
    
    data = pd.DataFrame({
        'relative_velocity': relative_velocity,
        'distance': distance,
        'sat_mass': sat_mass,
        'debris_mass': debris_mass,
        'collision_risk': collision_risk
    })
    
    return data

collision_data = generate_collision_data(num_samples=1000)
collision_data.to_csv("data/collision_data.csv", index=False)
print("Collision data generated and saved to 'data/collision_data.csv'")
