import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai

# Load the project's root .env file
ROOT_ENV = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(ROOT_ENV)

API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

print(f"API Key loaded: {'Yes' if API_KEY else 'No'}")
print()

if not API_KEY:
    print("ERROR: GEMINI_API_KEY was not loaded from the project root .env")
    raise SystemExit(1)

try:
    client = genai.Client(api_key=API_KEY)

    print("Checking Gemini API connectivity...")
    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents="Say hello in one word."
    )

    print("SUCCESS: Gemini API is responding.")
    print("Response:", (response.text or "").strip())

except Exception as e:
    print(f"Gemini API test failed: {type(e).__name__}: {e}")
    raise SystemExit(1)

