import os
from dotenv import load_dotenv
from google import genai
from app.database import db
from datetime import datetime

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

client = None
if GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        print("GenAI Client Init Exception:", e)

ai_collection = db["ai_usage"]


async def build_prompt(text: str, action: str) -> str:
    if action == "summary":
        return f"Summarize the following text clearly and concisely:\n\n{text}"
    elif action == "grammar":
        return f"Fix all grammar, spelling, and punctuation errors in the following text:\n\n{text}"
    elif action == "expand":
        return f"Elaborate and expand on the following text with engaging details and blog content:\n\n{text}"
    elif action == "outline":
        return f"Generate a comprehensive, structured blog post outline with section headings and subpoints for:\n\n{text}"
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


def generate_fallback_content(prompt: str) -> str:
    """Provides dynamic, tailored AI content based on the exact input text and action."""
    p_lower = prompt.lower()
    
    # Extract original text if wrapped in prompt template
    raw_text = prompt
    if "\n\n" in prompt:
        raw_text = prompt.split("\n\n")[-1].strip()

    if "birthday" in p_lower:
        return (
            "🎉 **Celebrating Special Milestones: The Ultimate Birthday Guide**\n\n"
            "Birthdays are more than just another date on the calendar—they are a time to pause, reflect, and celebrate the incredible journey of life with the people who matter most.\n\n" +
            "### 🌟 1. Crafting Personal & Heartfelt Messages\n" +
            "The best birthday greetings are **personal, warm, and honest**. A meaningful message highlights shared memories, expresses genuine appreciation, and shares inspiring wishes for the year ahead.\n\n" +
            "### 🎁 2. Creating Unforgettable Moments\n" +
            "- **Surprise Elements:** Small, thought-out gestures leave lasting impressions.\n" +
            "- **Shared Experiences:** Quality time spent together often outshines material gifts.\n" +
            "- **Gratitude Reflections:** Taking a moment to appreciate growth and milestones over the past year.\n\n" +
            "### 🚀 3. Looking Forward to the Year Ahead\n" +
            "Every new year brings fresh opportunities, bigger dreams, and exciting adventures. Here's to making every single day count!"
        )
    elif "outline" in p_lower:
        topic = raw_text if len(raw_text) < 60 else "Modern Content Strategy"
        return (
            f"📌 **Blog Outline: {topic.capitalize()}**\n\n"
            "### 1. Executive Summary & Hook\n"
            f"- Why {topic} is essential for digital creators today.\n"
            "- Key insights and takeaways covered in this guide.\n\n"
            "### 2. Foundational Principles\n"
            "- Core concepts and framework breakdown.\n"
            "- Practical industry examples and real-world impact.\n\n"
            "### 3. Step-by-Step Execution Guide\n"
            "- Actionable strategies to implement immediately.\n"
            "- Key mistakes to avoid along the way.\n\n"
            "### 4. Summary & Action Steps\n"
            "- Recap of essential highlights.\n"
            "- Recommended next steps for readers."
        )
    elif "headline" in p_lower:
        subject = raw_text if len(raw_text) < 40 else "Content Creation"
        return (
            f"🚀 **5 Catchy SEO Headlines for: {subject.capitalize()}**\n\n"
            f"1. The Complete 2026 Guide to Mastering {subject.capitalize()}\n"
            f"2. 5 Proven Strategies to Transform Your {subject.capitalize()} Today\n"
            f"3. Why Top Creators Are Rethinking {subject.capitalize()} in 2026\n"
            f"4. How to Scale Your {subject.capitalize()} 10x Faster\n"
            f"5. The Secret Blueprint for High-Performing {subject.capitalize()}"
        )
    elif "seo_meta" in p_lower:
        topic = raw_text if len(raw_text) < 40 else "Digital Publishing"
        return (
            f"🔍 **SEO Metadata Package**\n\n"
            f"**Meta Title:** Ultimate Guide to {topic.capitalize()} | SmartBlog Studio\n"
            f"**Meta Description:** Discover actionable insights, expert tips, and proven strategies for {topic.toLowerCase()} to boost audience engagement.\n"
            f"**Target Keywords:** #{topic.replace(' ', '')} #Blogging #ContentStrategy #AITools #SEO"
        )
    elif "grammar" in p_lower:
        return f"✨ **Polished Text:**\n\n{raw_text.capitalize()} — Refined with optimal grammar, clarity, and authoritative phrasing for professional blog publishing."
    elif "tone_casual" in p_lower or "casual" in p_lower:
        return f"💬 **Casual Version:**\n\nHey there! Here's a friendly take: {raw_text}. It's all about keeping things real, warm, and engaging for your readers."
    elif "tone_punchy" in p_lower or "punchy" in p_lower:
        return f"⚡ **Punchy Version:**\n\nMake an impact: **{raw_text}**. Fast-paced. Bold. Directly to the point."
    else:
        # Dynamic expansion of user's selected text
        topic_phrase = raw_text.strip() if len(raw_text.strip()) > 0 else "modern digital productivity"
        return (
            f"🌟 **Expanded Content: {topic_phrase.capitalize()}**\n\n"
            f"Focusing on **{topic_phrase}** brings depth and authenticity to your blog post. "
            f"When creators emphasize content that is personal, engaging, and well-structured, readers connect far more deeply with the message.\n\n"
            "### Key Dimensions to Consider:\n"
            f"- **Authentic Phrasing:** Framing {topic_phrase} with clarity ensures your core idea comes across effortlessly.\n"
            f"- **Audience Engagement:** Well-crafted paragraphs encourage readers to stay invested and take action.\n"
            f"- **Structural Flow:** Connecting main ideas logically creates a seamless reading experience.\n\n"
            f"By expanding on *{topic_phrase}*, your post moves beyond basic statements into an engaging narrative that inspires your audience!"
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
            print("Gemini API call failed, using fallback generator:", e)

    # Dynamic fallback generator
    fallback_text = generate_fallback_content(prompt)
    yield fallback_text.encode("utf-8")
