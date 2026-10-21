from typing import Literal, Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from services.gemini_service import get_gemini_response
from services.weather_service import weather_service, WEATHER_CODES

router = APIRouter(prefix="/api/irrigation", tags=["Smart Irrigation"])


class IrrigationAdviceRequest(BaseModel):
    location: str = Field(min_length=2, max_length=120)
    crop: str = Field(min_length=1, max_length=80)
    soil: str = Field(min_length=1, max_length=80)
    area_hectares: float = Field(gt=0, le=10000)
    growth_stage: str = Field(min_length=1, max_length=80)
    irrigation_method: str = Field(min_length=1, max_length=80)
    soil_moisture_percent: Optional[float] = Field(default=None, ge=0, le=100)
    language: Literal["en", "hi"] = "en"


def fetch_live_weather(location: str) -> dict:
    result = {
        "available": False,
        "source": "unavailable",
        "location": location,
        "message": "Live weather could not be confirmed.",
        "current": None,
        "forecast": [],
    }

    try:
        lat, lon = weather_service._geocode(location)

        if lat is None or lon is None:
            result["message"] = "Location not found. Check the spelling."
            return result

        raw = weather_service._fetch_openmeteo(lat, lon)
        current = raw.get("current_weather") if raw else None
        daily = raw.get("daily") if raw else None

        if not isinstance(current, dict) or not isinstance(daily, dict):
            result["message"] = "The weather provider returned no usable data."
            return result

        if current.get("temperature") is None or current.get("time") is None:
            result["message"] = "The weather provider returned incomplete observations."
            return result

        code = current.get("weathercode")
        try:
            code = int(code) if code is not None else -1
        except (TypeError, ValueError):
            code = -1

        condition, description = WEATHER_CODES.get(
            code, ("Unknown", "description unavailable")
        )

        hourly = raw.get("hourly") or {}
        humidity_values = hourly.get("relativehumidity_2m") or []
        hourly_times = hourly.get("time") or []
        current_time = current.get("time")
        humidity = None

        if current_time in hourly_times:
            index = hourly_times.index(current_time)
            if index < len(humidity_values):
                humidity = humidity_values[index]
        elif humidity_values:
            humidity = humidity_values[0]

        dates = daily.get("time") or []
        rain = daily.get("precipitation_sum") or []
        highs = daily.get("temperature_2m_max") or []
        lows = daily.get("temperature_2m_min") or []

        forecast = []
        for index, date in enumerate(dates[:5]):
            forecast.append({
                "date": date,
                "precipitation_mm": rain[index] if index < len(rain) else None,
                "temperature_max_c": highs[index] if index < len(highs) else None,
                "temperature_min_c": lows[index] if index < len(lows) else None,
            })

        result.update({
            "available": True,
            "source": "Open-Meteo",
            "message": "Weather data retrieved successfully.",
            "current": {
                "temperature_c": current.get("temperature"),
                "humidity_percent": humidity,
                "wind_speed_kmh": current.get("windspeed"),
                "condition": condition,
                "description": description,
                "observed_at": current_time,
            },
            "forecast": forecast,
        })

    except Exception as exc:
        print(f"[SMART IRRIGATION] Weather error: {type(exc).__name__}")
        result["message"] = "Live weather is temporarily unavailable."

    return result


@router.get("/weather")
def get_irrigation_weather(
    location: str = Query(min_length=2, max_length=120)
):
    return fetch_live_weather(location.strip())


@router.post("/advice")
def get_irrigation_advice(request: IrrigationAdviceRequest):
    location = request.location.strip()
    weather = fetch_live_weather(location)

    moisture = (
        "Actual soil moisture is unknown; no measurement was supplied."
        if request.soil_moisture_percent is None
        else f"Manual moisture observation: {request.soil_moisture_percent}%. Not a sensor reading."
    )

    language = "Hindi" if request.language == "hi" else "English"

    prompt = f"""
You are an agricultural irrigation advisory assistant for farmers in India.
Respond in {language} with 3-5 concise, practical points.

Location: {location}
Crop: {request.crop}
Soil: {request.soil}
Area: {request.area_hectares} hectares
Growth stage: {request.growth_stage}
Irrigation method: {request.irrigation_method}
Soil moisture: {moisture}
Weather data: {weather}

Do not invent weather, rainfall, irrigation duration, or water savings.
Clearly state when weather data is unavailable.
Suggest checking field conditions before irrigation.
Explain uncertainty. This is preliminary guidance, not a validated agronomic prescription.
"""

    try:
        reply = get_gemini_response(prompt, temperature=0.4, use_cache=True)
        unavailable_markers = (
            "advisory generation temporarily unavailable",
            "please set gemini_api_key",
        )
        ai_available = bool(reply and reply.strip()) and not any(
            marker in reply.lower() for marker in unavailable_markers
        )

        if not ai_available:
            reply = (
                "AI advice is temporarily unavailable. Verify local weather "
                "and field conditions before deciding when to irrigate."
            )

    except Exception as exc:
        print(f"[SMART IRRIGATION] AI error: {type(exc).__name__}")
        ai_available = False
        reply = (
            "AI advice is temporarily unavailable. Verify local weather "
            "and field conditions before deciding when to irrigate."
        )

    return {
        "location": location,
        "weather": weather,
        "ai_available": ai_available,
        "advice": reply,
        "disclaimer": (
            "Preliminary guidance only. No physical soil-moisture sensor is connected."
        ),
    }
