import { BarChart3, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Area, AreaChart } from 'recharts'

const priceData = [
  { month: 'Jan', ctc: 245, orthodox: 380, green: 420 },
  { month: 'Feb', ctc: 252, orthodox: 395, green: 415 },
  { month: 'Mar', ctc: 260, orthodox: 410, green: 430 },
  { month: 'Apr', ctc: 275, orthodox: 425, green: 445 },
  { month: 'May', ctc: 290, orthodox: 440, green: 460 },
  { month: 'Jun', ctc: 285, orthodox: 435, green: 455 },
]

const riskData = [
  { name: 'Low Risk', value: 45, color: '#059669' },
  { name: 'Medium', value: 30, color: '#d97706' },
  { name: 'High Risk', value: 15, color: '#dc2626' },
  { name: 'Critical', value: 10, color: '#7f1d1d' },
]

const exportData = [
  { country: 'UK', volume: 2800, compliant: 95 },
  { country: 'Russia', volume: 2200, compliant: 88 },
  { country: 'UAE', volume: 1800, compliant: 92 },
  { country: 'USA', volume: 1500, compliant: 97 },
  { country: 'Germany', volume: 1200, compliant: 91 },
]

const tooltipStyle = {
  contentStyle: { background: 'rgba(255,255,255,0.95)', border: '1px solid #e7e5e4', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  labelStyle: { fontWeight: 600, color: '#1c1917' }
}

export default function TraderDashboard() {
  return (
    <div className="page-container bg-tea-gradient-light">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="page-header animate-fade-in-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <BarChart3 size={20} className="text-emerald-700" />
            </div>
            <h1>Trader Dashboard</h1>
          </div>
          <p className="ml-[52px]">GTAC auction analytics, market intelligence & export compliance</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-8 animate-fade-in-up delay-100">
          {[
            { label: 'Avg CTC Price', value: '₹268/kg', change: '+5.2%', up: true },
            { label: 'Avg Orthodox', value: '₹414/kg', change: '+3.8%', up: true },
            { label: 'Export Volume', value: '9,500 MT', change: '-1.2%', up: false },
            { label: 'Compliance', value: '92.6%', change: '+0.4%', up: true },
          ].map((kpi, i) => (
            <div key={i} className="glass-card-strong px-5 sm:px-6 py-5 sm:py-6">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-2">{kpi.label}</p>
              <p className="text-2xl font-bold text-stone-800">{kpi.value}</p>
              <span className={`text-sm font-semibold ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>{kpi.change}</span>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
          {/* Price Trends */}
          <div className="lg:col-span-2 glass-card-strong p-6 sm:p-8 animate-fade-in-up delay-200">
            <h3 className="section-title mb-4"><TrendingUp size={18} className="text-emerald-600" /> GTAC Price Trends (₹/kg)</h3>
            <div className="h-[280px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceData}>
                  <defs>
                    <linearGradient id="gCTC" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gOrtho" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0891b2" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" />
                  <XAxis dataKey="month" tick={{fontSize:12,fill:'#78716c'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize:12,fill:'#78716c'}} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="ctc" stroke="#059669" fill="url(#gCTC)" strokeWidth={2.5} name="CTC" dot={{r:3,fill:'#059669'}} />
                  <Area type="monotone" dataKey="orthodox" stroke="#d97706" fill="url(#gOrtho)" strokeWidth={2.5} name="Orthodox" dot={{r:3,fill:'#d97706'}} />
                  <Area type="monotone" dataKey="green" stroke="#0891b2" fill="url(#gGreen)" strokeWidth={2.5} name="Green" dot={{r:3,fill:'#0891b2'}} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize:'12px'}} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="glass-card-strong p-6 sm:p-8 animate-fade-in-up delay-300">
            <h3 className="section-title mb-4"><AlertTriangle size={18} className="text-amber-500" /> Spoilage Risk</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" strokeWidth={0}>
                    {riskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize:'11px'}} />
                  <Tooltip {...tooltipStyle} formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Export Compliance */}
        <div className="glass-card-strong p-6 sm:p-8 animate-fade-in-up delay-400">
          <h3 className="section-title mb-4"><ShieldCheck size={18} className="text-emerald-600" /> Export Compliance by Market</h3>
          <div className="h-[260px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exportData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" />
                <XAxis dataKey="country" tick={{fontSize:12,fill:'#78716c'}} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{fontSize:12,fill:'#78716c'}} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" domain={[80,100]} tick={{fontSize:12,fill:'#78716c'}} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar yAxisId="left" dataKey="volume" fill="#059669" radius={[6,6,0,0]} name="Volume (MT)" barSize={32} />
                <Line yAxisId="right" type="monotone" dataKey="compliant" stroke="#d97706" strokeWidth={2.5} name="Compliance %" dot={{r:4,fill:'#d97706'}} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize:'12px'}} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
