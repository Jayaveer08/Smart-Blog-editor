import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "./Sidebar"
import { usePostStore } from "../store/usePostStore"
import { Sparkles, Command, LogOut, ChevronDown, UserCheck } from "lucide-react"

export default function Layout({ children }) {
  const { fetchPosts } = usePostStore()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Top Wix Studio Navigation Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              SmartBlog<span className="text-indigo-400">Studio</span>
            </span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-medium">
            AI + slothUI
          </span>
        </div>

        {/* Center Quick Nav Badges */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-xs text-slate-400">
          <span className="flex items-center gap-1 text-indigo-300 font-medium">
            <Command size={13} /> WYSIWYG Suite
          </span>
          <span>•</span>
          <span>Wix Studio Engine</span>
          <span>•</span>
          <span>Gemini AI Stream</span>
        </div>

        {/* User Account Monogram with Logout Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/80 transition border border-transparent hover:border-slate-700 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
              NJ
            </div>
            <div className="hidden sm:block text-left text-xs">
              <div className="font-semibold text-slate-200 flex items-center gap-1">
                Jayaveer <ChevronDown size={12} className="text-slate-400" />
              </div>
              <div className="text-[10px] text-slate-400">Blog Editor Pro</div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <UserCheck size={13} className="text-emerald-400" /> Jayaveer
                </div>
                <div className="text-[10px] text-slate-400 truncate">jayaveer@studio.com</div>
              </div>
              
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-950/60 rounded-lg transition"
              >
                <LogOut size={14} /> Sign Out & Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Studio Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden bg-slate-950">{children}</main>
      </div>
    </div>
  )
}
