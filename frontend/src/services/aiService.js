import useAIStore from "../store/useAIStore";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "http://127.0.0.1:8000/api"; // 🔥 use local backend while developing

export const streamAI = async (text, action) => {
  const { setGenerating, appendResult, clearResult, setError } =
    useAIStore.getState();

  try {
    clearResult();
    setGenerating(true);

    // ✅ Get token properly
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("User not authenticated. Please login again.");
    }

    const controller = new AbortController();
    useAIStore.getState().setController(controller);

    const response = await fetch(
      `${API_BASE}/ai/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, action }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => null);
      throw new Error(errText || `AI request failed: ${response.status}`);
    }

    // 🔥 Fallback if streaming not supported
    if (!response.body) {
      const genRes = await fetch(
        `${API_BASE}/ai/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text, action }),
          signal: controller.signal,
        }
      );

      if (!genRes.ok) {
        const errText = await genRes.text().catch(() => null);
        throw new Error(errText || `AI generate failed: ${genRes.status}`);
      }

      const data = await genRes.json();
      appendResult(data.result || "");
      setGenerating(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      appendResult(decoder.decode(value, { stream: true }));
    }

    setGenerating(false);

  } catch (err) {
    setError(err.message || "AI generation failed");
    setGenerating(false);
  }
};
