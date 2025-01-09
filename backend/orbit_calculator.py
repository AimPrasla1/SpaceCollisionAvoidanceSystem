from skyfield.api import EarthSatellite, load, utc
from datetime import datetime
import numpy as np

def calculate_orbit(tle_lines):
    """
    Calculate the x, y, z position of a satellite based on TLE data.
    """
    try:
        satellite = EarthSatellite(tle_lines[1], tle_lines[2], tle_lines[0], load.timescale())
        current_time = datetime.now(utc)
        position = satellite.at(load.timescale().utc(current_time)).position.km  # Returns [x, y, z] in km
        return position
    except Exception as e:
        print(f"Error calculating orbit for {tle_lines[0]}: {e}")
        return None

def get_live_positions():
    """
    Get live positions for all satellites from TLE data.
    """
    try:
        with open("data/tle_data.txt", "r") as file:
            tle_data = file.read().strip().split("\n")
            tle_blocks = [tle_data[i:i+3] for i in range(0, len(tle_data), 3)]
            positions = []

            for tle in tle_blocks:
                if len(tle) == 3:
                    position = calculate_orbit(tle)
                    if position is not None and not np.any(np.isnan(position)):
                        positions.append({"name": tle[0].strip(), "position": position.tolist()})
            return positions
    except FileNotFoundError:
        print("TLE data file not found. Please run 'tle_data_fetcher.py' to fetch the data.")
        return []
