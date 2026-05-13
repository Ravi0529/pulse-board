import { useEffect, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ArrowRight,
  ChartColumnBig,
  Clock3,
  FilePlus2,
  Layers3,
  MessageSquareQuote,
  ShieldAlert,
  UserRound,
} from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getStoredUser } from '@/services/authSession'
import { pollService } from '@/services/pollServices'
import type { Poll } from '@/services/pollServices'

export const Route = createFileRoute('/(app)/workspace/')({
  component: WorkspacePage,
})

function WorkspacePage() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadPolls = async () => {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        const myPolls = await pollService.getMyPolls()

        if (isMounted) {
          setPolls(myPolls)
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Something went wrong while fetching your polls.'

        if (isMounted) {
          setErrorMessage(message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadPolls()

    return () => {
      isMounted = false
    }
  }, [])

  const totalQuestions = polls.reduce(
    (count, poll) => count + poll.questions.length,
    0,
  )

  const livePolls = polls.filter((poll) => !poll.isPublished).length

  return (
    <div className="dark min-h-screen overflow-hidden bg-zinc-950 text-zinc-50">
      <div className="relative isolate min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.14),transparent_30%),linear-gradient(160deg,#09090b_0%,#111827_45%,#0f172a_100%)]" />
        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[32px_32px]" />
        <div className="absolute inset-0 opacity-12 bg-[linear-gradient(45deg,rgba(34,211,238,0.18)_25%,transparent_25%,transparent_50%,rgba(34,211,238,0.18)_50%,rgba(34,211,238,0.18)_75%,transparent_75%,transparent)] bg-size-[18px_18px]" />
        <div className="absolute left-1/2 top-16 h-40 w-40 -translate-x-1/2 bg-cyan-400/20 blur-3xl animate-pulse sm:top-24 sm:h-56 sm:w-56" />

        <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-10 lg:px-10">
          <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="border border-white/10 bg-zinc-900/85 shadow-xl shadow-cyan-950/25 backdrop-blur-xl sm:shadow-2xl sm:shadow-cyan-950/30">
              <CardHeader className="space-y-5 px-4 pt-4 sm:px-6 sm:pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <div className="font-heading text-[11px] uppercase tracking-[0.22em] text-cyan-300 sm:text-[13px] sm:tracking-[0.24em]">
                      Pulse-Board Workspace
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="max-w-2xl text-2xl leading-tight text-white sm:text-4xl">
                        Welcome back{user?.username ? `, ${user.username}` : ''}
                        . Shape the next round of feedback.
                      </CardTitle>
                      <CardDescription className="max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base sm:leading-7">
                        Review every poll you have launched, track what is live,
                        and jump into creating the next one whenever you are
                        ready.
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start border border-white/10 bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-zinc-300 sm:text-[11px]">
                    <UserRound className="size-4 text-cyan-300" />
                    Creator mode
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-4 px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  <StatsCard
                    icon={Layers3}
                    label="Total polls"
                    value={isLoading ? '...' : String(polls.length)}
                  />
                  <StatsCard
                    icon={ChartColumnBig}
                    label="Total questions"
                    value={isLoading ? '...' : String(totalQuestions)}
                  />
                  <StatsCard
                    icon={Clock3}
                    label="Live polls"
                    value={isLoading ? '...' : String(livePolls)}
                  />
                </div>

                <div className="flex flex-col gap-3 border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-heading text-xs uppercase tracking-[0.14em] text-cyan-300">
                      New poll
                    </p>
                    <p className="text-sm leading-6 text-zinc-300">
                      Open the creator flow and set up your next question set.
                    </p>
                  </div>

                  <Button
                    asChild
                    className="pixel-hover-button group border border-cyan-300 bg-cyan-400 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-950 hover:bg-cyan-300"
                  >
                    <Link to="/workspace/create">
                      Create poll
                      <ArrowRight className="pixel-hover-arrow size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-white/10 bg-zinc-900/75 backdrop-blur-xl">
              <CardHeader className="space-y-3 px-4 pt-4 sm:px-6 sm:pt-6">
                <div className="inline-flex size-12 items-center justify-center border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                  <MessageSquareQuote className="size-6" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="font-heading text-base leading-relaxed text-white sm:text-lg">
                    Poll pulse
                  </CardTitle>
                  <CardDescription className="text-sm leading-6 text-zinc-400">
                    A quick read on the workspace you are building right now.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6">
                <InsightTile
                  title="Authenticated creator"
                  value={user?.email || 'Signed-in session active'}
                />
                <InsightTile
                  title="Latest activity"
                  value={
                    polls[0]?.createdAt
                      ? `Last poll created ${formatDate(polls[0].createdAt)}`
                      : 'Create your first poll to start activity tracking'
                  }
                />
                <InsightTile
                  title="Workspace state"
                  value={
                    isLoading
                      ? 'Loading your board...'
                      : polls.length > 0
                        ? `${polls.length} poll${polls.length === 1 ? '' : 's'} ready for review`
                        : 'No polls yet. Your first one will appear here.'
                  }
                />
              </CardContent>
            </Card>
          </section>

          <section>
            <Card className="border border-white/10 bg-zinc-900/85 shadow-xl shadow-cyan-950/20 backdrop-blur-xl">
              <CardHeader className="space-y-2 px-4 pt-4 sm:px-6 sm:pt-6">
                <CardTitle className="font-heading text-base leading-relaxed text-white sm:text-lg">
                  My polls
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-zinc-400">
                  Every poll created by your authenticated account appears here.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                {isLoading ? (
                  <div className="grid gap-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-32 animate-pulse border border-white/8 bg-white/4"
                      />
                    ))}
                  </div>
                ) : polls.length === 0 ? (
                  <div className="border border-dashed border-cyan-400/20 bg-cyan-400/5 px-6 py-12 text-center">
                    <div className="mx-auto mb-4 flex size-14 items-center justify-center border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                      <FilePlus2 className="size-6" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">
                      No polls created yet
                    </h2>
                    <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                      You have not created any polls with this account yet.
                      Click the create button to start your first feedback
                      session.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 xl:grid-cols-2">
                    {polls.map((poll) => (
                      <Card
                        key={poll.id}
                        className="cursor-pointer border border-white/10 bg-zinc-950/55 transition hover:border-cyan-400/30 hover:bg-zinc-950/70"
                        onClick={() =>
                          void navigate({
                            to: '/workspace/$pollId',
                            params: { pollId: poll.id },
                          })
                        }
                      >
                        <CardHeader className="space-y-3 px-4 pt-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-2">
                              <CardTitle className="text-lg leading-snug text-white">
                                {poll.title}
                              </CardTitle>
                              <CardDescription className="text-sm leading-6 text-zinc-400">
                                {poll.description?.trim() ||
                                  'No description added for this poll yet.'}
                              </CardDescription>
                            </div>
                            <span
                              className={`border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${
                                poll.isPublished
                                  ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
                                  : 'border-cyan-400/25 bg-cyan-400/10 text-cyan-300'
                              }`}
                            >
                              {poll.isPublished ? 'Published' : 'Live'}
                            </span>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4 px-4 pb-4">
                          <div className="grid gap-3 sm:grid-cols-3">
                            <PollMeta
                              label="Mode"
                              value={toTitleCase(poll.responseMode)}
                            />
                            <PollMeta
                              label="Questions"
                              value={String(poll.questions.length)}
                            />
                            <PollMeta
                              label="Expires"
                              value={formatDate(poll.expiresAt)}
                            />
                          </div>

                          <div className="border border-white/8 bg-white/4 p-3">
                            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-300">
                              Question preview
                            </p>
                            <ul className="space-y-2 text-sm leading-6 text-zinc-400">
                              {poll.questions.slice(0, 2).map((question) => (
                                <li key={question.id}>
                                  {question.order}. {question.question}
                                </li>
                              ))}
                              {poll.questions.length > 2 ? (
                                <li className="text-cyan-300">
                                  +{poll.questions.length - 2} more question
                                  {poll.questions.length - 2 === 1 ? '' : 's'}
                                </li>
                              ) : null}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </main>
      </div>

      <AlertDialog
        open={Boolean(errorMessage)}
        onOpenChange={(open) => !open && setErrorMessage(null)}
      >
        <AlertDialogContent className="border border-red-400/20 bg-zinc-900 text-zinc-50">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-red-400/10 text-red-300">
              <ShieldAlert className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Unable to load polls</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              {errorMessage ||
                'We could not fetch your workspace data right now. Please try again.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="bg-cyan-400 text-zinc-950 hover:bg-cyan-300"
              onClick={() => setErrorMessage(null)}
            >
              Dismiss
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function StatsCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Layers3
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
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}

function InsightTile({ title, value }: { title: string; value: string }) {
  return (
    <div className="border border-white/10 bg-zinc-950/55 p-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-400">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-zinc-200">{value}</p>
    </div>
  )
}

function PollMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/8 bg-white/4 p-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-zinc-100">{value}</p>
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
