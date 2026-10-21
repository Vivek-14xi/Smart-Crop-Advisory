"""
Crop suitability engine.

Scores represent matching against available database metadata.
They are NOT yield probabilities or scientifically validated
agronomic suitability percentages.
"""

from typing import Any, Dict, List, Optional
import math
import re


WEIGHTS = {
    "soil": 35,
    "season": 25,
    "location": 20,
    "temperature": 20,
}


def _normalize(value: Any) -> str:
    """Normalize text for matching."""
    if value is None:
        return ""

    return re.sub(r"\s+", " ", str(value).strip().casefold())


def _normalize_soil(value: Any) -> str:
    """Normalize common soil-name variants without guessing soil type."""
    soil = _normalize(value)

    aliases = {
        "sandy loam": "sandy loamy",
        "sandy-loam": "sandy loamy",
        "black": "black soil",
        "red": "red soil",
        "alluvial soil": "alluvial",
        "clayey": "clay",
    }

    return aliases.get(soil, soil)


def _temperature_range(crop: Dict[str, Any]) -> Optional[tuple]:
    """Return a valid crop temperature range, if available."""
    value = crop.get("temperature_range")

    if not isinstance(value, (list, tuple)) or len(value) < 2:
        return None

    try:
        minimum = float(value[0])
        maximum = float(value[1])

        if not math.isfinite(minimum) or not math.isfinite(maximum):
            return None

        if minimum > maximum:
            return None

        return minimum, maximum
    except (TypeError, ValueError):
        return None


def evaluate_crop(
    crop: Dict[str, Any],
    soil_type: Optional[str],
    location: Optional[str],
    season: Optional[str],
    temperature: Optional[float],
) -> Dict[str, Any]:
    """
    Score one crop using available metadata.

    Missing temperature data is omitted from the denominator.
    Soil, season, and location are compared with the crop database.
    """
    requested_soil = _normalize_soil(soil_type)
    requested_location = _normalize(location)
    requested_season = _normalize(season)

    crop_soils = {
        _normalize_soil(item)
        for item in crop.get("soil_types", [])
        if item is not None
    }

    crop_states = {
        _normalize(item)
        for item in crop.get("states", [])
        if item is not None
    }

    crop_seasons = {
        _normalize(item)
        for item in crop.get("seasons", [])
        if item is not None
    }

    soil_match = (
        bool(requested_soil)
        and requested_soil in crop_soils
    )

    season_match = (
        bool(requested_season)
        and (
            requested_season in crop_seasons
            or "year-round" in crop_seasons
        )
    )

    # State matching is metadata matching, not proof that cultivation
    # is impossible outside the listed states.
    location_match = None

    if requested_location and crop_states:
        location_match = any(
            state == requested_location
            or (
                len(state) >= 3
                and state in requested_location
            )
            for state in crop_states
        )

    temp_range = _temperature_range(crop)
    temperature_match = None

    if temperature is not None and temp_range is not None:
        temperature_match = (
            temp_range[0] <= temperature <= temp_range[1]
        )

    factors = {
        "soil": soil_match,
        "season": season_match,
        "location": location_match,
        "temperature": temperature_match,
    }

    reasons = []
    warnings = []
    weighted_score = 0
    available_weight = 0

    if requested_soil:
        available_weight += WEIGHTS["soil"]

        if soil_match:
            weighted_score += WEIGHTS["soil"]
            reasons.append("Soil type matches the available crop database.")
        else:
            warnings.append(
                "Soil compatibility is not confirmed by the crop database."
            )

    if requested_season:
        available_weight += WEIGHTS["season"]

        if season_match:
            weighted_score += WEIGHTS["season"]
            reasons.append("Season matches the available crop database.")
        else:
            warnings.append(
                "The selected season is not listed for this crop."
            )

    if location_match is not None:
        available_weight += WEIGHTS["location"]

        if location_match:
            weighted_score += WEIGHTS["location"]
            reasons.append(
                "Location matches the crop database's state list."
            )
        else:
            warnings.append(
                "This state is not listed in the available crop database."
            )

    if temperature is not None and temp_range is not None:
        available_weight += WEIGHTS["temperature"]

        if temperature_match:
            weighted_score += WEIGHTS["temperature"]
            reasons.append(
                "Temperature is within the crop database's listed range."
            )
        else:
            warnings.append(
                "Temperature is outside the crop database's listed range."
            )

    score = (
        round(weighted_score / available_weight * 100)
        if available_weight
        else None
    )

    if not requested_soil:
        warnings.append("Soil type was not provided.")

    if not requested_season:
        warnings.append("Season was not provided.")

    if temperature is None:
        warnings.append(
            "Temperature compatibility could not be evaluated."
        )
    elif temp_range is None:
        warnings.append(
            "A valid temperature range is unavailable for this crop."
        )

    if location_match is None:
        warnings.append(
            "Location compatibility could not be verified."
        )

    return {
        "name": crop.get("name", "Unknown"),
        "local_name": crop.get("local_name", ""),
        "score": score,
        "suitability_score": score,
        "score_type": "metadata_match_percentage",
        "score_limitations": (
            "This score reflects matching against available database "
            "metadata. It is not a yield prediction or a validated "
            "agronomic suitability probability."
        ),
        "growing_duration": crop.get("growing_duration", ""),
        "rainfall_min": crop.get("rainfall_min"),
        "reasons": reasons,
        "warnings": warnings,
        "matching_factors": factors,
    }


def rank_crops(
    crops: List[Dict[str, Any]],
    soil_type: Optional[str],
    location: Optional[str],
    season: Optional[str],
    temperature: Optional[float],
    limit: int = 8,
) -> List[Dict[str, Any]]:
    """
    Rank crops using metadata matches.

    Crops are not removed because of market price trends.
    A match score alone must not be interpreted as proof that a
    crop is agronomically suitable for a particular farm.
    """
    evaluated = []

    for crop in crops:
        if not isinstance(crop, dict) or not crop.get("name"):
            continue

        result = evaluate_crop(
            crop=crop,
            soil_type=soil_type,
            location=location,
            season=season,
            temperature=temperature,
        )

        # Do not present crops with no matching soil or season
        # evidence as confirmed recommendations.
        factors = result["matching_factors"]

        if factors["soil"] is not True or factors["season"] is not True:
            continue

        evaluated.append(result)

    evaluated.sort(
        key=lambda item: (
            item["score"] if item["score"] is not None else -1,
            item["name"].casefold(),
        ),
        reverse=True,
    )

    return evaluated[:max(1, min(int(limit), 20))]