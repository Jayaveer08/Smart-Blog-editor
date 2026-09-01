import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Sparkles, Mail, ArrowLeft, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import axios from "axios"

const API_BASE = import.meta.env.VITE_API_BASE || "/api"

export default function ForgotPassword() {
  const [step, setStep] = useState(1) // 1=enter email, 2=enter new password
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!email) { setErrorMsg("Please enter your email."); return }
    setLoading(true)
    setErrorMsg("")
    try {
      // Check if the email exists
      const res = await axios.post(`${API_BASE}/auth/check-email`, { email })
      if (res.data.exists) {
        setStep(2)
      } else {
        setErrorMsg("No account found with that email address.")
      }
    } catch {
      // If endpoint not yet deployed, proceed optimistically
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    if (!newPassword || !confirmPw) { setErrorMsg("Please fill in both fields."); return }
    if (newPassword !== confirmPw) { setErrorMsg("Passwords do not match."); return }
    if (newPassword.length < 6) { setErrorMsg("Password must be at least 6 characters."); return }
    setLoading(true)
    setErrorMsg("")
    try {
      await axios.post(`${API_BASE}/auth/reset-password-direct`, {
        email,
        new_password: newPassword,
      })
      setDone(true)
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to reset password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 font-sans">
        <div className="text-center">
          <CheckCircle2 size={56} className="text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Password Updated!</h2>
          <p className="text-slate-400 text-sm mb-6">Your password has been reset successfully.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 py-2.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl transition"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 font-sans relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl z-10">
        {/* Branding */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/25 mb-4">
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Reset Password</h1>
          <p className="text-slate-400 text-xs mt-1">
            {step === 1 ? "Enter your account email to continue" : `Set a new password for ${email}`}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? "bg-indigo-600" : "bg-slate-700"}`} />
          <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? "bg-indigo-600" : "bg-slate-700"}`} />
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? "Checking..." : "Continue →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Re-enter new password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? "Updating..." : "🔑 Update My Password"}
            </button>
            <button type="button" onClick={() => { setStep(1); setErrorMsg("") }} className="w-full text-xs text-slate-400 hover:text-slate-200 transition text-center mt-1">
              ← Use a different email
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition">
            <ArrowLeft size={13} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
