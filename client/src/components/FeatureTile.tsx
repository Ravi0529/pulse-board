import type { ComponentType } from 'react'

interface FeatureTileProps {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}
export function FeatureTile({
  icon: Icon,
  title,
  description,
}: FeatureTileProps) {
  return (
    <div className="pixel-hover-tile group relative overflow-hidden border border-white/8 bg-white/5 p-4 backdrop-blur-sm hover:border-cyan-400/30 hover:bg-white/7">
      <div className="pixel-hover-scan pointer-events-none absolute inset-x-0 top-0 h-px bg-cyan-300/80" />
      <div className="pixel-hover-icon inline-flex size-10 items-center justify-center border border-cyan-400/10 bg-cyan-400/10 text-cyan-300 group-hover:bg-cyan-400/18 group-hover:text-cyan-200">
        <Icon className="size-5" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-white transition-colors duration-300 group-hover:text-cyan-100">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400 transition-colors duration-300 group-hover:text-zinc-300">
        {description}
      </p>
    </div>
  )
}
