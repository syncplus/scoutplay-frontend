export function RoleBadge({ role }: { role?: string | null }) {
  if (!role) return null
  const cls = role === 'admin'
    ? 'bg-purple-900/50 text-purple-300'
    : 'bg-indigo-900/50 text-indigo-300'
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium capitalize ${cls}`}>{role}</span>
  )
}
