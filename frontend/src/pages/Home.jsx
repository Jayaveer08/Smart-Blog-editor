import React from "react"
import Layout from "../components/Layout"
import Editor from "../components/Editor/Editor"
import { usePostStore } from "../store/usePostStore"
import { Plus, Sparkles, Wand2, FileText, LayoutTemplate, Globe, ArrowRight } from "lucide-react"

export default function Home() {
  const { currentPost, createNewPost } = usePostStore()

  return (
    <Layout>
      {!currentPost ? (
        <div className="h-full flex items-center justify-center p-8 overflow-y-auto">
          <div className="max-w-2xl w-full text-center">
            {/* Header Icon */}
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-2xl shadow-indigo-500/30 mb-6">
              <Sparkles size={36} className="text-white animate-pulse" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Wix Studio Smart Blog Editor
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8 max-w-lg mx-auto">
              Craft compelling stories with slothUI WYSIWYG text controls, instant AI Script Writer generation, and live Wix website blog preview.
            </p>

            {/* Main Action Button */}
            <button
              onClick={createNewPost}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 mb-10"
            >
              <Plus size={18} /> Start New Blog Post
            </button>

            {/* Template Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-2xl glass-card border border-slate-800">
                <div className="p-2.5 rounded-xl bg-indigo-950 text-indigo-400 w-fit mb-3">
                  <LayoutTemplate size={20} />
                </div>
                <h3 className="font-semibold text-sm text-slate-200 mb-1">slothUI Editor</h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Rich formatting toolbar with Headings, Lists, Quotes, Code & Selection AI menu.
                </p>
              </div>

              <div className="p-4 rounded-2xl glass-card border border-slate-800">
                <div className="p-2.5 rounded-xl bg-purple-950 text-purple-400 w-fit mb-3">
                  <Wand2 size={20} />
                </div>
                <h3 className="font-semibold text-sm text-slate-200 mb-1">AI Script Writer</h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Outline generator, tone switcher, grammar polish, and SEO metadata tools.
                </p>
              </div>

              <div className="p-4 rounded-2xl glass-card border border-slate-800">
                <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-400 w-fit mb-3">
                  <Globe size={20} />
                </div>
                <h3 className="font-semibold text-sm text-slate-200 mb-1">Wix Live Preview</h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Preview post as a live published Wix blog site on Desktop and Mobile.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Editor />
      )}
    </Layout>
  )
}
