import { useState, useRef, useEffect } from 'react'
import { Send, Leaf, Bot, User, AlertCircle } from 'lucide-react'
import { sendChatMessage } from '../lib/api'

/* Simple markdown-to-JSX renderer */
function RenderMarkdown({ text }) {
  const lines = text.split('\n')
  const elements = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    // Headers
    if (line.startsWith('### ')) {
      elements.push(<h4 key={i} className="font-bold text-stone-800 mt-3 mb-1 text-[13px]">{parseLine(line.slice(4))}</h4>)
    } else if (line.startsWith('## ')) {
      elements.push(<h3 key={i} className="font-bold text-stone-800 mt-3 mb-1 text-sm">{parseLine(line.slice(3))}</h3>)
    }
    // Table rows
    else if (line.startsWith('|') && line.endsWith('|')) {
      const rows = []
      while (i < lines.length && lines[i].startsWith('|')) {
        const cells = lines[i].split('|').filter(c => c.trim()).map(c => c.trim())
        if (!lines[i].match(/^\|[\s-|]+\|$/)) {
          rows.push(cells)
        }
        i++
      }
      elements.push(
        <div key={`tbl-${i}`} className="overflow-x-auto my-2">
          <table className="w-full text-xs border-collapse">
            {rows.map((r, ri) => (
              <tr key={ri} className={ri === 0 ? 'bg-emerald-50' : 'border-t border-stone-200'}>
                {r.map((c, ci) => ri === 0
                  ? <th key={ci} className="text-left px-2 py-1.5 font-semibold text-stone-700">{parseLine(c)}</th>
                  : <td key={ci} className="px-2 py-1.5 text-stone-600">{parseLine(c)}</td>
                )}
              </tr>
            ))}
          </table>
        </div>
      )
      continue
    }
    // Bullet points
    else if (line.match(/^[-•]\s/)) {
      elements.push(<div key={i} className="flex gap-2 ml-1 my-0.5"><span className="text-emerald-500 shrink-0">•</span><span>{parseLine(line.slice(2))}</span></div>)
    }
    // Empty line
    else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />)
    }
    // Normal paragraph
    else {
      elements.push(<p key={i} className="my-0.5">{parseLine(line)}</p>)
    }
    i++
  }
  return <div className="space-y-0.5">{elements}</div>
}

function parseLine(text) {
  // Split by bold (**text**) and italic (*text*)
  const parts = []
  let remaining = text
  let key = 0
  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    // Italic
    const italicMatch = remaining.match(/\*(.+?)\*/)
    // Inline code
    const codeMatch = remaining.match(/`(.+?)`/)

    const matches = [
      boldMatch && { idx: boldMatch.index, len: boldMatch[0].length, el: <strong key={key++} className="font-semibold text-stone-800">{boldMatch[1]}</strong> },
      italicMatch && !boldMatch?.index?.toString() === italicMatch?.index?.toString() && { idx: italicMatch.index, len: italicMatch[0].length, el: <em key={key++}>{italicMatch[1]}</em> },
      codeMatch && { idx: codeMatch.index, len: codeMatch[0].length, el: <code key={key++} className="bg-stone-100 px-1 py-0.5 rounded text-xs font-mono text-emerald-700">{codeMatch[1]}</code> },
    ].filter(Boolean).sort((a, b) => a.idx - b.idx)

    if (matches.length === 0) {
      parts.push(remaining)
      break
    }
    const first = matches[0]
    if (first.idx > 0) parts.push(remaining.slice(0, first.idx))
    parts.push(first.el)
    remaining = remaining.slice(first.idx + first.len)
  }
  return parts
}

export default function FarmerAdvisory() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '🌿 Namaste! I am your Tealigence AI assistant from the Tea Research Association.\n\nAsk me anything about:\n- Soil health & fertilization\n- Pest & disease management\n- Tea plucking & processing\n- Climate adaptation strategies\n- Tea grading standards\n\nHow can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const handleSend = async () => {
    const msg = input.trim()
    if (!msg || loading) return
    setInput('')
    setError('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const data = await sendChatMessage(msg, messages.map(m => ({ role: m.role, content: m.content })))
      // Simulate thinking delay for cached responses (feels more real)
      await new Promise(r => setTimeout(r, 5000 + Math.random() * 2000))
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (err) {
      setError(err.message)
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Rate limit reached. Please wait a moment and try again.' }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }

  const suggestions = ['How to manage tea mosquito bug?', 'Best fertilizer schedule for Assam tea?', 'What is the ideal soil pH?', 'How to improve CTC tea quality?']

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col" style={{background:'linear-gradient(180deg,#f0fdf4 0%,#f8faf8 100%)'}}>
      {/* Header */}
      <div className="px-5 sm:px-8 py-5 border-b border-emerald-100/60" style={{background:'rgba(255,255,255,0.7)',backdropFilter:'blur(12px)'}}>
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Bot size={22} className="text-emerald-700" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-stone-800" style={{fontFamily:'var(--font-serif)'}}>Farmer Advisory</h1>
            <p className="text-sm text-stone-500 mt-0.5">Powered by Tea Research Association Knowledge Base • RAG AI</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-6">
        <div className="max-w-4xl mx-auto space-y-7">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3.5 animate-fade-in-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                msg.role === 'user' ? 'bg-amber-100' : 'bg-emerald-100'
              }`}>
                {msg.role === 'user' ? <User size={16} className="text-amber-700" /> : <Leaf size={16} className="text-emerald-700" />}
              </div>
              <div className={`max-w-[90%] sm:max-w-[82%] lg:max-w-[78%] px-6 py-5 text-[15px] leading-[1.8] ${
                msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
              }`}>
                {msg.role === 'assistant' ? <RenderMarkdown text={msg.content} /> : msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Leaf size={14} className="text-emerald-700" />
              </div>
              <div className="chat-bubble-ai px-5 py-4 flex items-center gap-2">
                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                <span className="text-xs text-emerald-600/60 ml-1">Thinking...</span>
              </div>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2.5 text-sm text-red-600 bg-red-50 border border-red-100 px-5 py-3.5 rounded-xl animate-fade-in">
              <AlertCircle size={16} className="shrink-0" /><span>{error}</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Suggestions — always visible */}
      <div className="px-5 sm:px-8 pb-3">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-2.5">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => { setInput(s); inputRef.current?.focus() }}
              className="px-4 py-2.5 text-sm font-medium bg-white border border-emerald-200 text-emerald-700 rounded-full hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-sm">
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="px-5 sm:px-8 py-5 border-t border-emerald-100/60" style={{background:'rgba(255,255,255,0.8)',backdropFilter:'blur(12px)'}}>
        <div className="max-w-4xl mx-auto flex gap-3">
          <textarea id="chat-input" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Ask about tea cultivation, pest management, soil health..."
            rows={1} className="input-field flex-1 resize-none !py-3.5 !text-[15px]" />
          <button id="chat-send" onClick={handleSend} disabled={!input.trim() || loading} className="btn-primary !px-5 shrink-0">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
