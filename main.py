import json
import random
import ssl
import urllib.parse
import urllib.request
from functools import lru_cache
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI(title="ScamGuard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent / "data"

# Create SSL context to prevent SSL certificate verification errors on macOS Python
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE


@lru_cache(maxsize=500)
def translate_text(text: str, target_lang: str) -> str:
    """Translates text into the target language using Google Translate API with caching and SSL bypass."""
    if not text or target_lang in ("en", ""):
        return text
    try:
        encoded_text = urllib.parse.quote(text)
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl={target_lang}&dt=t&q={encoded_text}"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        )
        with urllib.request.urlopen(req, timeout=5, context=ssl_context) as response:
            raw = response.read().decode("utf-8")
            data = json.loads(raw)
            if data and isinstance(data, list) and len(data) > 0 and data[0]:
                translated_parts = [segment[0] for segment in data[0] if segment and len(segment) > 0 and segment[0]]
                if translated_parts:
                    return "".join(translated_parts)
    except Exception as e:
        print(f"Translation exception for '{text[:15]}' -> {target_lang}: {e}")
    return text


def load_scenarios(lang: str = "en") -> list[dict]:
    # Always load master English file as baseline for translation
    master_file = DATA_DIR / "scenarios.json"
    if not master_file.exists():
        return []

    with open(master_file, "r", encoding="utf-8") as f:
        scenarios = json.load(f)

    if lang in ("en", ""):
        return scenarios

    # Auto-translate text fields on the fly
    translated_list = []
    for item in scenarios:
        item_copy = item.copy()
        item_copy["title"] = translate_text(item["title"], lang)
        item_copy["content"] = translate_text(item["content"], lang)
        item_copy["explanation"] = translate_text(item["explanation"], lang)
        translated_list.append(item_copy)

    return translated_list


class VerificationRequest(BaseModel):
    scenario_id: int
    user_guess: bool
    scenarios: list[dict]


class CustomTextRequest(BaseModel):
    text: str


@app.get("/")
def health_check():
    return {"status": "ok", "message": "ScamGuard API is running"}


@app.get("/api/scenarios")
def get_scenarios(count: int = 4, lang: str = "en"):
    dataset = load_scenarios(lang)
    if not dataset:
        raise HTTPException(status_code=500, detail="Scenario dataset not found")

    sampled = random.sample(dataset, min(count, len(dataset)))

    scenarios = []
    for idx, item in enumerate(sampled, start=1):
        q = item.copy()
        q["id"] = idx
        scenarios.append(q)

    return {"scenarios": scenarios}


@app.post("/api/verify")
def verify_answer(request: VerificationRequest):
    scenario = next((q for q in request.scenarios if q["id"] == request.scenario_id), None)

    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario ID not found")

    is_correct = (scenario["is_scam"] == request.user_guess)

    return {
        "correct": is_correct,
        "explanation": scenario["explanation"]
    }

classifier = pipeline(
    "text-classification",
    model="rialdcart098/scam_detector",
    tokenizer="rialdcart098/scam_detector"
)
@app.post("/api/analyze")
def analyze_custom_text(request: CustomTextRequest):
    raw_text = request.text.lower()
    red_flags = []

    result = classifier(raw_text)[0]
    label = result["label"]
    score = result["score"]

    scam_keywords = [
        "bitcoin", "wire transfer", "gift card", "jail", "urgent",
        "bail", "trojan", "virus", "anydesk", "bit.ly", "usps-redelivery",
        "unpaid taxes", "warrant", "winner", "congrats", "passcode"
    ]
    safe_keywords = [
        "no action required", "appointment", "reservation",
        "confirmation", "scheduled", "reminder",
        "delivery", "tracking", "invoice", "statement",
        "receipt", "renewal", "maintenance",
        "support ticket", "official app", "official website"
    ]
    for word in scam_keywords:
        if word in raw_text:
            red_flags.append(f"Contains high-risk word/phrase: '{word}'")

    if "http://" in raw_text or "https://" in raw_text:
        if not any(domain in raw_text for domain in ["amazon.com", "usps.com", "chase.com", "netflix.com"]):
            red_flags.append("Contains an unverified external web link")

    is_scam = label == "scam"

    if is_scam and any(keyword in raw_text.lower() for keyword in safe_keywords):
        is_scam = False
        red_flags.clear()

    if is_scam:
        if len(red_flags) >= 2 or score >= 0.95:
            confidence = "High Risk"
        else:
            confidence = "Medium Risk"

        explanation = f"Caution! Model and red flag checks indicate potential scam patterns (Confidence: {score * 100:.2f}%)."
    else:
        confidence = "Low Risk / Likely Safe"
        explanation = "No obvious scam patterns detected. Always remain cautious with unexpected messages."

    return {
        "text": request.text,
        "is_scam": is_scam,
        "risk_level": confidence,
        "red_flags_found": red_flags,
        "explanation": explanation
    }