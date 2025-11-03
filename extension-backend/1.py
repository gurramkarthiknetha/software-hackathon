import requests

# Replace with your actual API key
API_KEY = "MT8EYPBK4D2BB417YDKQFNHRDR"

# Example: Estimate emissions for 1 kWh of electricity
url = "https://api.climatiq.io/estimate"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

data = {
    "emission_factor": {
        "activity_id": "electricity-energy_source_grid_mix",
        "region": "US",
        "unit": "kWh"
    },
    "parameters": {
        "energy": 1
    }
}

response = requests.post(url, headers=headers, json=data)

if response.status_code == 200:
    print("✅ API key works! Response:")
    print(response.json())
else:
    print("❌ Something went wrong:")
    print(f"Status code: {response.status_code}")
    print(response.text)