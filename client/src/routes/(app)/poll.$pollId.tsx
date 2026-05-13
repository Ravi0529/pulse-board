import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { pollService } from '@/services/pollServices'
import type { Poll } from '@/services/pollServices'

export const Route = createFileRoute('/poll/$pollId')({
  component: PublicPollPlaceholderPage,
})

function PublicPollPlaceholderPage() {
  const { pollId } = Route.useParams()
  const [poll, setPoll] = useState<Poll | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadPoll = async () => {
      try {
        const data = await pollService.getPollById(pollId)
        if (isMounted) {
          setPoll(data)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Could not load this poll link.',
          )
        }
      }
    }

    void loadPoll()

    return () => {
      isMounted = false
    }
  }, [pollId])

  return (
    <div className="dark min-h-screen bg-zinc-950 px-4 py-10 text-zinc-50 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <Card className="border border-white/10 bg-zinc-900/85">
          <CardHeader>
            <CardTitle>
              {poll
                ? `Hello from the ${poll.creator?.username || 'creator'}`
                : 'Loading poll link...'}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {error || 'This is the generated poll link placeholder for now.'}
            </CardDescription>
          </CardHeader>
          {poll ? (
            <CardContent className="text-sm text-zinc-300">
              {poll.title}
            </CardContent>
          ) : null}
        </Card>
      </div>
    </div>
  )
}
