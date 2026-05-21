import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Leaf, Eye, EyeOff, LogIn, Loader2, ArrowRight } from 'lucide-react'
import { loginUser } from '../lib/api'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!username || !password) return setError('Please fill in all fields')
    setLoading(true)
    setError('')
    try {
      const data = await loginUser(username, password)
      localStorage.setItem('tealigence_token', data.token)
      localStorage.setItem('tealigence_user', data.username)
      navigate('/advisory')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] bg-login-gradient relative overflow-hidden items-center justify-center p-12">
        {/* Decorative elements */}
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
            Tealigence
          </h1>
          <p className="text-lg text-emerald-100/80 leading-relaxed mb-10">
            AI-powered intelligence platform for the Assam tea ecosystem. Smart advisory, quality assessment, supply chain analytics & real-time weather — all in one place.
          </p>
          <div className="space-y-4">
            {[
              { emoji: '🌿', text: 'RAG-powered farmer advisory chatbot' },
              { emoji: '🔬', text: 'AI vision-based tea leaf quality grading' },
              { emoji: '📊', text: 'Market intelligence & price analytics' },
              { emoji: '🌤️', text: 'Real-time weather & garden planning' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-white/70">
                <span className="text-lg">{f.emoji}</span>
                <span className="text-sm">{f.text}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-emerald-300/30 mt-12">Tea Research Association</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-5 py-8 sm:p-10 overflow-x-hidden" style={{background:'linear-gradient(160deg,#f8faf8 0%,#f0fdf4 100%)'}}>
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo (visible only on mobile) */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Leaf size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-stone-800" style={{fontFamily:'var(--font-serif)'}}>Tealigence</h1>
            <p className="text-sm text-stone-500 mt-1">AI-Powered Tea Platform</p>
          </div>

          <h2 className="text-2xl font-bold text-stone-800 mb-1" style={{fontFamily:'var(--font-serif)'}}>Welcome back</h2>
          <p className="text-sm text-stone-500 mb-8">Sign in to access your dashboard</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-2 uppercase tracking-wider">Username</label>
              <input id="login-username" type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="input-field !py-3.5" placeholder="Enter your username" autoFocus />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input id="login-password" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="input-field !py-3.5 !pr-12" placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors p-1">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">{error}</div>
            )}

            <button id="login-submit" type="submit" disabled={loading} className="btn-primary w-full !py-3.5 !text-sm !mt-8">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200" /></div>
            <div className="relative flex justify-center"><span className="bg-[#f4faf6] px-4 text-xs text-stone-400">or</span></div>
          </div>

          <Link to="/register" className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-emerald-200 rounded-xl text-sm font-semibold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all">
            Create New Account <ArrowRight size={14} />
          </Link>

          <p className="text-center text-xs text-stone-400 mt-8">Tea Research Association © 2025</p>
        </div>
      </div>
    </div>
  )
}
