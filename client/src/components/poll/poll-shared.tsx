import type { Clock3 } from 'lucide-react'

export type VoteMap = Record<string, string>
export type LiveVotesMap = Record<string, Record<string, number>>

export function formatTimeLeft(timeLeftMs: number) {
  if (timeLeftMs <= 0) {
    return 'Expired'
  }

  const totalSeconds = Math.floor(timeLeftMs / 1000)
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3_600)
  const minutes = Math.floor((totalSeconds % 3_600) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  }

  return `${minutes}m ${seconds}s`
}

export function MetaTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3
  label: string
  value: string
}) {
  return (
    <div className="border border-white/10 bg-zinc-950/55 p-4">
      <div className="mb-3 inline-flex size-10 items-center justify-center border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
        <Icon className="size-5" />
      </div>
      <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  )
}

export function SideInfo({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="border border-white/10 bg-zinc-950/55 p-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </p>
      <p
        className={`mt-2 text-sm leading-6 text-zinc-200 ${mono ? 'break-all font-mono' : ''}`}
      >
        {value}
      </p>
    </div>
  )
}

export function PollShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark min-h-screen overflow-hidden bg-zinc-950 px-4 py-10 text-zinc-50 sm:px-6 lg:px-10">
      <div className="relative mx-auto max-w-7xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.12),transparent_30%),linear-gradient(160deg,#09090b_0%,#111827_45%,#0f172a_100%)]" />
        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[32px_32px]" />
        <div className="relative">{children}</div>
      </div>
    </div>
  )
}
