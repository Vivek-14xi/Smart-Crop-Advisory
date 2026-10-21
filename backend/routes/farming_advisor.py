from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.gemini_service import get_gemini_response

router = APIRouter(
    prefix="/api/farming-advisor",
    tags=["AI Farming Advisor"]
)


class FarmingAdvisorRequest(BaseModel):
    crop: str = Field(min_length=1, max_length=100)
    growth_stage: str = Field(min_length=1, max_length=100)
    location: str = Field(default="Not provided", max_length=150)
    soil_type: str = Field(default="Not provided", max_length=100)
    irrigation: str = Field(default="Not provided", max_length=100)
    problem: str = Field(min_length=5, max_length=3000)
    language: str = Field(default="English", max_length=40)


class FarmingAdvisorResponse(BaseModel):
    advisory: str


@router.post("/generate", response_model=FarmingAdvisorResponse)
def generate_farming_advisory(request: FarmingAdvisorRequest):
    prompt = f"""
You are an agricultural advisory assistant helping farmers in India.

Provide practical, cautious, crop-specific guidance using the details below.

CROP: {request.crop}
GROWTH STAGE: {request.growth_stage}
LOCATION: {request.location}
SOIL TYPE: {request.soil_type}
IRRIGATION METHOD: {request.irrigation}
FARMER'S QUESTION OR PROBLEM: {request.problem}
RESPONSE LANGUAGE: {request.language}

Structure your answer with these headings:
1. Situation Assessment
2. Recommended Actions
3. Irrigation and Nutrient Considerations
4. Precautions
5. What to Observe Next
6. Follow-up Information Needed

Instructions:
- Use clear, practical language suitable for Indian farmers.
- Give numbered actions in priority order.
- Do not invent soil test results, weather measurements, pest identification,
  product labels, government approvals, or guaranteed yield improvements.
- Do not recommend exact pesticide dosages without reliable product-label
  information and appropriate local agricultural guidance.
- Explain when a local agricultural officer or KVK expert should be consulted.
- If important information is missing, state the uncertainty and ask focused
  follow-up questions.
- Do not claim that you accessed live weather or farm sensor data.
- Respond in the requested language.
"""

    try:
        result = get_gemini_response(
            prompt,
            temperature=0.35,
            use_cache=False
        )

        if not result or not str(result).strip():
            raise HTTPException(
                status_code=503,
                detail="The AI service returned an empty response. Please try again."
            )

        return FarmingAdvisorResponse(advisory=str(result).strip())

    except HTTPException:
        raise
    except Exception as exc:
        print(f"[AI Farming Advisor] Generation failed: {exc}")
        raise HTTPException(
            status_code=503,
            detail="AI advisory is temporarily unavailable. Please try again."
        )
