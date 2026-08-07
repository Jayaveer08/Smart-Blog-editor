import os
from dotenv import load_dotenv
from google import genai
from app.database import db
from datetime import datetime

load_dotenv()

# Allow model and API key to be configured via environment. If no model
# is provided, fall back to a local stub summarizer for development.
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL")

client = None
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)

ai_collection = db["ai_usage"]


async def build_prompt(text: str, action: str) -> str:
    if action == "summary":
        return f"Summarize the following text clearly and concisely:\n\n{text}"
    elif action == "grammar":
        return f"Fix all grammar, spelling, and punctuation errors in the following text, keeping the original meaning intact:\n\n{text}"
    elif action == "expand":
        return f"Elaborate and expand on the following text with engaging details, clear explanations, and examples suitable for a high-quality blog post:\n\n{text}"
    elif action == "outline":
        return f"Generate a comprehensive, structured blog post outline with main sections, bullet points, and key takeaways for the topic:\n\n{text}"
    elif action == "headline":
        return f"Generate 5 catchy, high-converting, SEO-optimized blog headlines for:\n\n{text}"
    elif action == "seo_meta":
        return f"Generate an SEO Meta Title, Meta Description (max 160 chars), and 5 targeted keywords for:\n\n{text}"
    elif action == "tone_casual":
        return f"Rewrite the following text in a warm, conversational, and relatable tone:\n\n{text}"
    elif action == "tone_professional":
        return f"Rewrite the following text in a polished, authoritative, professional business tone:\n\n{text}"
    elif action == "tone_punchy":
        return f"Rewrite the following text in a bold, fast-paced, punchy, persuasive tone:\n\n{text}"
    return text


def stream_ai_response(prompt: str):
    """Synchronous generator that yields bytes for StreamingResponse.

    If a configured Gemini/GenAI model is available it will stream
    from the remote API. Otherwise a small local summarizer will
    provide a quick fallback so the frontend still receives data.
    """
    # If no client or model configured, return a local fallback summary
    if not client or not GEMINI_MODEL:
        try:
            # Prompt may include an instruction prefix (e.g. "Summarize clearly and concisely:\n\n{user text}").
            # Strip common instruction prefixes so the local summarizer operates on the user text only.
            text = prompt.strip()

            # If there's a double-newline, assume instruction block before it and take remainder
            if "\n\n" in text:
                _, rest = text.split("\n\n", 1)
                text = rest.strip()
            else:
                # If there's a colon shortly before the user text, split on the first colon
                if ":" in text and len(text.split(":", 1)[0]) < 50:
                    parts = text.split(":", 1)
                    text = parts[1].strip()

            # Very small local "summary": first 400 chars or up to 3 sentences
            sentences = [s.strip() for s in text.split(".") if s.strip()]
            if len(sentences) >= 3:
                summary = ". ".join(sentences[:3]) + "."
            else:
                summary = text[:400]
                if len(text) > 400:
                    summary = summary.rstrip() + "..."

            # Yield the result in a single chunk
            yield summary.encode("utf-8")
            return
        except Exception as e:
            yield (f"\n[AI STREAM ERROR] Local summarizer failed: {e}\n").encode(
                "utf-8"
            )

    # Remote client path
    try:
        response = client.models.generate_content_stream(
            model=GEMINI_MODEL,
            contents=prompt,
        )

        for chunk in response:
            try:
                text = getattr(chunk, "text", None)
                if text:
                    yield text.encode("utf-8")
            except Exception:
                continue
    except Exception as e:
        err = f"\n[AI STREAM ERROR] {str(e)}\n"
        yield err.encode("utf-8")


async def log_ai_usage(user_id: str, action: str, input_length: int):
    ai_collection.insert_one({
        "user_id": user_id,
        "action": action,
        "input_length": input_length,
        "timestamp": datetime.utcnow()
    })
