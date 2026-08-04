import os

GEMINI_API_KEY = os.environ.get(
    "GEMINI_API_KEY", 
    ""
)
GEMINI_PROJECT_NAME = os.environ.get("GEMINI_PROJECT_NAME", "projects/512778118131")
GEMINI_PROJECT_NUMBER = os.environ.get("GEMINI_PROJECT_NUMBER", "512778118131")
GEMINI_MODEL_NAME = os.environ.get("GEMINI_MODEL_NAME", "gemini-2.0-flash")
