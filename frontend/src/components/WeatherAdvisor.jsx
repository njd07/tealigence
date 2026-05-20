import { useState, useEffect } from 'react'
import { CloudSun, Droplets, Wind, ThermometerSun, Sun, CloudRain, CloudLightning, Cloud, CloudFog, AlertTriangle, Lightbulb, CheckCircle2, XCircle, AlertCircle, MapPin } from 'lucide-react'
import { getWeatherData } from '../lib/api'

const conditionIcons = {
  'Sunny': Sun, 'Mostly Clear': Sun, 'Partly Cloudy': CloudSun, 'Overcast': Cloud,
  'Foggy': CloudFog, 'Fog': CloudFog,
  'Light Drizzle': CloudRain, 'Drizzle': CloudRain, 'Heavy Drizzle': CloudRain,
  'Light Rain': CloudRain, 'Moderate Rain': CloudRain, 'Heavy Rain': CloudRain,
  'Light Showers': CloudRain, 'Showers': CloudRain, 'Heavy Showers': CloudRain,
  'Thunderstorm': CloudLightning, 'Thunderstorm+Hail': CloudLightning, 'Severe Thunderstorm': CloudLightning,
}

const statusConfig = {
  recommended: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  avoid: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  caution: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  urgent: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
}

export default function WeatherAdvisor() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWeatherData().then(setData).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  if (loading) return (
    <div className="page-container flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
    </div>
  )
  if (!data) return <div className="page-container flex items-center justify-center text-stone-500">Failed to load weather data</div>

  const { current, forecast, garden_activities, alerts, climate_tips } = data
  const WeatherIcon = conditionIcons[current.condition] || CloudSun

  return (
    <div className="page-container bg-tea-gradient-light">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="page-header animate-fade-in-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CloudSun size={20} className="text-emerald-700" />
            </div>
            <h1>Weather Advisor</h1>
          </div>
          <p className="ml-[52px]">Real-time weather intelligence & garden activity planning</p>
        </div>

        {/* Current Weather Hero */}
        <div className="glass-card-strong p-6 mb-6 animate-fade-in-up delay-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-5">
              <div className="w-18 h-18 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0" style={{width:72,height:72}}>
                <WeatherIcon size={36} className="text-emerald-600" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-stone-800">{Math.round(current.temperature)}°C</span>
                  <span className="text-sm text-stone-500 font-medium">{current.condition}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-stone-400">
                  <MapPin size={13} /> <span>{current.location}</span>
                  <span className="text-emerald-500 text-xs font-semibold ml-2">● LIVE</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-5 md:gap-8">
              {[
                { icon: Droplets, color: 'text-blue-500', label: 'Humidity', value: `${current.humidity}%` },
                { icon: CloudRain, color: 'text-blue-500', label: 'Rainfall', value: `${current.rainfall_mm}mm` },
                { icon: Wind, color: 'text-stone-400', label: 'Wind', value: `${current.wind_speed_kmh} km/h` },
                { icon: ThermometerSun, color: 'text-amber-500', label: 'UV Index', value: current.uv_index },
              ].map(({ icon: Icon, color, label, value }, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Icon size={18} className={color} />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">{label}</p>
                    <p className="text-sm font-bold text-stone-700">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
          {forecast.map((d, i) => {
            const DayIcon = conditionIcons[d.condition] || CloudSun
            return (
              <div key={i} className="glass-card p-4 text-center animate-fade-in-up" style={{animationDelay:`${0.2+i*0.08}s`}}>
                <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-3">{d.day}</p>
                <DayIcon size={26} className="mx-auto text-emerald-600 mb-2.5" />
                <p className="text-base font-bold text-stone-800">{Math.round(d.high)}° <span className="text-stone-400 font-normal">/ {Math.round(d.low)}°</span></p>
                <div className="mt-2.5 flex items-center justify-center gap-1.5">
                  <Droplets size={11} className="text-blue-400" />
                  <span className={`text-xs font-semibold ${d.rain_chance > 70 ? 'text-blue-600' : 'text-stone-400'}`}>{d.rain_chance}%</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Garden Activities */}
          <div className="glass-card-strong p-7 sm:p-8 animate-fade-in-up delay-300">
            <h3 className="section-title mb-5"><Lightbulb size={18} className="text-amber-500" /> Garden Activity Guide</h3>
            <div className="space-y-5">
              {garden_activities.map((a, i) => {
                const cfg = statusConfig[a.status] || statusConfig.recommended
                const Icon = cfg.icon
                return (
                  <div key={i} className={`p-5 sm:p-6 rounded-2xl border ${cfg.border} ${cfg.bg}`}>
                    <div className="flex items-start gap-4">
                      <Icon size={20} className={`${cfg.color} mt-0.5 shrink-0`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className="text-[15px] font-semibold text-stone-800">{a.activity}</span>
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${cfg.color} ${cfg.bg}`}>{a.status}</span>
                        </div>
                        <p className="text-[15px] text-stone-600 leading-relaxed">{a.note}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-6">
            {/* Weather Alerts */}
            <div className="glass-card-strong p-7 sm:p-8 animate-fade-in-up delay-400">
              <h3 className="section-title mb-5"><AlertTriangle size={18} className="text-red-500" /> Active Alerts</h3>
              <div className="space-y-5">
                {alerts.map((a, i) => (
                  <div key={i} className={`p-5 sm:p-6 rounded-2xl border ${
                    a.severity === 'warning' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                  }`}>
                    <p className={`text-[11px] uppercase tracking-wider font-bold mb-2 ${
                      a.severity === 'warning' ? 'text-red-600' : 'text-amber-600'
                    }`}>{a.type} • {a.severity}</p>
                    <p className="text-[15px] text-stone-700 leading-relaxed">{a.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Climate Tips */}
            <div className="glass-card-strong p-7 sm:p-8 animate-fade-in-up delay-500">
              <h3 className="section-title mb-5"><Lightbulb size={18} className="text-emerald-600" /> Climate Adaptation Tips</h3>
              <ul className="space-y-4">
                {climate_tips.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-[15px] text-stone-600 leading-relaxed">
                    <span className="text-emerald-500 font-bold shrink-0 mt-0.5">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
