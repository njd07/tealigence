import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Leaf, Eye, EyeOff, UserPlus, Loader2, ArrowLeft } from 'lucide-react'
import { registerUser } from '../lib/api'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!username || !password) return setError('Please fill in all fields')
    if (password !== confirm) return setError('Passwords do not match')
    if (password.length < 4) return setError('Password must be at least 4 characters')
    setLoading(true)
    setError('')
    try {
      await registerUser(username, password)
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] bg-login-gradient relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-400/10 blur-3xl" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute text-emerald-300/10 animate-float" style={{
              left: `${10 + i * 12}%`, top: `${5 + (i * 13) % 80}%`,
              fontSize: `${20 + i * 5}px`, animationDelay: `${i * 0.5}s`, animationDuration: `${3 + i * 0.4}s`
            }}>🍃</div>
          ))}
        </div>
        <div className="relative z-10 max-w-lg">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-8 border border-white/15">
            <Leaf size={30} className="text-emerald-200" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 leading-tight" style={{fontFamily:'var(--font-serif)'}}>
            Join Tealigence
          </h1>
          <p className="text-lg text-emerald-100/80 leading-relaxed">
            Create your account to access AI-powered tea intelligence — from farm advisory to market analytics.
          </p>
          <p className="text-xs text-emerald-300/30 mt-12">Tea Research Association</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-5 py-8 sm:p-10 overflow-x-hidden" style={{background:'linear-gradient(160deg,#f8faf8 0%,#f0fdf4 100%)'}}>
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Leaf size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-stone-800" style={{fontFamily:'var(--font-serif)'}}>Tealigence</h1>
            <p className="text-sm text-stone-500 mt-1">Create your account</p>
          </div>

          <h2 className="text-2xl font-bold text-stone-800 mb-1" style={{fontFamily:'var(--font-serif)'}}>Create Account</h2>
          <p className="text-sm text-stone-500 mb-8">Register to get started</p>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-2 uppercase tracking-wider">Username</label>
              <input id="register-username" type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="input-field !py-3.5" placeholder="Choose a username" autoFocus />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input id="register-password" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="input-field !py-3.5 !pr-12" placeholder="Create a password" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors p-1">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-2 uppercase tracking-wider">Confirm Password</label>
              <input id="register-confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                className="input-field !py-3.5" placeholder="Confirm your password" />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">{error}</div>
            )}

            <button id="register-submit" type="submit" disabled={loading} className="btn-primary w-full !py-3.5 !text-sm !mt-8">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><UserPlus size={16} /> Create Account</>}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200" /></div>
            <div className="relative flex justify-center"><span className="bg-[#f4faf6] px-4 text-xs text-stone-400">or</span></div>
          </div>

          <Link to="/login" className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-stone-200 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>

          <p className="text-center text-xs text-stone-400 mt-8">Tea Research Association © 2025</p>
        </div>
      </div>
    </div>
  )
}
