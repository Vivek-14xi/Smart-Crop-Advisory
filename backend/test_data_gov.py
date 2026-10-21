import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("DATA_GOV_API_KEY")
RESOURCE_ID = "35985678-0d79-46b4-9ed6-6f13308a1d24"

url = f"https://api.data.gov.in/resource/{RESOURCE_ID}"

params = {
    "api-key": API_KEY,
    "format": "json",
    "limit": 1,
}

try:
    print("Testing Data.gov.in API...")

    response = requests.get(
        url,
        params=params,
        timeout=(10, 60)
    )

    print("HTTP Status:", response.status_code)
    print("Content-Type:", response.headers.get("Content-Type"))
    print("Response:", response.text[:1500])

except requests.exceptions.Timeout:
    print("Request timed out. API server ne time par response nahi diya.")

except requests.exceptions.ConnectionError:
    print("Connection error. API server tak request nahi pahunchi.")

except requests.exceptions.RequestException as error:
    print("Request error:", error)