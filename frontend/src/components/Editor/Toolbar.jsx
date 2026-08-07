import React from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
} from "lexical"
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from "@lexical/list"
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text"
import {
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo2,
  Redo2,
  Sparkles,
  Minus,
} from "lucide-react"

export default function Toolbar({ onToggleAIPanel, showAIPanel }) {
  const [editor] = useLexicalComposerContext()

  const formatHeading = (level) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const heading = $createHeadingNode(level)
        selection.insertNodes([heading])
      }
    })
  }

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const quote = $createQuoteNode()
        selection.insertNodes([quote])
      }
    })
  }

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const paragraph = $createParagraphNode()
        selection.insertNodes([paragraph])
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-lg text-slate-300">
      {/* Left Formatting Group */}
      <div className="flex flex-wrap items-center gap-1">
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          title="Undo (Ctrl+Z)"
          className="sloth-toolbar-btn"
        >
          <Undo2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          title="Redo (Ctrl+Y)"
          className="sloth-toolbar-btn"
        >
          <Redo2 size={16} />
        </button>

        <div className="w-[1px] h-5 bg-slate-700 mx-1" />

        {/* Headings & Block types */}
        <button
          type="button"
          onClick={formatParagraph}
          title="Normal Text"
          className="sloth-toolbar-btn"
        >
          <Type size={16} />
        </button>
        <button
          type="button"
          onClick={() => formatHeading("h1")}
          title="Heading 1"
          className="sloth-toolbar-btn"
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={() => formatHeading("h2")}
          title="Heading 2"
          className="sloth-toolbar-btn"
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => formatHeading("h3")}
          title="Heading 3"
          className="sloth-toolbar-btn"
        >
          <Heading3 size={16} />
        </button>

        <div className="w-[1px] h-5 bg-slate-700 mx-1" />

        {/* Text Format Styles */}
        <button
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
          title="Bold (Ctrl+B)"
          className="sloth-toolbar-btn"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
          title="Italic (Ctrl+I)"
          className="sloth-toolbar-btn"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
          title="Underline (Ctrl+U)"
          className="sloth-toolbar-btn"
        >
          <Underline size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
          title="Strikethrough"
          className="sloth-toolbar-btn"
        >
          <Strikethrough size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
          title="Inline Code"
          className="sloth-toolbar-btn"
        >
          <Code size={16} />
        </button>

        <div className="w-[1px] h-5 bg-slate-700 mx-1" />

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() =>
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
          }
          title="Bullet List"
          className="sloth-toolbar-btn"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
          }
          title="Numbered List"
          className="sloth-toolbar-btn"
        >
          <ListOrdered size={16} />
        </button>
        <button
          type="button"
          onClick={formatQuote}
          title="Quote Block"
          className="sloth-toolbar-btn"
        >
          <Quote size={16} />
        </button>

        <div className="w-[1px] h-5 bg-slate-700 mx-1" />

        {/* Text Alignment */}
        <button
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
          title="Align Left"
          className="sloth-toolbar-btn"
        >
          <AlignLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
          title="Align Center"
          className="sloth-toolbar-btn"
        >
          <AlignCenter size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
          title="Align Right"
          className="sloth-toolbar-btn"
        >
          <AlignRight size={16} />
        </button>
      </div>

      {/* Right Action Group (AI Assistant Toggle) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleAIPanel}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition border ${
            showAIPanel
              ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20"
              : "bg-indigo-950/60 text-indigo-300 border-indigo-700/50 hover:bg-indigo-900/60"
          }`}
        >
          <Sparkles size={14} className="text-amber-400 animate-pulse" />
          <span>AI Script Writer</span>
        </button>
      </div>
    </div>
  )
}
