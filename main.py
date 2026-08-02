import random
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="ScamGuard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ALL_SCENARIOS = [
    {
        "id": 1,
        "title": "AI Voice Call: Grandchild Emergency",
        "type": "voice",
        "sender": "Unknown Number",
        "content": "Grandma, it's me! I got into a bad car accident and I'm in jail. The police say I need $5,000 for bail right now. Please don't tell mom and dad. Send the money through Bitcoin or a wire transfer quickly!",
        "is_scam": True,
        "explanation": "Scammers use AI voice cloning from social media clips. Police and government agencies never ask for Bitcoin or wire transfers."
    },
    {
        "id": 2,
        "title": "USPS Package Delivery Failure",
        "type": "text",
        "sender": "USPS-Notification-Alert",
        "content": "USPS Notice: Your package could not be delivered due to an incomplete address. Please update your address and pay a $1.50 redelivery fee within 24 hours: https://usps-redelivery-postage.com",
        "is_scam": True,
        "explanation": "Look closely at the link address! Official postal links end in 'usps.com', not fake domains like 'usps-redelivery-postage.com'."
    },
    {
        "id": 3,
        "title": "Tech Support Virus Warning Call",
        "type": "voice",
        "sender": "Microsoft Security Agent",
        "content": "Hello, this is Microsoft Security Center calling. We detected a dangerous Trojan virus on your computer that is stealing your bank details. Please go to your computer immediately and download AnyDesk so we can fix it.",
        "is_scam": True,
        "explanation": "Companies like Microsoft or Apple will NEVER call you out of nowhere to fix your computer or request remote desktop access."
    },
    {
        "id": 4,
        "title": "Bank Account Fraud Alert",
        "type": "text",
        "sender": "Chase Security Alert",
        "content": "CHASE ALERT: Urgent security notification. We detected suspicious activity of $482.91 at Walmart on your debit card. If this wasn't you, verify identity now: https://bit.ly/chase-secure-auth-392",
        "is_scam": True,
        "explanation": "Banks do not send shortened links like bit.ly in text messages. Always call the number on the back of your official debit card."
    },
    {
        "id": 5,
        "title": "Verification Code Text",
        "type": "text",
        "sender": "Netflix Auth",
        "content": "Your secure verification code for logging into Netflix is 482901. This code expires in 10 minutes. If you did not request this, you can safely ignore this text message.",
        "is_scam": False,
        "explanation": "This is a legitimate 2FA verification code. It does not ask you to click external links or send money."
    },
    {
        "id": 6,
        "title": "Shipment Update",
        "type": "text",
        "sender": "Amazon Logistics",
        "content": "Hi John, your Amazon order #114-829371 has been delivered to your front door. Track or view details: https://www.amazon.com/gp/your-account/order-history",
        "is_scam": False,
        "explanation": "This is a legitimate delivery update pointing directly to the official, secure domain (amazon.com)."
    },
    {
        "id": 7,
        "title": "IRS Tax Penalty Threat Call",
        "type": "voice",
        "sender": "Internal Revenue Service",
        "content": "This is an urgent notice from the Internal Revenue Service. You have unpaid taxes of $3,210. A warrant has been issued for your arrest. To resolve this immediately and cancel the police dispatch, purchase Target gift cards and read the numbers on the back.",
        "is_scam": True,
        "explanation": "The IRS will never demand immediate payment over the phone, demand gift cards, or threaten instant arrest."
    },
    {
        "id": 8,
        "title": "Prize Winner Text",
        "type": "text",
        "sender": "Winner Notification",
        "content": "CONGRATS! You have been selected as the 1st place winner of our daily giveaway: a brand new iPad Pro! Claim your prize here before midnight: https://claim-ipad-now-free.org/win",
        "is_scam": True,
        "explanation": "You cannot win a contest or giveaway that you never entered. These links trick you into entering credit card details for 'shipping fees'."
    },
    {
        "id": 9,
        "title": "Prescription Reminder",
        "type": "text",
        "sender": "CVS Pharmacy",
        "content": "CVS Pharmacy: Your prescription RX#94821 is ready for pickup at Main St branch. Reply 1 to auto-refill or CALL store directly for questions.",
        "is_scam": False,
        "explanation": "Standard automated pharmacy notice. It gives actionable options without requiring suspicious web links."
    },
    {
        "id": 10,
        "title": "Bank Wire Transfer Call",
        "type": "voice",
        "sender": "Wells Fargo Fraud Unit",
        "content": "This is Wells Fargo Fraud Prevention. Someone is currently attempting to transfer $2,500 out of your account. To stop this transaction, tell me the 6-digit passcode we just sent to your mobile phone number.",
        "is_scam": True,
        "explanation": "Scammers trigger a real password reset on your account and trick you into reading them the one-time passcode so they can log in!"
    },
    {
        "id": 11,
        "title": "Appointment Reminder",
        "type": "text",
        "sender": "Dr. Smith Dental",
        "content": "Reminder: You have an upcoming appointment with Dr. Smith tomorrow at 2:30 PM. Reply C to confirm or call 555-0192 to reschedule.",
        "is_scam": False,
        "explanation": "Normal SMS appointment reminder with standard text commands."
    },
    {
        "id": 12,
        "title": "Wrong Number",
        "type": "text",
        "sender": "Unknown (+1-802-555-0143)",
        "content": "Hi David! Are we still meeting for lunch at the country club tomorrow? Oh sorry, is this not David? Well, nice meeting you anyway! I am Sarah.",
        "is_scam": True,
        "explanation": "This is a classic 'Pig Butchering' or wrong number scam. Scammers pretend it was an innocent accident to build trust before pitching crypto investments."
    }
]


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
def get_scenarios(count: int = 4):
    sampled = random.sample(ALL_SCENARIOS, min(count, len(ALL_SCENARIOS)))
    
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


@app.post("/api/analyze")
def analyze_custom_text(request: CustomTextRequest):
    raw_text = request.text.lower()
    red_flags = []
    
    scam_keywords = [
        "bitcoin", "wire transfer", "gift card", "jail", "urgent", 
        "bail", "trojan", "virus", "anydesk", "bit.ly", "usps-redelivery", 
        "unpaid taxes", "warrant", "winner", "congrats", "passcode"
    ]
    
    for word in scam_keywords:
        if word in raw_text:
            red_flags.append(f"Contains high-risk word/phrase: '{word}'")
            
    if "http://" in raw_text or "https://" in raw_text:
        if not any(domain in raw_text for domain in ["amazon.com", "usps.com", "chase.com", "netflix.com"]):
            red_flags.append("Contains an unverified external web link")

    is_scam = len(red_flags) > 0
    confidence = "High Risk" if len(red_flags) >= 2 else ("Medium Risk" if len(red_flags) == 1 else "Low Risk / Likely Safe")

    return {
        "text": request.text,
        "is_scam": is_scam,
        "risk_level": confidence,
        "red_flags_found": red_flags,
        "explanation": (
            f"Caution! Found {len(red_flags)} potential scam red flags." 
            if is_scam else 
            "No obvious scam patterns detected. Always remain cautious with unexpected messages."
        )
    }