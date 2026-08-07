import React, { useState, useEffect } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getRoot, $createParagraphNode, $createTextNode, $getSelection, $isRangeSelection } from "lexical"
import {
  Sparkles,
  Wand2,
  FileText,
  CheckCircle2,
  Copy,
  PlusCircle,
  RefreshCw,
  X,
  Volume2,
  Sliders,
  Search,
  MessageSquare,
  ArrowRight,
  Layers,
  StopCircle,
} from "lucide-react"
import useAIStore from "../../store/useAIStore"
import { streamAIService } from "../../services/aiService"

export default function AIAssistant({ onClose, editorText }) {
  const [editor] = useLexicalComposerContext()
  const { isGenerating, result, error, setGenerating, setController, cancelGeneration, appendResult, clearResult, setError } = useAIStore()
  
  const [customPrompt, setCustomPrompt] = useState("")
  const [selectedTone, setSelectedTone] = useState("professional")
  const [copied, setCopied] = useState(false)

  const presetPrompts = [
    { id: "outline", label: "Blog Outline", icon: FileText, desc: "Generate post structure & subheadings" },
    { id: "expand", label: "Expand Text", icon: Wand2, desc: "Flesh out details & examples" },
    { id: "grammar", label: "Fix & Polish", icon: CheckCircle2, desc: "Correct typos, grammar & syntax" },
    { id: "headline", label: "5 Catchy Titles", icon: Sparkles, desc: "High-converting SEO headlines" },
    { id: "seo_meta", label: "SEO Meta Description", icon: Search, desc: "Meta title, tags & description" },
  ]

  const triggerAIAction = async (actionType, customInput = null) => {
    clearResult()
    setError(null)
    setGenerating(true)

    const textToProcess = customInput || editorText || "Write an engaging blog post about modern digital productivity tools."

    try {
      const controller = await streamAIService(
        textToProcess,
        actionType,
        (chunk) => appendResult(chunk),
        (err) => {
          setError(err.message || "Failed to generate AI response")
          setGenerating(false)
        },
        () => setGenerating(false)
      )
      setController(controller)
    } catch (e) {
      setError(e.message)
      setGenerating(false)
    }
  }

  const handleCustomSubmit = (e) => {
    e.preventDefault()
    if (!customPrompt.trim()) return
    triggerAIAction("expand", customPrompt)
  }

  const handleToneSelect = (tone) => {
    setSelectedTone(tone)
    triggerAIAction(`tone_${tone}`)
  }

  const handleInsertIntoEditor = () => {
    if (!result) return
    editor.update(() => {
      const root = $getRoot()
      const paragraphs = result.split("\n\n")
      paragraphs.forEach((pText) => {
        if (!pText.trim()) return
        const p = $createParagraphNode()
        p.append($createTextNode(pText.trim()))
        root.append(p)
      })
    })
  }

  const handleReplaceSelection = () => {
    if (!result) return
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        selection.insertText(result)
      } else {
        const root = $getRoot()
        root.append($createTextNode("\n" + result))
      }
    })
  }

  const copyToClipboard = () => {
    if (!result) return
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-96 glass-panel border-l border-slate-700/60 h-full flex flex-col justify-between p-5 overflow-y-auto text-slate-200 shadow-2xl">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/30">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white tracking-wide">AI Script Writer</h3>
              <p className="text-xs text-indigo-300">Generative Content Studio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Custom Prompt Bar */}
        <form onSubmit={handleCustomSubmit} className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Ask AI Assistant
          </label>
          <div className="relative">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Write an intro for a blog post on AI trends..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl py-3 pl-3.5 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner"
            />
            <button
              type="submit"
              disabled={isGenerating || !customPrompt.trim()}
              className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </form>

        {/* Tone Selector */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Writing Tone
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "professional", label: "Professional" },
              { id: "casual", label: "Casual" },
              { id: "punchy", label: "Punchy" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleToneSelect(t.id)}
                className={`py-2 text-xs font-medium rounded-lg border transition ${
                  selectedTone === t.id
                    ? "bg-indigo-600/30 border-indigo-500 text-indigo-200"
                    : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preset AI Actions */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            Quick Generator Presets
          </label>
          <div className="space-y-2">
            {presetPrompts.map((preset) => {
              const Icon = preset.icon
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => triggerAIAction(preset.id)}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-800/60 transition group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                        {preset.label}
                      </div>
                      <div className="text-[11px] text-slate-400">{preset.desc}</div>
                    </div>
                  </div>
                  <Wand2 size={14} className="text-slate-600 group-hover:text-indigo-400 transition" />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Result Display & Insertion Actions */}
      <div className="mt-4 pt-4 border-t border-slate-700/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isGenerating ? "Generating Result..." : "AI Generated Output"}
          </span>
          {isGenerating && (
            <button
              onClick={cancelGeneration}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300"
            >
              <StopCircle size={14} /> Stop
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 text-xs mb-3">
            {error}
          </div>
        )}

        <div className="min-h-[140px] max-h-[220px] overflow-y-auto p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap shadow-inner">
          {result ? (
            result
          ) : isGenerating ? (
            <div className="flex items-center gap-2 text-indigo-400 italic">
              <RefreshCw size={14} className="animate-spin" /> Thinking and writing...
            </div>
          ) : (
            <span className="text-slate-500 italic">
              Select a quick preset or type a prompt above to generate content.
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            type="button"
            onClick={handleInsertIntoEditor}
            disabled={!result || isGenerating}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium text-xs rounded-xl shadow-lg transition"
          >
            <PlusCircle size={15} /> Append to Post
          </button>
          <button
            type="button"
            onClick={copyToClipboard}
            disabled={!result || isGenerating}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition"
          >
            <Copy size={14} /> {copied ? "Copied!" : "Copy Output"}
          </button>
        </div>
      </div>
    </div>
  )
}
