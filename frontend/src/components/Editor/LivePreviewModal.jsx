import React, { useState } from "react"
import {
  X,
  Smartphone,
  Monitor,
  Calendar,
  Clock,
  User,
  Share2,
  Bookmark,
  Eye,
  CheckCircle2,
} from "lucide-react"

export default function LivePreviewModal({ post, onClose }) {
  const [device, setDevice] = useState("desktop") // desktop | mobile

  if (!post) return null

  // Extract raw text or children from post content structure
  const extractTextContent = (content) => {
    if (!content?.root?.children) return post.title || "Blog Post Preview"
    return content.root.children
      .map((node) => {
        if (node.children) {
          return node.children.map((c) => c.text || "").join("")
        }
        return ""
      })
      .filter(Boolean)
  }

  const paragraphs = extractTextContent(post.content)

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[90vh] glass-panel border border-slate-700/80 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full">
              <CheckCircle2 size={13} /> Wix Site Live Preview
            </span>
            <span className="text-xs text-slate-400">
              {device === "desktop" ? "1280px Desktop View" : "375px Mobile View"}
            </span>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              onClick={() => setDevice("desktop")}
              className={`p-1.5 rounded-lg transition ${
                device === "desktop" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Desktop Preview"
            >
              <Monitor size={16} />
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`p-1.5 rounded-lg transition ${
                device === "mobile" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Mobile Preview"
            >
              <Smartphone size={16} />
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-y-auto bg-slate-950 flex justify-center p-6">
          <div
            className={`transition-all duration-300 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-slate-200 ${
              device === "mobile" ? "w-[390px] min-h-[700px]" : "w-full max-w-3xl"
            }`}
          >
            {/* Wix Blog Template Header */}
            <div className="mb-8 pb-6 border-b border-slate-800">
              <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
                Technology & AI
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
                {post.title || "Untitled Blog Post"}
              </h1>

              {/* Author & Metadata Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    NJ
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">Jayaveer</div>
                    <div>Senior Tech Editor</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> {new Date(post.created_at || Date.now()).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} /> 3 min read
                  </span>
                </div>
              </div>
            </div>

            {/* Wix Hero Banner Image */}
            <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden mb-8 border border-slate-800 bg-gradient-to-tr from-indigo-900/40 via-purple-900/30 to-slate-900 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="text-4xl mb-2">🚀</div>
                <div className="text-sm font-medium text-indigo-300">Wix Blog Featured Banner</div>
              </div>
            </div>

            {/* Post Content */}
            <div className="prose prose-invert prose-lg max-w-none space-y-5 text-slate-300 leading-relaxed">
              {paragraphs.length > 0 ? (
                paragraphs.map((p, idx) => (
                  <p key={idx} className="text-base sm:text-lg">
                    {p}
                  </p>
                ))
              ) : (
                <p className="text-slate-500 italic">No post content to preview yet.</p>
              )}
            </div>

            {/* Footer Article Actions */}
            <div className="mt-12 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition">
                  <Share2 size={14} /> Share Post
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition">
                  <Bookmark size={14} /> Save
                </button>
              </div>
              <div>Published via Smart Blog Editor</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
