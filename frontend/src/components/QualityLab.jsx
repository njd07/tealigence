import { useState, useRef } from 'react'
import { Upload, FlaskConical, Loader2, Star, Leaf, AlertCircle, XCircle, Camera } from 'lucide-react'
import { analyzeTeaLeaf } from '../lib/api'

export default function QualityLab() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const fileRef = useRef(null)

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setError('')
    setProgress(0)
  }

  const handleDrop = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }

  const handleAnalyze = async () => {
    if (!file) return
    setAnalyzing(true)
    setError('')
    setProgress(0)

    // Fake progress animation (makes it look real)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) { clearInterval(progressInterval); return 90 }
        return prev + Math.random() * 8
      })
    }, 600)

    try {
      const data = await analyzeTeaLeaf(file)
      // Ensure minimum 8 second analysis time for visual effect
      await new Promise(r => setTimeout(r, 7000))
      clearInterval(progressInterval)
      setProgress(100)
      await new Promise(r => setTimeout(r, 300))
      setResult(data.analysis)
    } catch (err) {
      clearInterval(progressInterval)
      setError(err.message)
    } finally {
      setAnalyzing(false)
      setProgress(0)
    }
  }

  const resetAll = () => { setFile(null); setPreview(null); setResult(null); setError(''); setProgress(0) }

  const ScoreRing = ({ score }) => {
    const color = score >= 80 ? '#059669' : score >= 60 ? '#d97706' : '#dc2626'
    const circumference = 2 * Math.PI * 42
    const offset = circumference - (score / 100) * circumference
    return (
      <div className="relative w-28 h-28 mx-auto">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#e7e5e4" strokeWidth="6" />
          <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{color}}>{score}</span>
          <span className="text-[10px] text-stone-500 -mt-0.5">/ 100</span>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container bg-tea-gradient-light">
      <div className="max-w-5xl mx-auto">
        <div className="page-header animate-fade-in-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <FlaskConical size={20} className="text-emerald-700" />
            </div>
            <h1>Quality Assessment Lab</h1>
          </div>
          <p className="ml-[52px]">Upload a tea leaf image for AI-powered grading & analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <div className="animate-fade-in-up delay-100">
            <div className="glass-card-strong p-6 sm:p-8">
              {!preview ? (
                <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-emerald-200 rounded-2xl p-12 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-5 group-hover:scale-105 transition-transform">
                    <Camera size={28} className="text-emerald-600" />
                  </div>
                  <p className="text-sm font-semibold text-stone-700 mb-1.5">Drop tea leaf image here</p>
                  <p className="text-xs text-stone-500 mb-5">or click to browse • JPG, PNG up to 10MB</p>
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-xs font-medium rounded-lg shadow-sm group-hover:bg-emerald-700 transition-colors">
                    <Upload size={14} /> Choose File
                  </span>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="relative rounded-2xl overflow-hidden bg-stone-900" style={{aspectRatio:'4/3'}}>
                    <img src={preview} alt="Tea leaf" className="w-full h-full object-cover" />
                    {analyzing && (
                      <div className="absolute inset-0">
                        <div className="scan-overlay" />
                        <div className="absolute inset-0 bg-emerald-900/40 flex flex-col items-center justify-center gap-4">
                          <div className="bg-black/70 backdrop-blur-md rounded-2xl px-8 py-5 text-white text-center">
                            <Loader2 size={24} className="animate-spin mx-auto mb-3 text-emerald-400" />
                            <p className="text-sm font-semibold mb-2">Analyzing Tea Sample...</p>
                            <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400 rounded-full transition-all duration-300" style={{width: `${Math.min(progress, 100)}%`}} />
                            </div>
                            <p className="text-[10px] text-white/50 mt-2">{Math.round(Math.min(progress, 100))}% complete</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <button onClick={resetAll} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm z-10">
                      <XCircle size={16} />
                    </button>
                  </div>
                  {!result && (
                    <button id="analyze-btn" onClick={handleAnalyze} disabled={analyzing} className="btn-primary w-full !py-3.5">
                      {analyzing ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><FlaskConical size={16} /> Analyze Tea Leaf</>}
                    </button>
                  )}
                </div>
              )}
              <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={e => handleFile(e.target.files[0])} />
            </div>
            {error && (
              <div className="mt-5 flex items-center gap-2.5 text-sm text-red-600 bg-red-50 border border-red-100 px-5 py-3.5 rounded-xl animate-fade-in">
                <AlertCircle size={16} className="shrink-0" /><span>{error}</span>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="animate-fade-in-up delay-200">
            {result ? (
              <div className="space-y-5">
                {/* Score + Grade */}
                <div className="glass-card-strong p-6 sm:p-8 text-center">
                  <ScoreRing score={result.quality_score || 75} />
                  <p className="mt-4 text-xl font-bold text-stone-800" style={{fontFamily:'var(--font-serif)'}}>{result.grade || 'Tea Grade'}</p>
                  <p className="text-sm text-stone-500 mt-2 leading-relaxed">{result.grade_description || result.leaf_appearance || ''}</p>
                  {result.market_value && (
                    <span className={`inline-block mt-4 px-4 py-1.5 rounded-full text-xs font-semibold ${
                      result.market_value === 'Premium' ? 'bg-emerald-100 text-emerald-700' :
                      result.market_value === 'Standard' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'
                    }`}>{result.market_value} Grade</span>
                  )}
                  {result.tea_type && <p className="text-xs text-stone-400 mt-2">Type: {result.tea_type} • Confidence: {result.confidence_score_pct}%</p>}
                </div>
                {/* Flavor */}
                {result.flavor_profile && (
                  <div className="glass-card p-5 sm:p-6">
                    <h3 className="section-title"><Leaf size={16} className="text-emerald-600" /> Flavor Profile</h3>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      {Object.entries(result.flavor_profile).map(([k, v]) => (
                        <div key={k} className="bg-stone-50/70 rounded-xl px-4 py-3">
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 mb-1">{k}</p>
                          <p className="text-sm font-medium text-stone-700 leading-snug">{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Recommendations */}
                {result.recommendations?.length > 0 && (
                  <div className="glass-card p-5 sm:p-6">
                    <h3 className="section-title"><Star size={16} className="text-amber-500" /> Recommendations</h3>
                    <ul className="space-y-3 mt-3">
                      {result.recommendations.map((r, i) => (
                        <li key={i} className="flex gap-3 text-sm text-stone-600 leading-relaxed">
                          <span className="text-emerald-500 font-bold mt-0.5 shrink-0">→</span><span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card-strong p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-5">
                  <FlaskConical size={28} className="text-stone-400" />
                </div>
                <p className="text-sm font-medium text-stone-500 mb-2">Upload a tea leaf image to get started</p>
                <p className="text-xs text-stone-400">AI will analyze grade, quality score, flavor profile, and provide recommendations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
