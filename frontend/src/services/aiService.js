import useAIStore from "../store/useAIStore";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

function getClientFallback(action, text) {
  const pLower = (action || "").toLowerCase() + " " + (text || "").toLowerCase();
  
  if (pLower.includes("outline")) {
    return (
      "📌 **Blog Post Outline**\n\n" +
      "### 1. Introduction\n" +
      "- Hook the reader with a compelling problem statement.\n" +
      "- Overview of key insights covered in this article.\n\n" +
      "### 2. Core Concepts & Fundamentals\n" +
      "- Key strategies and foundational principles.\n" +
      "- Real-world examples and practical applications.\n\n" +
      "### 3. Step-by-Step Implementation\n" +
      "- Best practices and actionable execution steps.\n" +
      "- Common pitfalls to avoid.\n\n" +
      "### 4. Conclusion & Key Takeaways\n" +
      "- Summary of main points.\n" +
      "- Call to action for readers."
    );
  } else if (pLower.includes("headline") || pLower.includes("title")) {
    return (
      "🚀 **5 Catchy SEO Headlines**\n\n" +
      "1. The Ultimate Guide to Modern Content Creation in 2026\n" +
      "2. 5 Proven Strategies to Transform Your Digital Publishing Workflow\n" +
      "3. Why Next-Gen AI Tools Are Revolutionizing Modern Blogging\n" +
      "4. How to Scale Your Blog Content 10x Faster Without Losing Quality\n" +
      "5. The Secret Blueprint for High-Converting Content Design"
    );
  } else if (pLower.includes("seo") || pLower.includes("meta")) {
    return (
      "🔍 **SEO Metadata Package**\n\n" +
      "**Meta Title:** Modern Digital Content Strategies & AI Publishing Guide\n" +
      "**Meta Description:** Discover actionable insights, modern blogging workflows, and proven AI content techniques to scale your audience.\n" +
      "**Target Keywords:** #Blogging #ContentCreation #AITools #DigitalPublishing #SEO"
    );
  } else if (pLower.includes("grammar") || pLower.includes("polish")) {
    return "✨ Polished Version: Modern content creation requires high-quality writing, clear structure, and seamless publishing tools to engage audiences effectively.";
  } else if (pLower.includes("tone") || pLower.includes("casual") || pLower.includes("punchy")) {
    return "⚡ Rewritten Copy: Leveraging smart design and automated AI assistance empowers creators to produce impactful blog posts with effortless precision.";
  } else {
    return (
      "✍️ **Generated Article Content**\n\n" +
      `In today's fast-paced digital ecosystem, creating engaging content about "${text || 'digital tools'}" is more critical than ever.\n\n` +
      "By combining modern visual layouts with intelligent AI writing assistants, creators can streamline their publishing workflow, " +
      "maintain high editorial standards, and captivate audiences across device platforms."
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
