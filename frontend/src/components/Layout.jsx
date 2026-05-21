import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Leaf, MessageSquare, FlaskConical, BarChart3, Truck, CloudSun, Menu, X, LogOut, User } from 'lucide-react'

const navItems = [
  { to: '/advisory', label: 'Advisory', icon: MessageSquare },
  { to: '/quality', label: 'Quality Lab', icon: FlaskConical },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/supply-chain', label: 'Supply Chain', icon: Truck },
  { to: '/weather', label: 'Weather', icon: CloudSun },
]

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const user = localStorage.getItem('tealigence_user') || 'User'

  const handleLogout = () => {
    localStorage.removeItem('tealigence_token')
    localStorage.removeItem('tealigence_user')
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{background:'#f8faf8'}}>
      {/* Navbar */}
      <nav className="bg-tea-gradient text-white sticky top-0 z-50" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.1),0 4px 20px rgba(4,78,59,0.15)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/10">
                <Leaf size={18} className="text-emerald-200" />
              </div>
              <span className="text-lg font-bold tracking-tight" style={{fontFamily:'var(--font-serif)'}}>Tealigence</span>
            </div>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-2 ml-8">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive ? 'bg-white/20 text-white shadow-sm' : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`
                  }>
                  <Icon size={16} /><span>{label}</span>
                </NavLink>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center border border-white/10">
                  <User size={14} />
                </div>
                <span className="text-sm text-white/80 font-medium">{user}</span>
              </div>
              <button id="logout-btn" onClick={handleLogout}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-white/60 hover:bg-white/10 hover:text-white transition-all">
                <LogOut size={14} /> Logout
              </button>
              {/* Mobile: logout button always visible */}
              <button onClick={handleLogout}
                className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-white/60 hover:bg-white/10 hover:text-white transition-all">
                <LogOut size={14} />
              </button>
              <button id="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
          <div className="relative w-[300px] h-full bg-white shadow-2xl animate-slide-left flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 bg-tea-gradient">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border border-white/15">
                  <User size={22} className="text-emerald-200" />
                </div>
                <div>
                  <p className="text-white font-semibold">{user}</p>
                  <p className="text-emerald-200/60 text-xs mt-0.5">Tealigence Platform</p>
                </div>
              </div>
            </div>
            <div className="flex-1 py-4 overflow-y-auto">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-7 py-5 text-[15px] font-medium transition-all border-l-[3px] ${
                      isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-600' : 'text-stone-600 hover:bg-stone-50 border-transparent'
                    }`
                  }>
                  <Icon size={22} /><span>{label}</span>
                </NavLink>
              ))}
            </div>
            <div className="p-5 border-t border-stone-100">
              <button onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-all text-sm">
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
