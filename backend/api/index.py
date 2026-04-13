"""
Vercel serverless entry point.
Imports the FastAPI app from server.py and exposes it as the handler.
"""
import sys
from pathlib import Path

# Add parent directory to path so we can import server.py
sys.path.insert(0, str(Path(__file__).parent.parent))

from server import app  # noqa: E402

# Vercel looks for an `app` variable in the handler module
# FastAPI app is already named `app` in server.py, so this re-export works directly.
