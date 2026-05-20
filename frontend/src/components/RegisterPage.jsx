import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Leaf, Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react'
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
    <div className="min-h-screen bg-login-gradient flex items-center justify-center p-4 tea-pattern overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="absolute text-emerald-300/20 animate-float" style={{
          left: `${15 + i * 14}%`, top: `${10 + (i * 17) % 70}%`,
          fontSize: `${18 + i * 6}px`, animationDelay: `${i * 0.6}s`, animationDuration: `${3 + i * 0.5}s`
        }}>🍃</div>
      ))}

      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-lg">
            <Leaf size={28} className="text-emerald-200" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight" style={{fontFamily:'var(--font-serif)'}}>Tealigence</h1>
          <p className="text-emerald-200/70 text-sm mt-2">Create your account</p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-7 shadow-2xl border border-white/50">
          <h2 className="text-lg font-semibold text-stone-800 mb-6">Register</h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">Username</label>
              <input id="register-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="input-field" placeholder="Choose a username" autoFocus />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input id="register-password" type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-field !pr-12" placeholder="Create a password" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors p-1">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">Confirm Password</label>
              <input id="register-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className="input-field" placeholder="Confirm your password" />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">{error}</p>
            )}

            <button id="register-submit" type="submit" disabled={loading} className="btn-primary w-full !mt-6">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><UserPlus size={16} /> Create Account</>}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-xs text-emerald-200/40 mt-6">Tea Research Association</p>
      </div>
    </div>
  )
}
