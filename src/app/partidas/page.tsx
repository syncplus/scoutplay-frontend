'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { apiErrorMessage } from '@/lib/api'
import { partidasService } from '@/services/partidas'
import { partidaSetsService } from '@/services/partidas-sets'
import { partidaLancamentosService } from '@/services/partidas-lancamentos'
import { useUIStore } from '@/store/ui'
import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { Toast as ErrorToast } from '@/components/Toast'
import type { PartidaDTO, Status, Lado } from '@/types/partida'
import type { SetDTO } from '@/types/partida-set'
import type { LancamentoDTO, Tipo, Qual, Zona } from '@/types/partida-lancamento'

/* ── Types (UI) ────────────────────────────────────────────────────── */
interface Ataque {
  id: string; tipo: Tipo; qualidade: Qual; px: number; py: number; zona: Zona
}

const toAtaque = (l: LancamentoDTO): Ataque => ({
  id: l.id, tipo: l.tipo, qualidade: l.qualidade, px: l.pos_x, py: l.pos_y, zona: l.zona,
})

/* ── Constants ─────────────────────────────────────────────────────── */
// Ordem alinhada ao mapa de ataques (preenche o grid-cols-3 linha a linha):
// linha 1: Z1 Z4 Z7 · linha 2: Z2 Z5 Z8 · linha 3: Z3 Z6 Z9
const ZONES: { code: Zona; abbr: string }[] = [
  {code:'Z1',abbr:'PT'},{code:'Z4',abbr:'PP'},{code:'Z7',abbr:'LP'},
  {code:'Z2',abbr:'PM'},{code:'Z5',abbr:'PA'},{code:'Z8',abbr:'MF'},
  {code:'Z3',abbr:'DC'},{code:'Z6',abbr:'DP'},{code:'Z9',abbr:'DL'},
]
const ZONE_COL: Record<Zona,number> = {Z1:0,Z2:0,Z3:0,Z4:1,Z5:1,Z6:1,Z7:2,Z8:2,Z9:2}
const ZONE_ROW: Record<Zona,number> = {Z1:0,Z4:0,Z7:0,Z2:1,Z5:1,Z8:1,Z3:2,Z6:2,Z9:2}
const ZONE_ABBR: Record<Zona,string> = {Z1:'PT',Z2:'PM',Z3:'DC',Z4:'PP',Z5:'PA',Z6:'DP',Z7:'LP',Z8:'MF',Z9:'DL'}
const ZONE_FULL: Record<Zona,string> = {
  Z1:'PT (Pingo p/ trás)', Z2:'PM (Pingo de Meio)', Z3:'DC (Diagonal Curta)',
  Z4:'PP (Porrada Paralela)', Z5:'PA (Paraguaia)', Z6:'DP (Diagonal Porrada)',
  Z7:'LP (Largada Paralela)', Z8:'MF (Meio Fundo)', Z9:'DL (Diagonal Longa)',
}
const QUAL_COLORS: Record<Qual,string>  = { boa:'#22c55e', media:'#f97316', ruim:'#ef4444' }
const TIPO_STROKE: Record<Tipo,string>  = { cabeca:'#F0A500', shark:'#a855f7' }
const QUAL_LABEL:  Record<Qual,string>  = { boa:'Boa', media:'Média', ruim:'Ruim' }
const TIPO_LABEL:  Record<Tipo,string>  = { cabeca:'Cabeça', shark:'Shark' }
const MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const pad = (n: number) => String(n).padStart(2,'0')
const fmtTime = (s: number) => `${pad(Math.floor(s/60))}:${pad(s%60)}`
const fmtDur  = (s: number) => s>=60 ? `${Math.floor(s/60)}m${pad(s%60)}s` : `${s}s`
const fmtData = (iso: string | null) => {
  if (!iso) return '—'
  const [, m, d] = iso.split('-').map(Number)
  return `${d} ${MESES[(m-1)] ?? ''}`
}

const statusLabel     = (s: Status) => ({ prog:'Em progresso', wait:'Aguardando', done:'Finalizada' }[s])
const statusStripe    = (s: Status) => ({ prog:'#16a34a', wait:'#f59e0b', done:'#F0A500' }[s])
const statusPillClass = (s: Status) => ({ prog:'bg-green-900/40 text-green-400', wait:'bg-amber-900/40 text-amber-400', done:'bg-yellow-900/40 text-yellow-400' }[s])
const statusDot       = (s: Status) => ({ prog:'bg-green-500', wait:'bg-amber-400', done:'bg-yellow-400' }[s])

