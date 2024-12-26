import requests

def fetch_tle_data():
    url = "https://celestrak.com/NORAD/elements/stations.txt"
    response = requests.get(url)
    if response.status_code == 200:
        with open("data/tle_data.txt", "w") as file:
            file.write(response.text)
        print("TLE data fetched successfully!")
    else:
        print(f"Failed to fetch TLE data. Status code: {response.status_code}")

if __name__ == "__main__":
    fetch_tle_data()
