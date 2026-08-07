import React, { useEffect, useRef, useState } from "react"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { ListNode, ListItemNode } from "@lexical/list"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
} from "lexical"

import { usePostStore } from "../../store/usePostStore"
import Toolbar from "./Toolbar"
import BubbleMenu from "./BubbleMenu"
import AIAssistant from "./AIAssistant"
import LivePreviewModal from "./LivePreviewModal"
import { Sparkles, Eye, Save, Globe, FileText, CheckCircle2 } from "lucide-react"

/* ===========================
   TITLE BAR COMPONENT
=========================== */
function TitleBar() {
  const { currentPost, updateTitle } = usePostStore()
  const [title, setTitle] = useState(currentPost?.title || "")

  useEffect(() => {
    setTitle(currentPost?.title || "")
  }, [currentPost?._id, currentPost?.title])

  if (!currentPost) return null

  return (
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onBlur={() => updateTitle(title)}
      placeholder="Untitled Blog Post..."
      className="w-full text-3xl sm:text-4xl font-extrabold text-white bg-transparent outline-none border-b border-slate-700/60 pb-3 mb-4 placeholder-slate-600 focus:border-indigo-500 transition"
    />
  )
}

/* ===========================
   LOAD CONTENT PLUGIN
=========================== */
function LoadContentPlugin() {
  const [editor] = useLexicalComposerContext()
  const { currentPost } = usePostStore()
  const loadedPostId = useRef(null)

  useEffect(() => {
    if (!currentPost) return
    if (loadedPostId.current === currentPost._id) return

    loadedPostId.current = currentPost._id

    editor.update(() => {
      try {
        if (!currentPost.content?.root?.children?.length) {
          const root = $getRoot()
          root.clear()
          root.append($createParagraphNode())
          return
        }

        const editorState = editor.parseEditorState(
          JSON.stringify(currentPost.content)
        )
        editor.setEditorState(editorState)
      } catch (err) {
        console.error("Failed to load content:", err)
        const root = $getRoot()
        root.clear()
        root.append($createParagraphNode())
      }
    })
  }, [currentPost?._id, editor])

  return null
}

/* ===========================
   EDITOR STATS & TEXT TRACKER
=========================== */
function StatsTracker({ onTextChange }) {
  const [editor] = useLexicalComposerContext()
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const text = $getRoot().getTextContent()
        if (onTextChange) onTextChange(text)

        const words = text.trim() ? text.trim().split(/\s+/).length : 0
        setWordCount(words)
        setCharCount(text.length)
      })
    })
  }, [editor, onTextChange])

  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
      <span>{wordCount} words</span>
      <span>•</span>
      <span>{charCount} chars</span>
      <span>•</span>
      <span>~{readingTime} min read</span>
    </div>
  )
}

/* ===========================
   MAIN EDITOR COMPONENT
=========================== */
export default function Editor() {
  const { currentPost, savePost, publishCurrentPost, saveStatus } = usePostStore()
  const [showAIPanel, setShowAIPanel] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [editorText, setEditorText] = useState("")
  const timeoutRef = useRef(null)

  const initialConfig = {
    namespace: "SmartBlogEditor",
    theme: {
      text: {
        bold: "font-bold text-white",
        italic: "italic text-slate-200",
        underline: "underline decoration-indigo-400 decoration-2",
        strikethrough: "line-through text-slate-400",
        code: "bg-slate-900 text-sky-400 px-1.5 py-0.5 rounded font-mono text-sm border border-slate-800",
      },
      heading: {
        h1: "text-3xl font-extrabold text-white my-4",
        h2: "text-2xl font-bold text-slate-100 my-3",
        h3: "text-xl font-semibold text-slate-200 my-2",
      },
      quote: "border-l-4 border-indigo-500 pl-4 py-1 italic bg-indigo-950/20 text-slate-300 rounded-r-lg my-3",
    },
    nodes: [ListNode, ListItemNode, HeadingNode, QuoteNode],
    onError(error) {
      console.error("Lexical Error:", error)
    },
  }

  const handleChange = (editorState) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      const json = editorState.toJSON()
      if (!json?.root?.children?.length) return

      json.root.children.forEach((node) => {
        if (node.indent == null || node.indent < 0) {
          node.indent = 0
        }
      })
      savePost(json)
    }, 1000)
  }

  if (!currentPost) return null

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-950 text-slate-100">
        
        {/* Editor Main Canvas */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto p-6 sm:p-8">
          <div>
            {/* Top Action Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-mono text-slate-400">
                  <Save size={13} className={saveStatus === "saving" ? "animate-spin text-amber-400" : "text-emerald-400"} />
                  {saveStatus === "saving" ? "Autosaving..." : saveStatus === "saved" ? "Saved" : "Auto-save active"}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                    currentPost.status === "published"
                      ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
                      : "bg-amber-950/80 border-amber-500/50 text-amber-300"
                  }`}
                >
                  {currentPost.status === "published" ? "Published" : "Draft"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
                >
                  <Eye size={15} /> Wix Site Preview
                </button>
                <button
                  onClick={publishCurrentPost}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition"
                >
                  <Globe size={15} /> Publish Live
                </button>
              </div>
            </div>

            {/* Post Title */}
            <TitleBar />

            {/* slothUI Editor Toolbar */}
            <div className="mb-4">
              <Toolbar
                onToggleAIPanel={() => setShowAIPanel(!showAIPanel)}
                showAIPanel={showAIPanel}
              />
            </div>

            {/* Editor Input Container */}
            <div className="sloth-editor-container relative p-6 min-h-[440px]">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="editor-input focus:outline-none" />
                }
                placeholder={
                  <div className="absolute top-6 left-6 text-slate-500 pointer-events-none italic text-lg">
                    Start drafting your blog post... Highlight text to summon AI commands!
                  </div>
                }
              />
              <HistoryPlugin />
              <ListPlugin />
              <OnChangePlugin onChange={handleChange} />
              <LoadContentPlugin />
              <BubbleMenu onOpenAIPanel={() => setShowAIPanel(true)} />
            </div>
          </div>

          {/* Footer Stats Bar */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <StatsTracker onTextChange={setEditorText} />
            <div className="text-xs text-slate-500">slothUI WYSIWYG Editor v2.0</div>
          </div>
        </div>

        {/* AI Script Writer Side Drawer */}
        {showAIPanel && (
          <AIAssistant
            onClose={() => setShowAIPanel(false)}
            editorText={editorText}
          />
        )}

        {/* Live Wix Website Preview Modal */}
        {showPreview && (
          <LivePreviewModal
            post={currentPost}
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    </LexicalComposer>
  )
}