/* ── Modal Nova Partida ─────────────────────────────────────────────── */
function ModalNovaPartida({ onClose, onCreate }: { onClose: () => void; onCreate: (p: { jogador: string; adversario: string; fase: string; lado: Lado; data: string }) => Promise<void> }) {
  const [jogador, setJogador]       = useState('')
  const [adversario, setAdversario] = useState('')
  const [fase, setFase]             = useState('')
  const [lado, setLado]             = useState<Lado>('Esq')
  const [data, setData]             = useState(new Date().toISOString().slice(0,10))
  const [saving, setSaving]         = useState(false)

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-[#F0A500]/60 transition-colors"

  async function handleCreate() {
    if (!jogador.trim() || !fase.trim() || saving) return
    setSaving(true)
    try {
      await onCreate({ jogador: jogador.trim(), adversario: adversario.trim(), fase: fase.trim(), lado, data })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#0f1626] rounded-2xl w-full max-w-md shadow-[0_8px_48px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.07)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h2 className="text-base font-semibold text-white">Nova partida</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/8 text-white/50 hover:bg-white/15 transition-colors text-lg leading-none">×</button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="text-[11px] text-white/40 uppercase tracking-wide block mb-1.5">Jogador / Dupla analisada</label>
            <input className={inputCls} placeholder="Ex: Avatar e Gaúcho" value={jogador} onChange={e=>setJogador(e.target.value)} />
          </div>
          <div>
            <label className="text-[11px] text-white/40 uppercase tracking-wide block mb-1.5">Partida / Fase</label>
            <input className={inputCls} placeholder="Ex: Semi final 1" value={fase} onChange={e=>setFase(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-white/40 uppercase tracking-wide block mb-1.5">Data</label>
              <input type="date" className={inputCls} value={data} onChange={e=>setData(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] text-white/40 uppercase tracking-wide block mb-1.5">Lado</label>
              <div className="flex border border-white/10 rounded-lg overflow-hidden">
                {(['Esq','Dir'] as const).map(l => (
                  <button key={l} onClick={()=>setLado(l)} className={`flex-1 py-2 text-xs font-medium transition-colors ${lado===l?'bg-[#F0A500] text-white':'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                    {l==='Esq'?'Esquerda':'Direita'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-white/40 uppercase tracking-wide block mb-1.5">Adversário (opcional)</label>
            <input className={inputCls} placeholder="Ex: João e Iuri" value={adversario} onChange={e=>setAdversario(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2 justify-end px-5 pb-5">
          <button onClick={onClose} className="bg-transparent border border-white/15 text-white/60 px-5 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors">Cancelar</button>
          <button onClick={handleCreate} disabled={!jogador.trim()||!fase.trim()||saving} className="bg-[#F0A500] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#D4920A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{saving?'Criando…':'Criar partida'}</button>
        </div>
      </div>
    </div>
  )
}

/* ── Partida Card ──────────────────────────────────────────────────── */
function PartidaCard({ p, onOpen, onDelete }: { p: PartidaDTO; onOpen: (p: PartidaDTO) => void; onDelete: (id: string) => void }) {
  return (
    <div className="bg-[#0f1626] rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.05)] hover:shadow-[0_6px_32px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.08)] hover:-translate-y-0.5 transition-all">
      <div style={{ height:4, background: statusStripe(p.status) }} />
      {p.status==='prog' && <div className="h-0.5 bg-white/8"><div className="w-1/2 h-full bg-green-500" /></div>}
      <div className="px-4 pt-3 pb-2.5 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-medium ${statusPillClass(p.status)}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusDot(p.status)}`} />
            {statusLabel(p.status)}
          </span>
          <span className="text-[10px] text-white/30 font-mono">{fmtTime(p.tempo)}</span>
        </div>
        <p className="text-sm font-medium text-white mb-0.5">{p.jogador}</p>
        {p.adversario && <p className="text-[11px] text-white/40">vs {p.adversario}</p>}
      </div>
      <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex gap-1.5">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.lado==='Esq'?'bg-indigo-900/50 text-indigo-300':'bg-pink-900/50 text-pink-300'}`}>{p.lado}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/40">{fmtData(p.data)}</span>
        </div>
        <div className="text-right">
          <p className={`text-lg font-medium leading-none ${p.ataques===0?'text-amber-400':'text-[#F0A500]'}`}>{p.ataques}</p>
          <p className="text-[9px] text-white/30">ataques</p>
        </div>
      </div>
      <div className="px-4 pb-4 flex gap-2">
        <button onClick={()=>onOpen(p)} className="flex-1 bg-green-600 text-white text-xs font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 hover:bg-green-700 active:scale-95 transition-all">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2H3a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V8"/><path d="M9 2h3v3"/><path d="M13 1L7 7"/>
          </svg>
          Abrir
        </button>
        <button onClick={()=>onDelete(p.id)} className="w-10 bg-red-900/50 text-red-400 rounded-lg flex items-center justify-center hover:bg-red-900/70 active:scale-95 transition-all border border-red-900/40">
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3,5 4,5 15,5"/>
            <path d="M6 5V3a1 1 0 011-1h4a1 1 0 011 1v2"/>
            <path d="M14 5l-.867 10.142A2 2 0 0111.138 17H6.862a2 2 0 01-1.995-1.858L4 5"/>
            <line x1="8" y1="9" x2="8" y2="13"/><line x1="10" y1="9" x2="10" y2="13"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

/* ── Timer Strip ───────────────────────────────────────────────────── */
function TimerStrip({ initialSecs, initialFinished, onStart, onPersist, onFinish, onTick }: {
  initialSecs: number; initialFinished: boolean
  onStart: () => void; onPersist: (secs: number) => void; onFinish: (secs: number) => void
  onTick: (secs: number) => void
}) {
  const [secs, setSecs]         = useState(initialSecs)
  const [running, setRunning]   = useState(false)
  const [pauses, setPauses]     = useState(0)
  const [finished, setFinished] = useState(initialFinished)
  const ivRef = useRef<NodeJS.Timeout|null>(null)

  useEffect(() => {
    if (running) { ivRef.current = setInterval(()=>setSecs(s=>s+1),1000) }
    else { if (ivRef.current) clearInterval(ivRef.current) }
    return () => { if (ivRef.current) clearInterval(ivRef.current) }
  }, [running])

  // Reporta o tempo corrido para o pai (placar usa para o tempo do set / total)
  useEffect(() => { onTick(secs) }, [secs])   // eslint-disable-line react-hooks/exhaustive-deps

  // Reabrir partida finalizada: destrava o cronômetro sem remontar o componente
  useEffect(() => { setFinished(initialFinished) }, [initialFinished])

  const color = finished?'text-[#F0A500]':running?'text-green-400':secs>0?'text-amber-400':'text-white/30'
  const btn = (bg: string, disabled: boolean) =>
    `text-xs font-medium px-4 py-1.5 rounded-lg transition-all ${disabled?'bg-white/7 text-white/25 cursor-not-allowed':`${bg} text-white cursor-pointer hover:opacity-90`}`

  function iniciar()  { setRunning(true); onStart() }
  function pausar()   { setRunning(false); setPauses(p=>p+1); onPersist(secs) }
  function retomar()  { setRunning(true) }
  function finalizar(){ setRunning(false); setFinished(true); onFinish(secs) }

  return (
    <div className="bg-[#080c14] px-4 py-3 shadow-[0_1px_0_rgba(255,255,255,0.04),0_4px_12px_rgba(0,0,0,0.5)]">
      <div className="text-center mb-2.5">
        <p className="text-[10px] text-white/35 uppercase tracking-widest mb-1">Tempo de partida</p>
        <p className={`text-3xl font-medium font-mono tracking-widest ${color}`}>{fmtTime(secs)}</p>
      </div>
      <div className="flex gap-2 justify-center">
        <button onClick={iniciar} disabled={running||secs>0||finished} className={btn('bg-green-600',running||secs>0||finished)}>Iniciar</button>
        {running
          ? <button onClick={pausar} className={btn('bg-amber-600',false)}>Pausar</button>
          : <button onClick={retomar} disabled={secs===0||finished} className={btn('bg-[#F0A500]',secs===0||finished)}>Retomar</button>
        }
        <button onClick={finalizar} disabled={secs===0||finished} className={btn('bg-red-600',secs===0||finished)}>Finalizar</button>
      </div>
      <p className="text-center text-white/30 text-[10px] mt-2">
        {finished?`Finalizada · ${fmtTime(secs)} · ${pauses} pausa(s)`:running?`Em andamento · ${pauses} pausa(s)`:secs>0?`Pausado · ${pauses} pausa(s)`:'Partida não iniciada'}
      </p>
    </div>
  )
}

/* ── Placar ────────────────────────────────────────────────────────── */
function PlacarSection({ jogador, adversario, sets, tempoTotal, readOnly, onFinalizeSet }: {
  jogador: string; adversario?: string | null; sets: SetDTO[]; tempoTotal: number; readOnly?: boolean
  onFinalizeSet: (nos: number, them: number) => Promise<void>
}) {
  const [nos, setNos]   = useState(0)
  const [them, setThem] = useState(0)
  const [saving, setSaving] = useState(false)
  const setNum = sets.length + 1

  async function finalizar() {
    if (saving) return
    setSaving(true)
    try {
      await onFinalizeSet(nos, them)
      setNos(0); setThem(0)
    } finally {
      setSaving(false)
    }
  }

  const ScoreBtn = ({ onClick, bg, children }: { onClick:()=>void; bg:string; children:React.ReactNode }) => (
    <button onClick={onClick} className={`w-9 h-9 ${bg} text-white rounded-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all`}>{children}</button>
  )

  return (
    <div className="bg-[#0a0e1a] px-4 py-3 shadow-[0_1px_0_rgba(255,255,255,0.04),0_4px_12px_rgba(0,0,0,0.5)]">
      <p className="text-[10px] text-white/35 uppercase tracking-widest text-center mb-3">Placar</p>
      {!readOnly && (
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="text-center">
          <p className="text-[11px] text-green-400 font-medium mb-1.5 truncate">{jogador}</p>
          <p className="text-[42px] font-medium text-white font-mono leading-none">{nos}</p>
          <div className="flex gap-1.5 justify-center mt-2.5">
            <ScoreBtn onClick={()=>setNos(n=>n+1)} bg="bg-green-600"><svg width="16" height="16" viewBox="0 0 16 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"><path d="M8 2v12M2 8h12"/></svg></ScoreBtn>
            <ScoreBtn onClick={()=>setNos(n=>Math.max(0,n-1))} bg="bg-white/10"><svg width="16" height="16" viewBox="0 0 16 16" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" fill="none"><path d="M2 8h12"/></svg></ScoreBtn>
          </div>
        </div>
        <div className="text-center">
          <p className="text-2xl font-medium text-white/20">×</p>
          <p className="text-[9px] text-white/25 mt-1">SET {setNum}</p>
        </div>
        <div className="text-center">
          <p className="text-[11px] text-red-400 font-medium mb-1.5 truncate">{adversario||'Adversário'}</p>
          <p className="text-[42px] font-medium text-white font-mono leading-none">{them}</p>
          <div className="flex gap-1.5 justify-center mt-2.5">
            <ScoreBtn onClick={()=>setThem(n=>n+1)} bg="bg-red-600"><svg width="16" height="16" viewBox="0 0 16 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"><path d="M8 2v12M2 8h12"/></svg></ScoreBtn>
            <ScoreBtn onClick={()=>setThem(n=>Math.max(0,n-1))} bg="bg-white/10"><svg width="16" height="16" viewBox="0 0 16 16" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" fill="none"><path d="M2 8h12"/></svg></ScoreBtn>
          </div>
        </div>
      </div>
      )}
      {sets.length>0 && (
        <div className="mt-3 border-t border-white/7 pt-2.5">
          <p className="text-[10px] text-white/30 text-center mb-1.5">Histórico de sets</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {sets.map(s=><span key={s.id} className="bg-white/8 rounded-md px-2.5 py-1 text-[11px] text-white/70 font-mono">Set {s.numero}: {s.pontos_jogador}×{s.pontos_adversario} · {fmtDur(s.tempo)}</span>)}
          </div>
        </div>
      )}
      <div className="mt-2.5 text-center">
        <span className="text-[10px] text-white/35">Tempo total da partida · </span>
        <span className="text-[11px] text-white/70 font-mono">{fmtTime(tempoTotal)}</span>
      </div>
      {!readOnly && (
      <div className="mt-2.5 flex justify-center">
        <button onClick={finalizar} disabled={saving} className="text-white/55 hover:text-white/80 text-[11px] bg-white/7 hover:bg-white/12 px-3 py-1.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          {saving?'Salvando…':'Finalizar set e iniciar próximo'}
        </button>
      </div>
      )}
    </div>
  )
}

/* ── Quadra Canvas ─────────────────────────────────────────────────── */
function QuadraCanvas({ ataques, posAtual, onPos }: { ataques:Ataque[]; posAtual:{x:number;y:number;px:number;py:number}|null; onPos:(p:{x:number;y:number;px:number;py:number})=>void }) {
  const areaRef = useRef<HTMLDivElement>(null)
  const cvRef   = useRef<HTMLCanvasElement>(null)

  const draw = useCallback(()=>{
    const cv=cvRef.current; const area=areaRef.current; if(!cv||!area) return
    cv.width=area.offsetWidth; cv.height=area.offsetHeight
    const ctx=cv.getContext('2d')!
    ctx.clearRect(0,0,cv.width,cv.height)
    ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=0.5; ctx.setLineDash([4,3])
    for(let i=1;i<3;i++){ctx.beginPath();ctx.moveTo(0,cv.height*i/3);ctx.lineTo(cv.width,cv.height*i/3);ctx.stroke()}
    ctx.setLineDash([])
    ataques.forEach(a=>{
      const ax=(a.px/100)*cv.width,ay=(a.py/100)*cv.height
      ctx.beginPath();ctx.arc(ax,ay,5,0,Math.PI*2);ctx.fillStyle=QUAL_COLORS[a.qualidade];ctx.fill()
      ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.lineWidth=1.5;ctx.stroke()
    })
    if(posAtual){
      const{x,y}=posAtual
      ctx.beginPath();ctx.arc(x,y,13,0,Math.PI*2);ctx.fillStyle='rgba(240,165,0,0.2)';ctx.fill()
      ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fillStyle='#F0A500';ctx.fill()
      ctx.strokeStyle='white';ctx.lineWidth=2;ctx.stroke()
      ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.lineWidth=1;ctx.setLineDash([3,3])
      ctx.beginPath();ctx.moveTo(x-14,y);ctx.lineTo(x+14,y);ctx.stroke()
      ctx.beginPath();ctx.moveTo(x,y-14);ctx.lineTo(x,y+14);ctx.stroke()
      ctx.setLineDash([])
    }
  },[ataques,posAtual])

  useEffect(()=>{draw()},[draw])

  function handleClick(e:React.MouseEvent<HTMLDivElement>){
    const area=areaRef.current; if(!area) return
    const r=area.getBoundingClientRect()
    const x=e.clientX-r.left,y=e.clientY-r.top
    onPos({x,y,px:Math.round(x/r.width*100),py:Math.round(y/r.height*100)})
  }

  return (
    <div ref={areaRef} onClick={handleClick} className="bg-[#c8a96e] relative min-h-[150px] cursor-crosshair select-none">
      <canvas ref={cvRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}

/* ── Zone Grid ─────────────────────────────────────────────────────── */
function ZoneGrid({ zonaSel, ataques, onSelect }: { zonaSel:Zona|null; ataques:Ataque[]; onSelect:(z:Zona)=>void }) {
  const counts = ataques.reduce<Record<string,number>>((acc,a)=>({...acc,[a.zona]:(acc[a.zona]||0)+1}),{})
  return (
    <div className="bg-[#c8a96e] p-1.5">
      <div className="grid grid-cols-3 gap-0.5">
        {ZONES.map(({code,abbr})=>{
          const cnt=counts[code]||0; const sel=zonaSel===code; const hit=cnt>0
          return (
            <button key={code} onClick={()=>onSelect(code)} className="rounded flex flex-col items-center justify-center min-h-[46px] border-[1.5px] transition-all py-1"
              style={{borderColor:sel?'#F0A500':'transparent',background:sel?'rgba(240,165,0,0.75)':hit?'rgba(22,163,74,0.55)':'rgba(255,255,255,0.22)'}}>
              <span className="text-[9px] text-white/90 font-semibold leading-none">{code}</span>
              <span className="text-[8px] text-white/70 leading-none mt-0.5">{abbr}</span>
              {cnt>0&&<span className="text-[13px] text-white font-medium leading-none mt-0.5">{cnt}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Registrar Tab ─────────────────────────────────────────────────── */
function RegistrarTab({ ataques, onRegister, onUndo }: {
  ataques: Ataque[]
  onRegister: (payload: { tipo: Tipo; qualidade: Qual; pos_x: number; pos_y: number; zona: Zona }) => Promise<void>
  onUndo: (id: string) => Promise<void>
}) {
  const [tipo, setTipo]   = useState<Tipo>('cabeca')
  const [qual, setQual]   = useState<Qual>('boa')
  const [pos, setPos]     = useState<{x:number;y:number;px:number;py:number}|null>(null)
  const [zona, setZona]   = useState<Zona|null>(null)
  const [busy, setBusy]   = useState(false)
  const canReg = pos!==null && zona!==null && !busy

  async function registrar(){
    if(pos===null || zona===null || busy) return
    setBusy(true)
    try {
      await onRegister({ tipo, qualidade: qual, pos_x: pos.px, pos_y: pos.py, zona })
      setPos(null); setZona(null)
    } finally {
      setBusy(false)
    }
  }

  async function desfazer(){
    if(ataques.length===0 || busy) return
    setBusy(true)
    try { await onUndo(ataques[0].id) } finally { setBusy(false) }
  }

  const togBase = 'flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border'
  const selTipo = (t:Tipo) => tipo===t?'bg-[#F0A500] text-white border-[#F0A500]':'bg-white/5 text-white/50 border-white/8 hover:border-white/20'
  const selQual = (q:Qual) => {
    const on:Record<Qual,string>={boa:'bg-green-600 text-white border-green-600',media:'bg-orange-500 text-white border-orange-500',ruim:'bg-red-600 text-white border-red-600'}
    return qual===q?on[q]:'bg-white/5 text-white/50 border-white/8 hover:border-white/20'
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-3 space-y-3">
      <div className="bg-[#0f1626] rounded-xl p-3 flex gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="flex-1">
          <p className="text-[10px] text-white/40 uppercase tracking-wide mb-1.5">Tipo</p>
          <div className="flex gap-1.5">{(['cabeca','shark'] as Tipo[]).map(t=><button key={t} onClick={()=>setTipo(t)} className={`${togBase} ${selTipo(t)}`}>{TIPO_LABEL[t]}</button>)}</div>
        </div>
        <div className="w-px bg-white/8" />
        <div className="flex-1">
          <p className="text-[10px] text-white/40 uppercase tracking-wide mb-1.5">Qualidade</p>
          <div className="flex gap-1.5">{(['boa','media','ruim'] as Qual[]).map(q=><button key={q} onClick={()=>setQual(q)} className={`${togBase} ${selQual(q)}`}>{QUAL_LABEL[q]}</button>)}</div>
        </div>
      </div>
      <div className="bg-[#0f1626] rounded-xl p-3 shadow-[0_4px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="grid grid-cols-2 gap-2 mb-2 text-[10px] text-white/40 text-center">
          <div><span className="bg-[#F0A500]/20 text-[#F0A500] px-2 py-0.5 rounded-full mr-1">1</span>Posição do atacante</div>
          <div><span className="bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full mr-1">2</span>Destino do ataque</div>
        </div>
        <div className="grid rounded-lg overflow-hidden border-2 border-[#a07840] bg-[#a07840]" style={{gridTemplateColumns:'1fr 3px 1fr'}}>
          <QuadraCanvas ataques={ataques} posAtual={pos} onPos={setPos} />
          <div className="bg-white/20" />
          <ZoneGrid zonaSel={zona} ataques={ataques} onSelect={setZona} />
        </div>
        <div className="flex gap-2 mt-2">
          {[
            {n:1,done:!!pos,active:!pos,text:pos?`Pos: ${pos.px}%, ${pos.py}%`:'Toque na quadra'},
            {n:2,done:!!zona,active:!!pos&&!zona,text:zona?`${zona} selecionada`:'Selecione o destino'},
          ].map(s=>(
            <div key={s.n} className={`flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] border transition-colors ${s.done?'border-green-500/50 bg-green-900/20 text-green-400':s.active?'border-[#F0A500]/50 bg-[#F0A500]/10 text-[#F0A500]':'border-white/8 bg-white/5 text-white/30'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-semibold text-white flex-shrink-0 ${s.done?'bg-green-500':s.active?'bg-[#F0A500]':'bg-white/15'}`}>{s.n}</span>
              {s.text}
            </div>
          ))}
        </div>
      </div>
      <button onClick={registrar} disabled={!canReg} className={`w-full bg-green-600 text-white font-medium py-3 rounded-xl text-sm transition-all ${canReg?'hover:bg-green-700 active:scale-95':'opacity-35 cursor-not-allowed'}`}>{busy?'Salvando…':'Registrar ataque'}</button>
      <button onClick={desfazer} disabled={ataques.length===0||busy} className="w-full bg-transparent border border-white/10 text-white/40 py-2.5 rounded-xl text-sm hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Desfazer último</button>
      {ataques.length>0&&(
        <div className="bg-[#0f1626] rounded-xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]">
          <p className="text-[10px] text-white/40 uppercase tracking-wide mb-2 font-medium">Histórico de ataques</p>
          <div className="divide-y divide-white/5">
            {ataques.map(a=>(
              <div key={a.id} className="flex items-center gap-2 py-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:QUAL_COLORS[a.qualidade]}} />
                <span className="text-[11px] text-white/70 flex-1">{TIPO_LABEL[a.tipo]} · {QUAL_LABEL[a.qualidade]}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded" style={{background:a.tipo==='cabeca'?'rgba(240,165,0,0.15)':'rgba(168,85,247,0.15)',color:a.tipo==='cabeca'?'#F0A500':'#c084fc'}}>{TIPO_LABEL[a.tipo]}</span>
                <span className="text-[10px] text-white/40">{a.zona}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Mapa Canvas ───────────────────────────────────────────────────── */
function MapaCanvas({ ataques }: { ataques: Ataque[] }) {
  const cvRef = useRef<HTMLCanvasElement>(null)
  useEffect(()=>{
    const cv=cvRef.current; if(!cv) return
    const ctx=cv.getContext('2d')!; const W=cv.width,H=cv.height
    const NET1=W*0.47,NET2=W*0.50,RW=W-NET2,colW=RW/3,rowH=H/3
    const counts=ataques.reduce<Record<string,number>>((a,x)=>({...a,[x.zona]:(a[x.zona]||0)+1}),{})
    const maxC=Math.max(1,...Object.values(counts))
    ctx.clearRect(0,0,W,H)
    ctx.fillStyle='#c8a96e'; ctx.fillRect(0,0,NET1,H); ctx.fillRect(NET2,0,RW,H)
    ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.fillRect(NET1,0,NET2-NET1,H)
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=0.5; ctx.setLineDash([4,3])
    for(let i=1;i<3;i++){ctx.beginPath();ctx.moveTo(0,rowH*i);ctx.lineTo(NET1,rowH*i);ctx.stroke()}
    ctx.setLineDash([])
    ctx.strokeStyle='rgba(255,255,255,0.35)'; ctx.lineWidth=0.5
    for(let r=1;r<3;r++){ctx.beginPath();ctx.moveTo(NET2,rowH*r);ctx.lineTo(W,rowH*r);ctx.stroke()}
    for(let c=1;c<3;c++){ctx.beginPath();ctx.moveTo(NET2+colW*c,0);ctx.lineTo(NET2+colW*c,H);ctx.stroke()}
    ;(['Z1','Z2','Z3','Z4','Z5','Z6','Z7','Z8','Z9'] as Zona[]).forEach(z=>{
      const col=ZONE_COL[z],row=ZONE_ROW[z],x=NET2+col*colW,y=row*rowH,cnt=counts[z]||0
      const op=cnt>0?0.15+(cnt/maxC)*0.65:0
      if(op>0){ctx.fillStyle=`rgba(240,165,0,${op})`;ctx.fillRect(x,y,colW,rowH)}
      const cx=x+colW/2
      ctx.font='bold 8px sans-serif';ctx.fillStyle='rgba(255,255,255,0.9)';ctx.textAlign='center';ctx.fillText(z,cx,y+11)
      ctx.font='7px sans-serif';ctx.fillStyle='rgba(255,255,255,0.7)';ctx.fillText(ZONE_ABBR[z],cx,y+20)
      if(cnt>0){ctx.font='bold 13px sans-serif';ctx.fillStyle='white';ctx.fillText(`${cnt}x`,cx,y+rowH/2+6)}
    })
    ctx.save();ctx.translate(9,H/2);ctx.rotate(-Math.PI/2);ctx.font='7px sans-serif';ctx.fillStyle='rgba(255,255,255,0.4)';ctx.textAlign='center';ctx.fillText('FUNDO',0,0);ctx.restore()
    ataques.forEach(a=>{
      const ox=(a.px/100)*NET1,oy=(a.py/100)*H,col=ZONE_COL[a.zona],row=ZONE_ROW[a.zona]
      const dx=NET2+col*colW+colW/2,dy=row*rowH+rowH/2,lc=TIPO_STROKE[a.tipo],dc=QUAL_COLORS[a.qualidade]
      const angle=Math.atan2(dy-oy,dx-ox)
      ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(dx,dy);ctx.strokeStyle=lc;ctx.lineWidth=1;ctx.globalAlpha=0.5;ctx.stroke();ctx.globalAlpha=1
      const hl=6
      ctx.beginPath();ctx.moveTo(dx,dy);ctx.lineTo(dx-hl*Math.cos(angle-Math.PI/6),dy-hl*Math.sin(angle-Math.PI/6));ctx.lineTo(dx-hl*Math.cos(angle+Math.PI/6),dy-hl*Math.sin(angle+Math.PI/6));ctx.closePath();ctx.fillStyle=lc;ctx.globalAlpha=0.65;ctx.fill();ctx.globalAlpha=1
      ctx.beginPath();ctx.arc(ox,oy,5,0,Math.PI*2);ctx.fillStyle=dc;ctx.fill();ctx.strokeStyle='rgba(255,255,255,0.8)';ctx.lineWidth=1.5;ctx.stroke()
      ctx.beginPath();ctx.arc(dx,dy,4,0,Math.PI*2);ctx.fillStyle=dc;ctx.fill();ctx.strokeStyle='rgba(255,255,255,0.6)';ctx.lineWidth=1;ctx.stroke()
    })
  },[ataques])
  return <canvas ref={cvRef} width={600} height={220} className="w-full rounded-lg border-2 border-[#a07840] block" />
}

/* ── Dashboard Tab ─────────────────────────────────────────────────── */
function computeStats(ataques: Ataque[]) {
  const total = ataques.length
  const qual = { boa:0, media:0, ruim:0 }
  const tipo = { cabeca:0, shark:0 }
  const prof = { frente:0, meio:0, fundo:0 }
  const zoneCounts: Record<string,number> = {}
  ataques.forEach(a=>{
    qual[a.qualidade]++; tipo[a.tipo]++
    const col = ZONE_COL[a.zona]
    if (col===0) prof.frente++; else if (col===1) prof.meio++; else prof.fundo++
    zoneCounts[a.zona] = (zoneCounts[a.zona]||0)+1
  })
  const zonas = (Object.keys(zoneCounts) as Zona[])
    .map(z=>({ z, n: ZONE_FULL[z], t: zoneCounts[z], pct: total ? +(zoneCounts[z]/total*100).toFixed(1) : 0 }))
    .sort((a,b)=> b.t - a.t)
    .map((z,i)=>({ ...z, pref: i===0 && z.t>0 }))
  return { total, qual, tipo, prof, zonas }
}

function DashboardTab({ ataques }: { ataques: Ataque[] }) {
  const stats = useMemo(()=>computeStats(ataques),[ataques])
  const total = stats.total
  const sc=[
    {l:'Total',v:total,c:'text-[#F0A500]'},
    {l:'Boas',v:stats.qual.boa,c:'text-green-400'},
    {l:'Médias',v:stats.qual.media,c:'text-orange-400'},
    {l:'Ruins',v:stats.qual.ruim,c:'text-red-400'},
    {l:'Cabeça',v:stats.tipo.cabeca,c:'text-cyan-400'},
    {l:'Shark',v:stats.tipo.shark,c:'text-purple-400'},
  ]
  const BarRow=({label,value,color}:{label:string;value:number;color:string})=>{
    const pct = total ? Math.round(value/total*100) : 0
    return(<div className="flex items-center gap-2 mb-2"><span className="text-[11px] text-white/60 w-20 flex-shrink-0">{label}</span><div className="flex-1 bg-white/8 rounded-full h-1.5 overflow-hidden"><div className="h-full rounded-full" style={{width:`${pct}%`,background:color}}/></div><span className="text-[10px] text-white/30 w-8 text-right">{pct}%</span></div>)
  }
  const card='bg-[#0f1626] rounded-xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]'
  const sec='text-[10px] text-white/40 uppercase tracking-wide mb-3'

  if (total===0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className={`${card} flex flex-col items-center justify-center py-16 text-center`}>
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 9l-5 5-3-3-4 4"/></svg>
          </div>
          <p className="text-white/60 text-sm font-medium mb-1">Sem dados ainda</p>
          <p className="text-white/30 text-xs">Registre ataques na aba ao lado para ver as estatísticas.</p>
        </div>
      </div>
    )
  }

  return(
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
      <div className="grid grid-cols-3 gap-2">{sc.map(s=><div key={s.l} className="bg-[#0f1626] rounded-xl p-3 text-center shadow-[0_4px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]"><p className={`text-xl font-medium ${s.c}`}>{s.v}</p><p className="text-[10px] text-white/30 mt-0.5">{s.l}</p></div>)}</div>
      <div className={card}><p className={sec}>Mapa de ataques</p><div className="flex flex-wrap gap-3 mb-3 text-[10px] text-white/50 items-center"><div className="flex items-center gap-1.5"><svg width="20" height="6"><line x1="0" y1="3" x2="16" y2="3" stroke="#F0A500" strokeWidth="1.5"/><circle cx="18" cy="3" r="2" fill="#F0A500"/></svg>Cabeça</div><div className="flex items-center gap-1.5"><svg width="20" height="6"><line x1="0" y1="3" x2="16" y2="3" stroke="#a855f7" strokeWidth="1.5"/><circle cx="18" cy="3" r="2" fill="#a855f7"/></svg>Shark</div><span className="text-white/20">·</span>{([['#22c55e','Boa'],['#f97316','Média'],['#ef4444','Ruim']] as [string,string][]).map(([c,l])=><div key={l} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{background:c}}/>{l}</div>)}</div><MapaCanvas ataques={ataques}/></div>
      <div className={card}><p className={sec}>Profundidade</p><BarRow label="Frente (1-3)" value={stats.prof.frente} color="#ef4444"/><BarRow label="Meio (4-6)" value={stats.prof.meio} color="#f97316"/><BarRow label="Fundo (7-9)" value={stats.prof.fundo} color="#22c55e"/></div>
      <div className={card}><p className={sec}>Qualidade</p><BarRow label="Boa" value={stats.qual.boa} color="#16a34a"/><BarRow label="Média" value={stats.qual.media} color="#ea580c"/><BarRow label="Ruim" value={stats.qual.ruim} color="#dc2626"/></div>
      <div className={card}><p className={sec}>Tipo</p><BarRow label="Cabeça" value={stats.tipo.cabeca} color="#F0A500"/><BarRow label="Shark" value={stats.tipo.shark} color="#a855f7"/></div>
      <div className={card}><p className={sec}>Por zona</p><table className="w-full border-collapse"><thead><tr><th className="text-left text-[10px] text-white/30 pb-2 font-medium">Zona</th><th className="text-right text-[10px] text-white/30 pb-2 font-medium">Ataques</th><th className="text-right text-[10px] text-white/30 pb-2 font-medium">%</th></tr></thead><tbody className="divide-y divide-white/5">{stats.zonas.map(z=><tr key={z.z}><td className="py-2 text-[11px] text-white/70">{z.z} — {z.n}{z.pref&&<span className="ml-1.5 text-[9px] bg-[#F0A500]/15 text-[#F0A500] px-1.5 py-0.5 rounded-full">preferida</span>}</td><td className="py-2 text-right text-[11px] font-medium text-white/70">{z.t}</td><td className="py-2 text-right text-[10px] text-white/30">{z.pct}%</td></tr>)}</tbody></table></div>
    </div>
  )
}

/* ── Match Screen ──────────────────────────────────────────────────── */
function MatchScreen({ partida, onBack }: { partida: PartidaDTO; onBack: () => void }) {
  const [tab, setTab]           = useState<'reg'|'dash'>('reg')
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string|null>(null)
  const [status, setStatus]     = useState<Status>(partida.status)
  const [tempo, setTempo]       = useState(partida.tempo)
  const [liveSecs, setLiveSecs] = useState(partida.tempo)
  const [sets, setSets]         = useState<SetDTO[]>([])
  const [lancamentos, setLancamentos] = useState<LancamentoDTO[]>([])
  const liveSecsRef = useRef(partida.tempo)

  const handleTick = useCallback((s: number) => { liveSecsRef.current = s; setLiveSecs(s) }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const detail = await partidasService.get(partida.id)
        if (!alive) return
        setStatus(detail.status); setTempo(detail.tempo)
        liveSecsRef.current = detail.tempo; setLiveSecs(detail.tempo)
        setSets(detail.sets)
        setLancamentos(detail.lancamentos.slice().reverse()) // mais recentes primeiro
      } catch (e) {
        if (alive) setError(apiErrorMessage(e))
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [partida.id])

  const ataques = useMemo(()=>lancamentos.map(toAtaque),[lancamentos])

  async function patchPartida(payload: Parameters<typeof partidasService.update>[1]) {
    try {
      const updated = await partidasService.update(partida.id, payload)
      setStatus(updated.status); setTempo(updated.tempo)
    } catch (e) {
      setError(apiErrorMessage(e))
    }
  }

  async function handleFinalizeSet(nos: number, them: number) {
    const decorrido = sets.reduce((acc, s) => acc + s.tempo, 0)
    const tempoSet = Math.max(0, liveSecsRef.current - decorrido)
    try {
      const s = await partidaSetsService.add(partida.id, { pontos_jogador: nos, pontos_adversario: them, tempo: tempoSet })
      setSets(prev => [...prev, s])
    } catch (e) {
      setError(apiErrorMessage(e)); throw e
    }
  }

  async function handleRegister(payload: { tipo: Tipo; qualidade: Qual; pos_x: number; pos_y: number; zona: Zona }) {
    try {
      const l = await partidaLancamentosService.add(partida.id, payload)
      setLancamentos(prev => [l, ...prev])
    } catch (e) {
      setError(apiErrorMessage(e)); throw e
    }
  }

  async function handleUndo(id: string) {
    try {
      await partidaLancamentosService.remove(partida.id, id)
      setLancamentos(prev => prev.filter(l => l.id !== id))
    } catch (e) {
      setError(apiErrorMessage(e)); throw e
    }
  }

  async function handleReopen() {
    setTab('reg')
    await patchPartida({ status: 'prog' })
  }

  const isFinished = status === 'done'
  const tabCls = (active: boolean) =>
    `flex-1 py-3 text-center text-xs font-medium border-b-2 transition-colors ${active?'border-[#F0A500] text-[#F0A500]':'border-transparent text-white/40 hover:text-white/60'}`

  return (
    <div className="min-h-screen bg-[#080c14]">
      <ErrorToast message={error} onDone={()=>setError(null)} />
      <Navbar onBack={onBack} title={partida.jogador} sub={`vs ${partida.adversario||'—'} · ${partida.lado}`} />
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-[#F0A500] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <TimerStrip
            initialSecs={tempo}
            initialFinished={isFinished}
            onStart={()=>patchPartida({ status:'prog' })}
            onPersist={(secs)=>patchPartida({ tempo: secs })}
            onFinish={(secs)=>patchPartida({ status:'done', tempo: secs })}
            onTick={handleTick}
          />
          <PlacarSection jogador={partida.jogador} adversario={partida.adversario} sets={sets} tempoTotal={liveSecs} readOnly={isFinished} onFinalizeSet={handleFinalizeSet} />
          {isFinished ? (
            <>
              <div className="bg-[#0f1626] px-4 py-3 flex items-center justify-between gap-3 shadow-[0_1px_0_rgba(255,255,255,0.04),0_4px_12px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-2 text-[11px] text-yellow-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  Partida finalizada — somente leitura
                </div>
                <button onClick={handleReopen} className="bg-green-600 text-white text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 hover:bg-green-700 active:scale-95 transition-all">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>
                  Iniciar novamente
                </button>
              </div>
              <DashboardTab ataques={ataques} />
            </>
          ) : (
            <>
              <div className="flex bg-[#0f1626] shadow-[0_1px_0_rgba(255,255,255,0.04),0_4px_12px_rgba(0,0,0,0.4)]">
                <button onClick={()=>setTab('reg')} className={tabCls(tab==='reg')}>Registrar ataques</button>
                <button onClick={()=>setTab('dash')} className={tabCls(tab==='dash')}>Dashboard</button>
              </div>
              {tab==='reg'
                ? <RegistrarTab ataques={ataques} onRegister={handleRegister} onUndo={handleUndo} />
                : <DashboardTab ataques={ataques} />}
            </>
          )}
        </>
      )}
    </div>
  )
}

/* ── Home Screen ───────────────────────────────────────────────────── */
function HomeScreen({ onOpen }: { onOpen: (p: PartidaDTO) => void }) {
  const me = useAuthStore((s) => s.user)
  const isAdmin = me?.role === 'admin'
  const [partidas, setPartidas]   = useState<PartidaDTO[]>([])
  const [filtro, setFiltro]       = useState<'all'|Status>('all')
  const [userFiltro, setUserFiltro] = useState<string>('all')   // 'all' ou user_id (admin)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string|null>(null)
  const [menuOpen, setMenuOpen]   = useState(false)
  const novaPartidaPendente = useUIStore((s) => s.novaPartidaPendente)
  const limparNovaPartida   = useUIStore((s) => s.limparNovaPartida)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await partidasService.list()
        if (alive) setPartidas(res.data)
      } catch (e) {
        if (alive) setError(apiErrorMessage(e))
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  // abre o modal "Nova partida" quando solicitado pelo menu lateral (funciona já estando em /partidas)
  useEffect(() => {
    if (novaPartidaPendente) { setModalOpen(true); limparNovaPartida() }
  }, [novaPartidaPendente, limparNovaPartida])

  async function handleCreate(payload: { jogador: string; adversario: string; fase: string; lado: Lado; data: string }) {
    try {
      const nova = await partidasService.create({
        jogador: payload.jogador, fase: payload.fase, lado: payload.lado,
        adversario: payload.adversario || null, data: payload.data || null,
      })
      setPartidas(prev => [nova, ...prev])
    } catch (e) {
      setError(apiErrorMessage(e)); throw e
    }
  }

  async function handleDelete(id: string) {
    const snapshot = partidas
    setPartidas(p => p.filter(x => x.id !== id)) // otimista
    try {
      await partidasService.remove(id)
    } catch (e) {
      setPartidas(snapshot); setError(apiErrorMessage(e))
    }
  }

  // Admin: lista de usuários disponíveis (derivada das partidas; próprio admin primeiro)
  const usuarios: { id: string; nome: string }[] = []
  if (isAdmin) {
    const seen = new Set<string>()
    for (const p of partidas) {
      if (!seen.has(p.user_id)) { seen.add(p.user_id); usuarios.push({ id: p.user_id, nome: p.user_name || 'Usuário' }) }
    }
    const i = usuarios.findIndex(u => u.id === me?.id)
    if (i > 0) usuarios.unshift(usuarios.splice(i, 1)[0])
  }

  // escopo = partidas do usuário selecionado (admin) ou todas
  const escopo = (isAdmin && userFiltro !== 'all') ? partidas.filter(p => p.user_id === userFiltro) : partidas
  const counts = { all:escopo.length, wait:escopo.filter(p=>p.status==='wait').length, prog:escopo.filter(p=>p.status==='prog').length, done:escopo.filter(p=>p.status==='done').length }
  const filtered = filtro==='all'?escopo:escopo.filter(p=>p.status===filtro)
  const tabs: {key:'all'|Status;label:string}[] = [{key:'all',label:'Tudo'},{key:'wait',label:'Aguardando'},{key:'prog',label:'Em progresso'},{key:'done',label:'Finalizada'}]
  const badgeActive: Record<string,string> = {all:'bg-white/20 text-white',wait:'bg-amber-900/60 text-amber-300',prog:'bg-green-900/60 text-green-300',done:'bg-yellow-900/60 text-yellow-300'}

  // Admin: agrupa as partidas por usuário (preservando a ordem de chegada)
  const grupos: { id: string; nome: string; partidas: PartidaDTO[] }[] = []
  if (isAdmin) {
    const idx = new Map<string, number>()
    for (const p of filtered) {
      if (!idx.has(p.user_id)) { idx.set(p.user_id, grupos.length); grupos.push({ id: p.user_id, nome: p.user_name || 'Usuário', partidas: [] }) }
      grupos[idx.get(p.user_id)!].partidas.push(p)
    }
    // mantém as partidas do próprio admin como o primeiro grupo
    const meuIdx = grupos.findIndex(g => g.id === me?.id)
    if (meuIdx > 0) grupos.unshift(grupos.splice(meuIdx, 1)[0])
  }

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 2v4M16 2v4"/>
        </svg>
      </div>
      <p className="text-white/60 text-sm font-medium mb-1">
        {filtro==='all' ? 'Nenhuma partida ainda' : 'Nenhuma partida encontrada'}
      </p>
      <p className="text-white/30 text-xs">
        {filtro==='all'
          ? 'Crie sua primeira partida para começar a registrar ataques.'
          : 'Nenhuma partida com esse status no momento.'}
      </p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#080c14]">
      <ErrorToast message={error} onDone={()=>setError(null)} />
      <Sidebar open={menuOpen} onClose={()=>setMenuOpen(false)} />
      <Navbar onMenu={()=>setMenuOpen(true)} />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-white">Partidas</h1>
          <button onClick={()=>setModalOpen(true)} className="bg-[#F0A500] text-white text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 hover:bg-[#D4920A] transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M6 1v10M1 6h10"/></svg>
            Nova partida
          </button>
        </div>
        <div className="flex gap-2 flex-wrap items-center mb-5">
          {tabs.map(t=>(
            <button key={t.key} onClick={()=>setFiltro(t.key)} className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${filtro===t.key?'bg-[#F0A500] text-white':'bg-white/5 border border-white/10 text-white/50 hover:border-white/20'}`}>
              {t.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filtro===t.key?'bg-white/20 text-white':(badgeActive[t.key]||'bg-white/8 text-white/40')}`}>
                {counts[t.key as keyof typeof counts]}
              </span>
            </button>
          ))}
          {isAdmin && (
            <div className="flex items-center gap-1.5 ml-auto">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <select value={userFiltro} onChange={e=>setUserFiltro(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80 outline-none focus:border-[#F0A500]/60 transition-colors cursor-pointer">
                <option value="all" className="bg-[#0f1626]">Todos os usuários</option>
                {usuarios.map(u=>(
                  <option key={u.id} value={u.id} className="bg-[#0f1626]">{u.nome}{u.id===me?.id?' (você)':''}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#F0A500] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isAdmin ? (
          grupos.length===0 ? emptyState : (
            <div className="space-y-6">
              {grupos.map(g=>(
                <div key={g.id}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#F0A500]/15 flex items-center justify-center text-[#F0A500] text-[10px] font-medium">
                      {g.nome.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
                    </div>
                    <p className="text-sm text-white/75 font-medium">{g.nome}</p>
                    {g.id===me?.id && <span className="text-[9px] bg-[#F0A500]/15 text-[#F0A500] px-1.5 py-0.5 rounded-full">você</span>}
                    <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{g.partidas.length} partida(s)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {g.partidas.map(p=><PartidaCard key={p.id} p={p} onOpen={onOpen} onDelete={handleDelete} />)}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map(p=><PartidaCard key={p.id} p={p} onOpen={onOpen} onDelete={handleDelete} />)}
            </div>
            {filtered.length===0 && emptyState}
          </>
        )}
      </div>
      {modalOpen&&<ModalNovaPartida onClose={()=>setModalOpen(false)} onCreate={handleCreate} />}
    </div>
  )
}

/* ── Auth Guard + Page Root ────────────────────────────────────────── */
export default function PartidasPage() {
  const router = useRouter()
  const user   = useAuthStore((s) => s.user)
  const [ready, setReady] = useState(false)
  const [screen, setScreen]           = useState<'home'|'match'>('home')
  const [activePartida, setActivePartida] = useState<PartidaDTO|null>(null)

  useEffect(() => { setReady(true) }, [])
  useEffect(() => {
    if (ready && !user) router.replace('/auth/login')
  }, [ready, user, router])

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#F0A500] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (screen==='match' && activePartida) {
    return <MatchScreen partida={activePartida} onBack={()=>setScreen('home')} />
  }
  return <HomeScreen onOpen={p=>{setActivePartida(p);setScreen('match')}} />
}
