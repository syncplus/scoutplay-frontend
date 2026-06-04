'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { apiErrorMessage, mediaUrl } from '@/lib/api'
import { authService } from '@/services/auth'
import { usersService } from '@/services/users'
import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { Toast } from '@/components/Toast'

export default function PerfilPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)

  const [ready, setReady]       = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string|null>(null)
  const [notice, setNotice]     = useState<string|null>(null)

  const [name, setName]         = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [photo, setPhoto]       = useState<string|null>(null)   // url salva
  const [avatarData, setAvatarData] = useState<string|null>(null) // dataURL nova (preview/upload)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setReady(true) }, [])
  useEffect(() => { if (ready && !user) router.replace('/auth/login') }, [ready, user, router])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const me = await authService.me()
        if (!alive) return
        setName(me.name); setUsername(me.username); setEmail(me.email); setPhoto(me.photo ?? null)
        updateUser({ name: me.name, username: me.username, email: me.email, photo: me.photo ?? null })
      } catch (e) {
        if (alive) setError(apiErrorMessage(e))
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) { setError('Imagem muito grande (máx. 3 MB).'); return }
    const reader = new FileReader()
    reader.onload = () => setAvatarData(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    if (saving || !name.trim() || !username.trim() || !email.trim()) return
    setSaving(true)
    try {
      let finalPhoto = photo
      if (avatarData) {
        const u = await usersService.uploadAvatar(avatarData)
        // cache-bust: o arquivo costuma manter o mesmo nome
        finalPhoto = u.photo ? `${u.photo}?t=${Date.now()}` : u.photo
        setPhoto(finalPhoto); setAvatarData(null)
      }
      const updated = await usersService.updateMe({
        name: name.trim(), username: username.trim(), email: email.trim(),
        password: password ? password : undefined,
      })
      updateUser({ name: updated.name, username: updated.username, email: updated.email, photo: finalPhoto })
      setPassword('')
      setNotice('Perfil atualizado com sucesso')
    } catch (e) {
      setError(apiErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  if (!ready || !user) {
    return <div className="min-h-screen bg-[#080c14] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#F0A500] border-t-transparent rounded-full animate-spin" /></div>
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-[#F0A500]/60 transition-colors"
  const preview = avatarData || mediaUrl(photo)
  const initials = (name || 'U').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()

  return (
    <div className="min-h-screen bg-[#080c14]">
      <Toast message={error} onDone={()=>setError(null)} />
      <Toast message={notice} onDone={()=>setNotice(null)} variant="success" />
      <Sidebar open={menuOpen} onClose={()=>setMenuOpen(false)} />
      <Navbar onMenu={()=>setMenuOpen(true)} />

      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold text-white mb-5">Meu perfil</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-[#F0A500] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="bg-[#0f1626] rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="flex flex-col items-center mb-6">
              <button onClick={()=>fileRef.current?.click()} className="relative group" title="Trocar foto">
                {preview
                  ? <img src={preview} alt="" className="w-24 h-24 rounded-full object-cover border border-white/10" />
                  : <div className="w-24 h-24 rounded-full bg-[#F0A500]/20 flex items-center justify-center text-[#F0A500] text-2xl font-medium">{initials}</div>}
                <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#F0A500] flex items-center justify-center border-2 border-[#0f1626]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </span>
              </button>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={onPickFile} />
              <p className="text-[11px] text-white/35 mt-2">Clique para alterar a foto (máx. 3 MB)</p>
            </div>

            <div className="space-y-4">
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
                <label className="text-[11px] text-white/40 uppercase tracking-wide block mb-1.5">Nova senha</label>
                <input type="password" className={inputCls} placeholder="deixe em branco para manter" value={password} onChange={e=>setPassword(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button onClick={handleSave} disabled={saving||!name.trim()||!username.trim()||!email.trim()}
                className="bg-[#F0A500] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#D4920A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                {saving?'Salvando…':'Salvar alterações'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
