import streamlit as st
import streamlit.components.v1 as components


st.title("🛡️ ScamGuard Senior")
st.write("Welcome! This app helps older adults practice finding text and call scams.")


questions = [
    {
        "title": "Voice Call: Grandchild Emergency",
        "type": "voice",
        "sender": "Unknown Number",
        "text": "Grandma, it's me! I got into a bad car accident and I'm in jail. The police say I need $5,000 for bail right now. Please don't tell mom and dad. Send the money through Bitcoin or a wire transfer quickly!",
        "is_scam": True,
        "explain": "This is a scam! Scammers use AI to copy someone's voice from social media. Real police will never ask for Bitcoin or wire transfers."
    },
    {
        "title": "USPS Package Delivery Failure",
        "type": "text",
        "sender": "USPS-Notification-Alert",
        "text": "USPS Notice: Your package could not be delivered due to an incomplete address. Please update your address and pay a $1.50 redelivery fee within 24 hours to avoid return-to-sender: https://usps-redelivery-postage.com",
        "is_scam": True,
        "explain": "This is a scam! Look closely at the link address. Official USPS links end in 'usps.com', not 'usps-redelivery-postage.com'."
    },
    {
        "title": "Tech Support Virus Scam Call",
        "type": "voice",
        "sender": "Microsoft Security Agent",
        "text": "Hello, this is Microsoft Security Center calling. We detected a dangerous Trojan virus on your computer that is stealing your bank details. Please go to your computer immediately and download the AnyDesk program so our specialist can secure your PC.",
        "is_scam": True,
        "explain": "This is a scam! Companies like Microsoft or Apple will never cold-call you on the phone to fix a virus on your desktop."
    },
    {
        "title": "Bank Account Fraud Alert",
        "type": "text",
        "sender": "Chase Security Alert",
        "text": "CHASE ALERT: Urgent security notification. We detected suspicious activity of $482.91 at Walmart on your debit card. If this wasn't you, please immediately log in to verify your identity: https://bit.ly/chase-secure-auth-392",
        "is_scam": True,
        "explain": "This is a scam! Banks will not send shortened links like bit.ly in a text message. Always call the number on the back of your bank card instead."
    },
    {
        "title": "Verification Code Text",
        "type": "text",
        "sender": "Netflix Auth",
        "text": "Your secure verification code for logging into Netflix is 482901. This code expires in 10 minutes. If you did not request this, you can safely ignore this text message.",
        "is_scam": False,
        "explain": "This is safe! It is a standard automated log-in code. It does not ask you to click links or pay money."
    },
    {
        "title": "Shipment Update",
        "type": "text",
        "sender": "Amazon Logistics",
        "text": "Hi John, your Amazon order #114-829371 has been delivered to your front door. Track or view details: https://www.amazon.com/gp/your-account/order-history",
        "is_scam": False,
        "explain": "This is safe! The web link points directly to the official, secure website domain (amazon.com)."
    }
]


if 'score' not in st.session_state:
    st.session_state.score = 0

if 'question_num' not in st.session_state:
    st.session_state.question_num = 0

if 'answered' not in st.session_state:
    st.session_state.answered = False

if 'last_result' not in st.session_state:
    st.session_state.last_result = ""



st.write("---")
st.write("### Current Score:", st.session_state.score)


if st.session_state.question_num >= len(questions):
    st.write("## Training Complete!")
    st.write("Your final score is:", st.session_state.score, "out of", len(questions))
    
    if st.button("Play Again"):
        st.session_state.score = 0
        st.session_state.question_num = 0
        st.session_state.answered = False
        st.session_state.last_result = ""
        st.rerun()

else:
    current_q = questions[st.session_state.question_num]
    
    st.write("### Question", st.session_state.question_num + 1, "of", len(questions))
    st.write("####", current_q["title"])
    st.write("From:", current_q["sender"])
    
    
    if current_q["type"] == "text":
        st.info(current_q["text"])
    else:
        
        tts_code = f"""
            <button onclick="
                window.speechSynthesis.cancel();
                let msg = new SpeechSynthesisUtterance('{current_q['text'].replace("'", "\\'")}');
                msg.rate = 0.8;
                window.speechSynthesis.speak(msg);
            " style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
                🔈 Listen to Voice Call
            </button>
        """
        components.html(tts_code, height=60)
        
        


    st.write("---")
    st.write("What should you do with this message or call?")

    col1, col2 = st.columns(2)

    with col1:
        if st.button("🚨 IT'S A SCAM", disabled=st.session_state.answered):
            st.session_state.answered = True
            if current_q["is_scam"] == True:
                st.session_state.score += 1
                st.session_state.last_result = "correct"
            else:
                st.session_state.last_result = "wrong"
            st.rerun()

    with col2:
        if st.button("✅ IT'S SAFE", disabled=st.session_state.answered):
            st.session_state.answered = True
            if current_q["is_scam"] == False:
                st.session_state.score += 1
                st.session_state.last_result = "correct"
            else:
                st.session_state.last_result = "wrong"
            st.rerun()

    
    if st.session_state.answered:
        st.write("---")
        if st.session_state.last_result == "correct":
            st.success("Correct! +1 Point!")
        else:
            st.error("Wrong! Be careful.")
        
        st.write("**Explanation:**")
        st.write(current_q["explain"])
        
        if st.button("Next Question ➡️"):
            st.session_state.question_num += 1
            st.session_state.answered = False
            st.session_state.last_result = ""
            st.rerun()