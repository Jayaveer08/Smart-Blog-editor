import useAIStore from "../store/useAIStore";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

export const streamAI = async (text, action, token) => {
  const { setGenerating, appendResult, clearResult, setError } =
    useAIStore.getState();

  try {
    clearResult();
    setGenerating(true);

    // Create AbortController so we can cancel streaming from UI
    const controller = new AbortController();
    useAIStore.getState().setController(controller);

    const response = await fetch(
      `${API_BASE.replace(/\/$/, "")}/ai/stream`,
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

    if (!response.body) {
      throw new Error("AI stream has no body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        appendResult(chunk);
      }
    } finally {
      // clear controller reference when finished
      useAIStore.getState().setController(null);
      setGenerating(false);
    }
  } catch (err) {
    // If aborted, provide a friendly message
    if (err.name === "AbortError") {
      setError("AI generation cancelled");
    } else {
      setError(err.message || "AI generation failed");
    }
    useAIStore.getState().setController(null);
    setGenerating(false);
  }
};
