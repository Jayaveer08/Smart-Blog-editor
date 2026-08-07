import React, { useState, useEffect } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection, $createTextNode } from "lexical"
import { Sparkles, Wand2, CheckCircle2, Zap } from "lucide-react"
import useAIStore from "../../store/useAIStore"
import { streamAIService } from "../../services/aiService"

export default function BubbleMenu({ onOpenAIPanel }) {
  const [editor] = useLexicalComposerContext()
  const [position, setPosition] = useState(null)
  const [selectedText, setSelectedText] = useState("")

  const { setGenerating, setController, appendResult, clearResult, setError } = useAIStore()

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection) && !selection.isCollapsed()) {
          const text = selection.getTextContent()
          if (text.trim().length > 0) {
            const domSelection = window.getSelection()
            if (domSelection && domSelection.rangeCount > 0) {
              const range = domSelection.getRangeAt(0)
              const rect = range.getBoundingClientRect()
              setPosition({
                top: rect.top - 50,
                left: rect.left + rect.width / 2,
              })
              setSelectedText(text)
              return
            }
          }
        }
        setPosition(null)
        setSelectedText("")
      })
    })
  }, [editor])

  if (!position || !selectedText) return null

  const handleInlineAction = async (actionType) => {
    clearResult()
    setError(null)
    setGenerating(true)
    if (onOpenAIPanel) onOpenAIPanel()

    try {
      const controller = await streamAIService(
        selectedText,
        actionType,
        (chunk) => appendResult(chunk),
        (err) => setError(err.message),
        () => setGenerating(false)
      )
      setController(controller)
    } catch (e) {
      setError(e.message)
      setGenerating(false)
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: `${Math.max(10, position.top)}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
        zIndex: 50,
      }}
      className="flex items-center gap-1.5 p-1.5 bg-slate-900/95 border border-indigo-500/50 rounded-xl shadow-2xl backdrop-blur-md text-xs font-medium text-slate-200 animate-in fade-in zoom-in-95 duration-150"
    >
      <button
        type="button"
        onClick={() => handleInlineAction("grammar")}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 hover:text-white border border-indigo-500/40 transition text-indigo-300"
      >
        <CheckCircle2 size={13} /> Fix
      </button>

      <button
        type="button"
        onClick={() => handleInlineAction("expand")}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition"
      >
        <Wand2 size={13} className="text-amber-400" /> Expand
      </button>

      <button
        type="button"
        onClick={() => handleInlineAction("tone_punchy")}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition"
      >
        <Zap size={13} className="text-emerald-400" /> Punchy
      </button>

      <button
        type="button"
        onClick={() => handleInlineAction("summary")}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition"
      >
        <Sparkles size={13} className="text-indigo-400" /> Summary
      </button>
    </div>
  )
}
