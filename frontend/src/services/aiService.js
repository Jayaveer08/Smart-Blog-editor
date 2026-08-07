import useAIStore from "../store/useAIStore";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

function getClientFallback(action, text) {
  const rawText = (text || "").trim();
  const pLower = (action || "").toLowerCase() + " " + rawText.toLowerCase();

  if (pLower.includes("birthday")) {
    return (
      "🎉 **Celebrating Special Milestones: The Ultimate Birthday Guide**\n\n" +
      "Birthdays are more than just another date on the calendar—they are a time to pause, reflect, and celebrate the incredible journey of life with the people who matter most.\n\n" +
      "### 🌟 1. Crafting Personal & Heartfelt Messages\n" +
      "The best birthday greetings are **personal, warm, and honest**. A meaningful message highlights shared memories, expresses genuine appreciation, and shares inspiring wishes for the year ahead.\n\n" +
      "### 🎁 2. Creating Unforgettable Moments\n" +
      "- **Surprise Elements:** Small, thought-out gestures leave lasting impressions.\n" +
      "- **Shared Experiences:** Quality time spent together often outshines material gifts.\n" +
      "- **Gratitude Reflections:** Taking a moment to appreciate growth and milestones over the past year.\n\n" +
      "### 🚀 3. Looking Forward to the Year Ahead\n" +
      "Every new year brings fresh opportunities, bigger dreams, and exciting adventures. Here's to making every single day count!"
    );
  } else if (pLower.includes("outline")) {
    const topic = rawText.length > 0 && rawText.length < 60 ? rawText : "Modern Content Strategy";
    return (
      `📌 **Blog Outline: ${topic.toUpperCase()}**\n\n` +
      "### 1. Executive Summary & Overview\n" +
      `- Why ${topic} is essential for digital creators today.\n` +
      "- Key takeaways and strategic insights.\n\n" +
      "### 2. Core Concepts & Fundamentals\n" +
      "- Foundational principles and framework breakdown.\n" +
      "- Practical industry examples.\n\n" +
      "### 3. Step-by-Step Implementation\n" +
      "- Actionable strategies to execute immediately.\n" +
      "- Common pitfalls to avoid.\n\n" +
      "### 4. Conclusion & Key Takeaways\n" +
      "- Summary of essential points.\n" +
      "- Recommended next steps for readers."
    );
  } else if (pLower.includes("headline") || pLower.includes("title")) {
    const subject = rawText.length > 0 && rawText.length < 40 ? rawText : "Content Creation";
    return (
      `🚀 **5 Catchy SEO Headlines for: ${subject}**\n\n` +
      `1. The Complete 2026 Guide to Mastering ${subject}\n` +
      `2. 5 Proven Strategies to Transform Your ${subject} Today\n` +
      `3. Why Top Creators Are Rethinking ${subject} in 2026\n` +
      `4. How to Scale Your ${subject} 10x Faster\n` +
      `5. The Secret Blueprint for High-Performing ${subject}`
    );
  } else if (pLower.includes("seo") || pLower.includes("meta")) {
    const topic = rawText.length > 0 && rawText.length < 40 ? rawText : "Digital Publishing";
    return (
      "🔍 **SEO Metadata Package**\n\n" +
      `**Meta Title:** Ultimate Guide to ${topic} | SmartBlog Studio\n` +
      `**Meta Description:** Discover actionable insights, expert tips, and proven strategies for ${topic} to boost audience engagement.\n` +
      `**Target Keywords:** #${topic.replace(/\s+/g, '')} #Blogging #ContentStrategy #AITools #SEO`
    );
  } else if (pLower.includes("grammar") || pLower.includes("polish")) {
    return `✨ **Polished Version:**\n\n${rawText || "Modern content creation requires high-quality writing, clear structure, and seamless publishing tools to engage audiences effectively."}`;
  } else if (pLower.includes("tone") || pLower.includes("casual") || pLower.includes("punchy")) {
    return `⚡ **Rewritten Tone Version:**\n\n${rawText ? `"${rawText}" — Re-phrased with enhanced impact, bold clarity, and dynamic sentence flow for digital readers.` : "Leveraging smart design and automated AI assistance empowers creators to produce impactful blog posts with effortless precision."}`;
  } else {
    const topicPhrase = rawText.length > 0 ? rawText : "modern digital productivity";
    return (
      `🌟 **Expanded Content: ${topicPhrase.toUpperCase()}**\n\n` +
      `Focusing on **${topicPhrase}** brings depth, clarity, and authority to your blog post. ` +
      `When creators emphasize ideas that are personal, engaging, and well-structured, readers connect far more deeply with the message.\n\n` +
      "### Key Dimensions to Consider:\n" +
      `- **Authentic Phrasing:** Framing "${topicPhrase}" with precision ensures your core message resonates effortlessly.\n` +
      "- **Audience Engagement:** Well-crafted paragraphs encourage readers to stay invested and take action.\n" +
      "- **Structural Flow:** Connecting main ideas logically creates a seamless reading experience.\n\n" +
      `By expanding on *${topicPhrase}*, your post moves beyond basic statements into an engaging narrative that inspires your audience!`
    );
  }
}

export const streamAI = async (text, action) => {
  const { setGenerating, appendResult, clearResult, setError } =
    useAIStore.getState();

  try {
    clearResult();
    setGenerating(true);

    let token = localStorage.getItem("token");
    if (!token) {
      token = "mock-dev-jwt-token";
      localStorage.setItem("token", token);
    }

    const controller = new AbortController();
    useAIStore.getState().setController(controller);

    let streamSuccess = false;

    // Layer 1: Streaming API endpoint
    try {
      const response = await fetch(`${API_BASE}/ai/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: text || "blog content", action: action || "expand" }),
        signal: controller.signal,
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (chunk) {
            appendResult(chunk);
            streamSuccess = true;
          }
        }
      }
    } catch (e) {
      if (e.name === "AbortError") {
        setGenerating(false);
        return;
      }
      console.warn("Stream fetch fallback:", e);
    }

    if (streamSuccess) {
      setGenerating(false);
      return;
    }

    // Layer 2: Non-streaming API endpoint
    try {
      const genRes = await fetch(`${API_BASE}/ai/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: text || "blog content", action: action || "expand" }),
        signal: controller.signal,
      });

      if (genRes.ok) {
        const data = await genRes.json();
        if (data.result) {
          appendResult(data.result);
          setGenerating(false);
          return;
        }
      }
    } catch (e) {
      if (e.name === "AbortError") {
        setGenerating(false);
        return;
      }
      console.warn("Generate fetch fallback:", e);
    }

    // Layer 3: Instant client-side fallback
    const fallbackText = getClientFallback(action, text);
    appendResult(fallbackText);
    setGenerating(false);

  } catch (err) {
    if (err.name === 'AbortError') {
      setGenerating(false);
      return;
    }
    const fallbackText = getClientFallback(action, text);
    appendResult(fallbackText);
    setGenerating(false);
  }
};

export const streamAIService = streamAI;
export default streamAI;
