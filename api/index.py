import os
import sys

# Add backend directory to sys.path for Vercel Python runtime
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app

# Export ASGI app for Vercel Serverless Function
handler = app
