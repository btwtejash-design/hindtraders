import os
import sys

# Ensure doc generation/server and doc generation are in sys.path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOC_SERVER_DIR = os.path.join(ROOT_DIR, "doc generation", "server")
DOC_DIR = os.path.join(ROOT_DIR, "doc generation")

if DOC_SERVER_DIR not in sys.path:
    sys.path.insert(0, DOC_SERVER_DIR)
if DOC_DIR not in sys.path:
    sys.path.insert(0, DOC_DIR)

# Import and expose FastAPI app from doc generation/server/main.py
from main import app  # noqa: F401
