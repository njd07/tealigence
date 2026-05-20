import { useState, useEffect } from 'react'
import { Truck, Package, AlertTriangle, TrendingUp, Warehouse } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getSupplyChainData } from '../lib/api'

const statusMap = {
  optimal: { label: 'Optimal', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: '#059669' },
  low: { label: 'Low Stock', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', bar: '#d97706' },
  excess: { label: 'Excess', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', bar: '#2563eb' },
  critical: { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', bar: '#dc2626' },
}

const tooltipStyle = {
  contentStyle: { background:'rgba(255,255,255,0.95)', border:'1px solid #e7e5e4', borderRadius:'12px', fontSize:'12px', boxShadow:'0 4px 16px rgba(0,0,0,0.08)' },
  labelStyle: { fontWeight:600, color:'#1c1917' }
}

export default function SupplyChain() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSupplyChainData().then(setData).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  if (loading) return (
    <div className="page-container flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
    </div>
  )
  if (!data) return <div className="page-container flex items-center justify-center text-stone-500">Failed to load data</div>

  return (
    <div className="page-container bg-tea-gradient-light">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="page-header animate-fade-in-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Truck size={20} className="text-emerald-700" />
            </div>
            <h1>Supply Chain Analytics</h1>
          </div>
          <p className="ml-[52px]">Demand forecasting, inventory management & wastage alerts</p>
        </div>

        {/* Demand Forecast Chart */}
        <div className="glass-card-strong p-6 mb-6 animate-fade-in-up delay-100">
          <h3 className="section-title"><TrendingUp size={16} className="text-emerald-600" /> Demand Forecast (tonnes)</h3>
          <div className="h-[300px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.demand_forecast} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" />
                <XAxis dataKey="month" tick={{fontSize:12,fill:'#78716c'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize:12,fill:'#78716c'}} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="actual" fill="#059669" radius={[4,4,0,0]} name="Actual" barSize={20} />
                <Bar dataKey="predicted" fill="#a7f3d0" radius={[4,4,0,0]} name="Predicted" barSize={20} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize:'12px'}} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inventory Status */}
          <div className="glass-card-strong p-7 sm:p-8 animate-fade-in-up delay-200">
            <h3 className="section-title mb-5"><Warehouse size={18} className="text-emerald-600" /> Inventory Status</h3>
            <div className="space-y-6">
              {data.inventory.map((wh, i) => {
                const pct = Math.round((wh.stock_kg / wh.capacity_kg) * 100)
                const cfg = statusMap[wh.status] || statusMap.optimal
                return (
                  <div key={i} className={`p-5 sm:p-6 rounded-2xl border ${cfg.border} ${cfg.bg}`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[15px] font-semibold text-stone-800">{wh.warehouse}</span>
                      <span className={`text-xs font-bold ${cfg.color} px-3.5 py-1.5 rounded-full ${cfg.bg}`}>{cfg.label}</span>
                    </div>
                    <div className="w-full h-3.5 bg-white/60 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`, background: cfg.bar}} />
                    </div>
                    <div className="flex justify-between mt-3 text-sm text-stone-500">
                      <span>{(wh.stock_kg/1000).toFixed(1)}T of {(wh.capacity_kg/1000).toFixed(0)}T</span>
                      <span className="font-semibold">{pct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Wastage Alerts */}
          <div className="glass-card-strong p-7 sm:p-8 animate-fade-in-up delay-300">
            <h3 className="section-title mb-5"><AlertTriangle size={18} className="text-red-500" /> Wastage Alerts</h3>
            <div className="space-y-5">
              {data.wastage_alerts.map((alert) => (
                <div key={alert.id} className={`p-5 sm:p-6 rounded-2xl border ${
                  alert.severity === 'high' ? 'bg-red-50 border-red-200' :
                  alert.severity === 'medium' ? 'bg-amber-50 border-amber-200' : 'bg-stone-50 border-stone-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className={`text-[11px] uppercase tracking-wider font-bold ${
                      alert.severity === 'high' ? 'text-red-600' :
                      alert.severity === 'medium' ? 'text-amber-600' : 'text-stone-500'
                    }`}>{alert.type} • {alert.severity}</span>
                  </div>
                  <p className="text-[15px] text-stone-700 leading-relaxed">{alert.message}</p>
                  <p className="text-sm text-stone-400 mt-3">{alert.warehouse}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
