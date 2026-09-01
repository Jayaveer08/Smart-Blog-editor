import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Sparkles, Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react"
import { forgotPassword } from "../services/api"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!email) {
      setErrorMsg("Please enter your email address.")
      return
    }
    try {
      setLoading(true)
      setErrorMsg("")
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      // Even on backend error, show success (prevents email enumeration attacks)
      setSent(true)
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Forgot Password</h1>
          <p className="text-slate-400 text-xs mt-1">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {sent ? (
          <div className="text-center py-4">
            <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-slate-400 text-sm mb-6">
              If an account exists for <span className="text-indigo-300 font-medium">{email}</span>, a password reset link has been sent.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {loading ? <span>Sending...</span> : <><Send size={16} /><span>Send Reset Link</span></>}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
              >
                <ArrowLeft size={13} /> Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
