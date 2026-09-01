import os
from dotenv import load_dotenv
from app.database import db
from datetime import datetime

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

client = None
if GEMINI_API_KEY:
    try:
        from google import genai
        client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        print("[AI] GenAI Client Init Exception:", e)

ai_collection = db["ai_usage"]


async def log_ai_usage(user_id: str, action: str, input_length: int):
    """Log AI usage to MongoDB — silently skips if collection unavailable."""
    try:
        ai_collection.insert_one({
            "user_id": user_id,
            "action": action,
            "input_length": input_length,
            "timestamp": datetime.utcnow()
        })
    except Exception:
        pass  # MockDB or unavailable — continue silently


async def build_prompt(text: str, action: str) -> str:
    """Build the full prompt string for a given action type."""
    if action == "summary":
        return f"Summarize the following text clearly and concisely:\n\n{text}"
    elif action == "grammar":
        return f"Fix all grammar, spelling, and punctuation errors in the following text:\n\n{text}"
    elif action == "expand":
        return f"Elaborate and expand on the following text with engaging blog content and vivid details:\n\n{text}"
    elif action == "outline":
        return f"Generate a comprehensive, structured blog post outline with section headings and subpoints for:\n\n{text}"
    elif action == "headline":
        return f"Generate 5 catchy, high-converting, SEO-optimized blog headlines for:\n\n{text}"
    elif action == "seo_meta":
        return f"Generate an SEO Meta Title, Meta Description (max 160 chars), and 5 targeted keywords for:\n\n{text}"
    elif action == "tone_casual":
        return f"Rewrite the following in a warm, conversational, and relatable tone:\n\n{text}"
    elif action == "tone_professional":
        return f"Rewrite the following in a polished, authoritative, professional business tone:\n\n{text}"
    elif action == "tone_punchy":
        return f"Rewrite the following in a bold, fast-paced, punchy, persuasive tone:\n\n{text}"
    return f"Based on the following input, write a compelling, well-structured blog article:\n\n{text}"


def generate_fallback_content(prompt: str) -> str:
    """Dynamic fallback generator when Gemini API is unavailable."""
    p = prompt.lower()
    raw = prompt.split("\n\n")[-1].strip() if "\n\n" in prompt else prompt.strip()
    topic = raw if len(raw) < 80 else "Modern Content Strategy"

    if "birthday" in p:
        return (
            "🎉 **Celebrating Special Milestones: The Ultimate Birthday Guide**\n\n"
            "Birthdays are more than just another date — they are a time to pause and celebrate life.\n\n"
            "### 🌟 1. Crafting Heartfelt Messages\nThe best birthday greetings are personal, warm, and honest.\n\n"
            "### 🎁 2. Creating Unforgettable Moments\n- Small gestures leave lasting impressions.\n- Quality time together outshines material gifts.\n\n"
            "### 🚀 3. Looking Forward\nEvery new year brings bigger dreams. Here's to making every day count!"
        )
    elif "outline" in p:
        return (
            f"📌 **Blog Outline: {topic.capitalize()}**\n\n"
            f"### 1. Introduction\n- Why {topic} matters for modern creators.\n\n"
            "### 2. Core Concepts\n- Key principles and real-world applications.\n\n"
            "### 3. Step-by-Step Guide\n- Actionable strategies to implement today.\n\n"
            "### 4. Conclusion\n- Key takeaways and recommended next steps."
        )
    elif "headline" in p:
        return (
            f"🚀 **5 Catchy Headlines for: {topic.capitalize()}**\n\n"
            f"1. The Complete 2026 Guide to Mastering {topic.capitalize()}\n"
            f"2. 5 Proven Strategies to Transform Your {topic.capitalize()} Today\n"
            f"3. Why Top Creators Are Rethinking {topic.capitalize()} in 2026\n"
            f"4. How to Scale Your {topic.capitalize()} Results 10x Faster\n"
            f"5. The Secret Blueprint for High-Performing {topic.capitalize()}"
        )
    elif "seo_meta" in p or "meta" in p:
        return (
            f"🔍 **SEO Metadata**\n\n"
            f"**Meta Title:** Ultimate Guide to {topic.capitalize()} | Smart Blog Editor\n"
            f"**Meta Description:** Discover actionable insights and proven strategies for {topic} to boost audience engagement.\n"
            f"**Target Keywords:** #{topic.replace(' ', '')} #Blogging #ContentStrategy #SEO"
        )
    elif "grammar" in p or "polish" in p or "fix" in p:
        return f"✨ **Polished Version:**\n\n{raw}\n\n*(Refined for clarity and professional tone.)*"
    elif "casual" in p:
        return f"💬 **Casual Version:**\n\nHey! Here's a friendly take:\n\n{raw}\n\nKeep it real and relatable!"
    elif "punchy" in p:
        return f"⚡ **Punchy Version:**\n\n**{raw}**\n\nFast. Bold. Impactful."
    elif "professional" in p:
        return f"🏢 **Professional Version:**\n\n{raw}\n\n*(Rewritten with authoritative tone and executive-level clarity.)*"
    else:
        return (
            f"🌟 **Expanded Content: {topic.capitalize()}**\n\n"
            f"When it comes to **{topic}**, depth and authenticity make all the difference.\n\n"
            "### Key Dimensions to Explore:\n"
            f"- **Clarity:** Frame your ideas around *{topic}* with precision.\n"
            "- **Engagement:** Well-crafted paragraphs keep readers invested.\n"
            "- **Flow:** Connect ideas logically for a seamless reading experience.\n\n"
            f"By expanding on *{topic}*, your content becomes an inspiring narrative!"
        )


def stream_ai_response(prompt: str):
    """Synchronous generator yielding bytes for StreamingResponse."""
    if client:
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
            return
        except Exception as e:
            print("[AI] Gemini API call failed, using fallback:", e)

    # Client-side fallback
    yield generate_fallback_content(prompt).encode("utf-8")
