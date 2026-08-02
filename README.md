# ScamGuard
### Built to help older adults recognize and avoid common scams.

---
Over **40 billion dollars** has been lost to scams in the United States alone, with older adults being particularly vulnerable. ScamGuard is designed to empower seniors with the knowledge and tools they need to identify and prevent scams, ensuring their financial security and peace of mind.

### Features

- Test users on over 50 emails and voice messages to identify scam from legitimate scenarios. 
  - Users learn pattern recognition as they test themselves
- Users can send their own emails/texts to the app where a ML model and common flags detect whether the message is legitimate
  - **Streaks 🔥**: Come back every day to increase your streak and gain XP every solve
---
### Tech Stack:

- **Frontend**: Vanilla JS, HTML, CSS
- **Backend**: Uvicorn, FastAPI, Pydantic, Google Translate API
- **ML/Data Science**: DistilBERT, Hugging Face, Pandas, Pytorch

### Using The Source Code
```bash
python -m venv .venv
.venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
```bash
Windows: Start-Process index.html
Mac: open index.html
Linux: xdg-open index.html
```
For NLP:
Additionally install:
```
pip install evaluate pandas numpy scikit-learn
```
Run the code in ml_code.ipynb preferably in Google Colab
Save the code to hugging face and change the path for the model to your hugging face model
---