import sys
sys.stdout.reconfigure(encoding='utf-8')

def calculate_maneuver(relative_velocity, distance):
    """
    Calculate ΔV required for collision avoidance.
    """
    safety_distance = 10  # km
    if distance < safety_distance:
        delta_v = (safety_distance - distance) / relative_velocity
        return delta_v
    return 0  # No maneuver needed

if __name__ == "__main__":
    print("Maneuver ΔV:", calculate_maneuver(7.5, 8))
