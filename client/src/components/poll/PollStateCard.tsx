import { Link } from '@tanstack/react-router'
import { LogIn, LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface PollStateCardProps {
  title: string
  description: string
  actions?: Array<{
    label: string
    to?: '/login' | '/signup'
    onClick?: () => void
    disabled?: boolean
    variant?: 'default' | 'outline'
  }>
}

export function PollStateCard({
  title,
  description,
  actions,
}: PollStateCardProps) {
  return (
    <Card className="border border-white/10 bg-zinc-900/85 shadow-xl shadow-cyan-950/20 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        <CardDescription className="text-zinc-400">
          {description}
        </CardDescription>
      </CardHeader>
      {actions?.length ? (
        <CardContent className="flex flex-wrap gap-3">
          {actions.map((action) =>
            action.to ? (
              <Button
                key={action.label}
                asChild
                variant={action.variant || 'default'}
                className={
                  action.variant === 'outline'
                    ? 'border-cyan-400/25 bg-cyan-400/5 text-cyan-200 hover:bg-cyan-400/10'
                    : 'pixel-hover-button border border-cyan-300 bg-cyan-400 text-zinc-950 hover:bg-cyan-300'
                }
              >
                <Link to={action.to}>
                  {action.to === '/login' ? <LogIn className="size-4" /> : null}
                  {action.label}
                </Link>
              </Button>
            ) : (
              <Button
                key={action.label}
                disabled={action.disabled}
                variant={action.variant || 'default'}
                className={
                  action.variant === 'outline'
                    ? 'border-cyan-400/25 bg-cyan-400/5 text-cyan-200 hover:bg-cyan-400/10'
                    : 'pixel-hover-button border border-cyan-300 bg-cyan-400 text-zinc-950 hover:bg-cyan-300'
                }
                onClick={action.onClick}
              >
                {action.label.includes('Logout') ? (
                  <LogOut className="size-4" />
                ) : null}
                {action.label}
              </Button>
            ),
          )}
        </CardContent>
      ) : null}
    </Card>
  )
}
