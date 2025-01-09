import sys
sys.stdout.reconfigure(encoding='utf-8')

def calculate_maneuver(relative_velocity, distance, safety_distance=10):
    """
    Calculate ΔV (change in velocity) required for collision avoidance.

    Parameters:
        relative_velocity (float): Relative velocity between the satellites (km/s).
        distance (float): Current distance between the satellites (km).
        safety_distance (float): Minimum safety distance threshold (default: 10 km).

    Returns:
        float: ΔV in km/s required to avoid the collision.
    """
    if distance < safety_distance:
        delta_v = (safety_distance - distance) / relative_velocity
        return round(delta_v, 5)  # Round to 5 decimal places
    return 0  # No maneuver needed

if __name__ == "__main__":
    # Test the function with example values
    print("Maneuver ΔV:", calculate_maneuver(7.5, 8))
