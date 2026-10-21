from typing import List, Literal
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.gemini_service import get_gemini_response

router = APIRouter(
    prefix="/api/farming-assistant",
    tags=["Farming Assistant"]
)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class FarmingAssistantRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    language: str = "en"
    history: List[ChatMessage] = Field(default_factory=list)


class FarmingAssistantResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=FarmingAssistantResponse)
def farming_assistant_chat(request: FarmingAssistantRequest):
    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Please enter a message."
        )

    # Keep only the latest 10 conversation messages.
    history = request.history[-10:]

    conversation = "\n".join(
        f"{item.role}: {item.content}"
        for item in history
    )

    language_map = {
        "en": "English",
        "hi": "Hindi",
        "as": "Assamese",
        "bn": "Bengali",
        "brx": "Bodo",
        "doi": "Dogri",
        "gu": "Gujarati",
        "kn": "Kannada",
        "ks": "Kashmiri",
        "kok": "Konkani",
        "mai": "Maithili",
        "ml": "Malayalam",
        "mni": "Manipuri (Meitei)",
        "mr": "Marathi",
        "ne": "Nepali",
        "or": "Odia",
        "pa": "Punjabi",
        "sa": "Sanskrit",
        "sat": "Santali",
        "sd": "Sindhi",
        "ta": "Tamil",
        "te": "Telugu",
        "ur": "Urdu",
    }

    language = language_map.get(
        request.language,
        "English"
    )

    prompt = f"""
You are Farming Assistant, an agricultural advisory assistant
for farmers in India.

RESPONSE STYLE:
- Keep answers short by default: 2-5 sentences or a few bullet points.
- Answer the user's exact question directly.
- Avoid unnecessary introductions, repetition, and extra background.
- Explain in detail only when the user explicitly requests details,
  a full explanation, or step-by-step guidance.
- Use simple, beginner-friendly language.
- Never omit essential safety information just to keep an answer short.

RULES:
1. Respond in {language}.
2. Give clear, practical, beginner-friendly guidance.
3. Focus on farming, crops, soil, irrigation, fertilizers,
   pests, diseases, weather-related farming decisions,
   government agricultural schemes, and market-related questions.
4. Ask relevant follow-up questions when important details
   such as crop, location, soil, or season are missing.
5. Do not invent government schemes, prices, weather readings,
   or pesticide dosage instructions.
6. For pesticide or fertilizer use, recommend following
   the product label and local agricultural expert guidance.
7. Clearly explain uncertainty when reliable information
   is unavailable.
8. For unrelated questions, briefly explain that you specialize
   in agriculture and farming.

Previous conversation:
{conversation if conversation else "No previous messages."}

Current user message:
{message}

Provide a helpful response in {language}.
"""

    try:
        reply = get_gemini_response(
            prompt,
            temperature=0.5,
            use_cache=False
        )

        if not reply or not reply.strip():
            raise HTTPException(
                status_code=503,
                detail="The AI returned an empty response."
            )

        if "temporarily unavailable" in reply.lower():
            raise HTTPException(
                status_code=503,
                detail=reply
            )

        return FarmingAssistantResponse(reply=reply)

    except HTTPException:
        raise
    except Exception as exc:
        print(f"[FARMING ASSISTANT] Error: {exc}")

        raise HTTPException(
            status_code=503,
            detail="Farming Assistant is temporarily unavailable."
        )