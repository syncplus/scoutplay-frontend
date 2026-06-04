'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { apiErrorMessage } from '@/lib/api'
import { usersService, type UserOut } from '@/services/users'
import type { UserRole } from '@/types/auth'
import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { Avatar } from '@/components/Avatar'
import { Toast } from '@/components/Toast'

/* ── Modal criar/editar usuário ─────────────────────────────────────── */
function UserModal({ alvo, onClose, onSaved, onError }: {
  alvo: UserOut | null   // null = criar
  onClose: () => void
  onSaved: (u: UserOut, criado: boolean) => void
  onError: (msg: string) => void
}) {
  const editando = !!alvo
  const [name, setName]         = useState(alvo?.name ?? '')
  const [username, setUsername] = useState(alvo?.username ?? '')
  const [email, setEmail]       = useState(alvo?.email ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole]         = useState<UserRole>(alvo?.role ?? 'treinador')
  const [active, setActive]     = useState<boolean>(alvo?.active ?? true)
  const [saving, setSaving]     = useState(false)

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-[#F0A500]/60 transition-colors"
  const valido = !!name.trim() && !!username.trim() && !!email.trim() && (editando || password.length >= 6)

  async function handleSave() {
    if (!valido || saving) return
    setSaving(true)
    try {
      if (editando) {
        const u = await usersService.update(alvo!.id, {
          name: name.trim(), username: username.trim(), email: email.trim(),
          role, active, password: password ? password : undefined,
        })
        onSaved(u, false)
      } else {
        const u = await usersService.create({ name: name.trim(), username: username.trim(), email: email.trim(), password, role })
        onSaved(u, true)
      }
      onClose()
    } catch (e) {
      onError(apiErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#0f1626] rounded-2xl w-full max-w-md shadow-[0_8px_48px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.07)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h2 className="text-base font-semibold text-white">{editando ? 'Editar usuário' : 'Novo usuário'}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/8 text-white/50 hover:bg-white/15 transition-colors text-lg leading-none">×</button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="text-[11px] text-white/40 uppercase tracking-wide block mb-1.5">Nome</label>
            <input className={inputCls} value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-white/40 uppercase tracking-wide block mb-1.5">Username</label>
              <input className={inputCls} value={username} onChange={e=>setUsername(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] text-white/40 uppercase tracking-wide block mb-1.5">E-mail</label>
              <input type="email" className={inputCls} value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-white/40 uppercase tracking-wide block mb-1.5">{editando ? 'Nova senha' : 'Senha'}</label>
            <input type="password" className={inputCls} placeholder={editando ? 'deixe em branco para manter' : 'mínimo 6 caracteres'} value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-white/40 uppercase tracking-wide block mb-1.5">Permissão</label>
              <div className="flex border border-white/10 rounded-lg overflow-hidden">
                {(['treinador','admin'] as UserRole[]).map(r => (
                  <button key={r} onClick={()=>setRole(r)} className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${role===r?'bg-[#F0A500] text-white':'bg-white/5 text-white/40 hover:bg-white/10'}`}>{r}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] text-white/40 uppercase tracking-wide block mb-1.5">Status</label>
              <div className="flex border border-white/10 rounded-lg overflow-hidden">
                <button onClick={()=>setActive(true)} className={`flex-1 py-2 text-xs font-medium transition-colors ${active?'bg-green-600 text-white':'bg-white/5 text-white/40 hover:bg-white/10'}`}>Ativo</button>
                <button onClick={()=>setActive(false)} className={`flex-1 py-2 text-xs font-medium transition-colors ${!active?'bg-red-600 text-white':'bg-white/5 text-white/40 hover:bg-white/10'}`}>Inativo</button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end px-5 pb-5">
          <button onClick={onClose} className="bg-transparent border border-white/15 text-white/60 px-5 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={!valido||saving} className="bg-[#F0A500] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#D4920A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{saving?'Salvando…':(editando?'Salvar':'Criar usuário')}</button>
        </div>
      </div>
    </div>
  )
}

/* ── Página ─────────────────────────────────────────────────────────── */
export default function UsuariosPage() {
  const router = useRouter()
  const me = useAuthStore((s) => s.user)

  const [ready, setReady]       = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading]   = useState(true)
  const [users, setUsers]       = useState<UserOut[]>([])
  const [editAlvo, setEditAlvo] = useState<UserOut | null>(null)
  const [modalAberto, setModalAberto] = useState<false | 'novo' | 'editar'>(false)
  const [error, setError]       = useState<string|null>(null)
  const [notice, setNotice]     = useState<string|null>(null)

  useEffect(() => { setReady(true) }, [])
  useEffect(() => {
    if (!ready) return
    if (!me) { router.replace('/auth/login'); return }
    if (me.role !== 'admin') { router.replace('/partidas') }
  }, [ready, me, router])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await usersService.list()
        if (alive) setUsers(res.data)
      } catch (e) {
        if (alive) setError(apiErrorMessage(e))
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  function handleSaved(u: UserOut, criado: boolean) {
    setUsers(prev => criado ? [u, ...prev] : prev.map(x => x.id === u.id ? u : x))
    setNotice(criado ? `Usuário "${u.name}" criado` : `Usuário "${u.name}" atualizado`)
  }

  if (!ready || !me || me.role !== 'admin') {
    return <div className="min-h-screen bg-[#080c14] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#F0A500] border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="min-h-screen bg-[#080c14]">
      <Toast message={error} onDone={()=>setError(null)} />
      <Toast message={notice} onDone={()=>setNotice(null)} variant="success" />
      <Sidebar open={menuOpen} onClose={()=>setMenuOpen(false)} />
      <Navbar onMenu={()=>setMenuOpen(true)} />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-white">Usuários</h1>
          <button onClick={()=>{ setEditAlvo(null); setModalAberto('novo') }} className="bg-[#F0A500] text-white text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 hover:bg-[#D4920A] transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M6 1v10M1 6h10"/></svg>
            Novo usuário
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-[#F0A500] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="bg-[#0f1626] rounded-xl px-4 py-3 flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]">
                <Avatar name={u.name} photo={u.photo} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white font-medium truncate">{u.name}</p>
                    {u.id===me.id && <span className="text-[9px] bg-[#F0A500]/15 text-[#F0A500] px-1.5 py-0.5 rounded-full">você</span>}
                  </div>
                  <p className="text-[11px] text-white/40 truncate">@{u.username} · {u.email}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${u.role==='admin'?'bg-purple-900/50 text-purple-300':'bg-indigo-900/50 text-indigo-300'}`}>{u.role}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${u.active?'bg-green-900/40 text-green-400':'bg-red-900/40 text-red-400'}`}>{u.active?'Ativo':'Inativo'}</span>
                <button onClick={()=>{ setEditAlvo(u); setModalAberto('editar') }} className="ml-1 bg-white/8 text-white/70 text-xs px-3 py-1.5 rounded-lg hover:bg-white/15 transition-colors flex items-center gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
                  Editar
                </button>
              </div>
            ))}
            {users.length===0 && <p className="text-white/40 text-sm text-center py-16">Nenhum usuário cadastrado.</p>}
          </div>
        )}
      </div>

      {modalAberto && (
        <UserModal
          alvo={modalAberto==='editar' ? editAlvo : null}
          onClose={()=>setModalAberto(false)}
          onSaved={handleSaved}
          onError={setError}
        />
      )}
    </div>
  )
}
