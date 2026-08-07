import React, { useState } from "react"
import { usePostStore } from "../store/usePostStore"
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  BarChart3,
  BookOpen,
  Trash2,
  FolderKanban,
} from "lucide-react"

export default function Sidebar() {
  const { posts, currentPost, fetchPostById, createNewPost } = usePostStore()
  const [filter, setFilter] = useState("all") // all | draft | published
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPosts = posts.filter((post) => {
    const matchesFilter =
      filter === "all" ? true : post.status === filter
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const draftsCount = posts.filter((p) => p.status === "draft").length
  const publishedCount = posts.filter((p) => p.status === "published").length

  return (
    <aside className="w-72 glass-panel border-r border-slate-700/60 h-[calc(100vh-4rem)] flex flex-col justify-between p-4 text-slate-300">
      <div>
        {/* Top Header & Create Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderKanban size={18} className="text-indigo-400" />
            <h2 className="font-bold text-sm tracking-wide text-white uppercase">
              Wix Studio Blog
            </h2>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300 font-semibold">
            {posts.length} Posts
          </span>
        </div>

        <button
          onClick={createNewPost}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition mb-4"
        >
          <Plus size={16} /> Create New Post
        </button>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-xl mb-4 text-xs font-medium">
          {[
            { id: "all", label: `All (${posts.length})` },
            { id: "draft", label: `Drafts (${draftsCount})` },
            { id: "published", label: `Live (${publishedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`py-1.5 rounded-lg transition text-center text-[11px] ${
                filter === tab.id
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Post List */}
        <div className="space-y-1.5 max-h-[calc(100vh-22rem)] overflow-y-auto pr-1">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 italic">
              No posts found.
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isSelected = currentPost?._id === post._id
              const isPublished = post.status === "published"

              return (
                <div
                  key={post._id}
                  onClick={() => fetchPostById(post._id)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-start justify-between gap-2 group ${
                    isSelected
                      ? "bg-indigo-950/60 border-indigo-500/70 text-white shadow-md shadow-indigo-950/50"
                      : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/60 text-slate-300"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      {isPublished ? (
                        <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Clock size={12} className="text-amber-400 flex-shrink-0" />
                      )}
                      <span className="text-xs font-semibold truncate leading-snug">
                        {post.title || "Untitled Post"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{isPublished ? "Published" : "Draft"}</span>
                      <span>•</span>
                      <span>{new Date(post.created_at || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Quick Blog Studio Stats Footer */}
      <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center justify-between py-1">
          <span className="flex items-center gap-1.5">
            <BarChart3 size={14} className="text-indigo-400" /> Studio Status
          </span>
          <span className="text-emerald-400 font-semibold">Online</span>
        </div>
      </div>
    </aside>
  )
}
