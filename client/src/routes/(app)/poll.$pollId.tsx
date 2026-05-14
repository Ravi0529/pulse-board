import { useEffect, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { io } from 'socket.io-client'
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
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
import { Input } from '@/components/ui/input'
import { PollAnalyticsView } from '@/components/poll/PollAnalyticsView'
import { PollStateCard } from '@/components/poll/PollStateCard'
import {
  formatTimeLeft,
  MetaTile,
  PollShell,
} from '@/components/poll/poll-shared'
import type { LiveVotesMap, VoteMap } from '@/components/poll/poll-shared'
import { PollVotingView } from '@/components/poll/PollVotingView'
import { api } from '@/services/api'
import { analyticsService } from '@/services/analyticsServices'
import type { PollAnalytics } from '@/services/analyticsServices'
import { getStoredUser, isAuthenticated } from '@/services/authSession'
import { authService } from '@/services/authServices'
import { pollService } from '@/services/pollServices'
import type { Poll } from '@/services/pollServices'
import { responseService } from '@/services/responseServices'

type RealtimePollPayload = {
  pollId: string
  totalResponses: number
  questions: Array<{
    questionId: string
    options: Array<{ optionId: string; votes: number }>
  }>
}

function mergeAnalyticsWithRealtime(
  currentAnalytics: PollAnalytics | null,
  payload: RealtimePollPayload,
): PollAnalytics | null {
  if (!currentAnalytics || currentAnalytics.pollId !== payload.pollId) {
    return currentAnalytics
  }

  return {
    ...currentAnalytics,
    totalResponses: payload.totalResponses,
    questions: currentAnalytics.questions.map((question) => {
      const liveQuestion = payload.questions.find(
        (payloadQuestion) => payloadQuestion.questionId === question.questionId,
      )

      if (!liveQuestion) {
        return question
      }

      return {
        ...question,
        options: question.options.map((option) => {
          const liveOption = liveQuestion.options.find(
            (payloadOption) => payloadOption.optionId === option.optionId,
          )
          const votes = liveOption?.votes ?? option.votes

          return {
            ...option,
            votes,
            percentage:
              payload.totalResponses === 0
                ? 0
                : Number(((votes / payload.totalResponses) * 100).toFixed(2)),
          }
        }),
      }
    }),
  }
}

export const Route = createFileRoute('/(app)/poll/$pollId')({
  component: PollPage,
})

function PollPage() {
  const navigate = useNavigate()
  const { pollId } = Route.useParams()
  const storedUser = getStoredUser()
  const authenticated = isAuthenticated()

  const [poll, setPoll] = useState<Poll | null>(null)
  const [analytics, setAnalytics] = useState<PollAnalytics | null>(null)
  const [votes, setVotes] = useState<VoteMap>({})
  const [anonymousName, setAnonymousName] = useState('')
  const [anonymousReady, setAnonymousReady] = useState(false)
  const [liveVotes, setLiveVotes] = useState<LiveVotesMap>({})
  const [liveTotalResponses, setLiveTotalResponses] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [showResultNotice, setShowResultNotice] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [timeLeftMs, setTimeLeftMs] = useState(0)
  const [hasRefreshedAfterExpiry, setHasRefreshedAfterExpiry] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadPoll = async () => {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        const data = await pollService.getPollById(pollId)

        if (!isMounted) return
        setPoll(data)
      } catch (loadError) {
        if (!isMounted) return

        setErrorMessage(
          loadError instanceof Error
            ? loadError.message
            : 'Could not load this poll link.',
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadPoll()

    return () => {
      isMounted = false
    }
  }, [pollId])

  const isCreator = Boolean(poll && storedUser?.id === poll.creatorId)
  const isExpired = Boolean(
    poll && new Date(poll.expiresAt).getTime() <= Date.now(),
  )
  const isAnonymousPoll = poll?.responseMode === 'ANONYMOUS'
  const isPrivatePoll = poll?.responseMode === 'AUTHENTICATED'
  const showAnalyticsView = Boolean(
    poll && (poll.isPublished || isExpired || isCreator),
  )

  useEffect(() => {
    if (!poll) return

    const updateTimer = () => {
      setTimeLeftMs(
        Math.max(new Date(poll.expiresAt).getTime() - Date.now(), 0),
      )
    }

    updateTimer()
    const timer = window.setInterval(updateTimer, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [poll])

  useEffect(() => {
    if (!poll || !showAnalyticsView) return

    let isMounted = true

    const loadAnalytics = async () => {
      try {
        const data = await analyticsService.getPollAnalytics(poll.id)
        if (!isMounted) return

        setAnalytics(data)
        setLiveTotalResponses(data.totalResponses)
        setLiveVotes(
          Object.fromEntries(
            data.questions.map((question) => [
              question.questionId,
              Object.fromEntries(
                question.options.map((option) => [
                  option.optionId,
                  option.votes,
                ]),
              ),
            ]),
          ),
        )
      } catch (analyticsError) {
        if (!isMounted) return

        setErrorMessage(
          analyticsError instanceof Error
            ? analyticsError.message
            : 'Could not load analytics for this poll.',
        )
      }
    }

    void loadAnalytics()

    return () => {
      isMounted = false
    }
  }, [poll, showAnalyticsView])

  useEffect(() => {
    if (!poll) return

    const socketBaseUrl = new URL(
      api.defaults.baseURL || 'http://localhost:8000/api',
    ).origin

    const socket = io(socketBaseUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      socket.emit('join_poll', poll.id)
    })

    socket.on('poll_response_update', (payload: RealtimePollPayload) => {
      if (payload.pollId !== poll.id) return

      setLiveTotalResponses(payload.totalResponses)
      setLiveVotes(
        Object.fromEntries(
          payload.questions.map((question) => [
            question.questionId,
            Object.fromEntries(
              question.options.map((option) => [option.optionId, option.votes]),
            ),
          ]),
        ),
      )
      setAnalytics((current) => mergeAnalyticsWithRealtime(current, payload))
    })

    return () => {
      socket.emit('leave_poll', poll.id)
      socket.disconnect()
    }
  }, [poll])

  useEffect(() => {
    if (!showResultNotice) return

    const timeout = window.setTimeout(() => {
      setShowResultNotice(false)
    }, 10_000)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [showResultNotice])

  useEffect(() => {
    if (
      !poll ||
      poll.isPublished ||
      hasRefreshedAfterExpiry ||
      timeLeftMs > 0
    ) {
      return
    }

    let isMounted = true

    const refreshAfterExpiry = async () => {
      try {
        const nextPoll = await pollService.getPollById(poll.id)
        if (!isMounted) return

        setPoll(nextPoll)
        setHasRefreshedAfterExpiry(true)
      } catch {
        if (isMounted) {
          setHasRefreshedAfterExpiry(true)
        }
      }
    }

    void refreshAfterExpiry()

    return () => {
      isMounted = false
    }
  }, [hasRefreshedAfterExpiry, poll, timeLeftMs])

  const shareUrl =
    typeof window === 'undefined'
      ? `/poll/${pollId}`
      : `${window.location.origin}/poll/${pollId}`

  const blockedAuthenticatedOnAnonymous = Boolean(
    poll &&
    isAnonymousPoll &&
    authenticated &&
    !isCreator &&
    !showAnalyticsView,
  )

  const blockedGuestOnPrivate = Boolean(
    poll && isPrivatePoll && !authenticated && !isCreator && !showAnalyticsView,
  )

  const canStartAnonymousVoting = Boolean(
    poll &&
    isAnonymousPoll &&
    !authenticated &&
    !isCreator &&
    !showAnalyticsView,
  )

  const canVote = Boolean(
    poll &&
    !showAnalyticsView &&
    !hasSubmitted &&
    poll.canVote &&
    ((isPrivatePoll && authenticated) ||
      (isAnonymousPoll && !authenticated && anonymousReady)),
  )

  const handleAnonymousStart = () => {
    if (anonymousName.trim().length < 2) {
      setErrorMessage('Please enter your name before continuing.')
      return
    }

    setErrorMessage(null)
    setAnonymousReady(true)
  }

  const handleSelectOption = (questionId: string, optionId: string) => {
    setVotes((currentVotes) => ({
      ...currentVotes,
      [questionId]: optionId,
    }))
  }

  const handleSubmitPoll = async () => {
    if (!poll) return

    const missingRequired = poll.questions.filter(
      (question) => question.required && !votes[question.id],
    )

    if (missingRequired.length > 0) {
      setErrorMessage('Please answer all required questions before submitting.')
      return
    }

    const answers = poll.questions
      .filter((question) => Boolean(votes[question.id]))
      .map((question) => ({
        questionId: question.id,
        optionId: votes[question.id],
      }))

    if (answers.length === 0) {
      setErrorMessage('Pick at least one answer before submitting.')
      return
    }

    setErrorMessage(null)

    try {
      setIsSubmitting(true)
      await responseService.submitPollResponse(poll.id, {
        anonymousIdentifier: isAnonymousPoll ? anonymousName.trim() : undefined,
        answers,
      })

      setHasSubmitted(true)
      setShowResultNotice(true)
    } catch (submitError) {
      setErrorMessage(
        submitError instanceof Error
          ? submitError.message
          : 'Could not submit your response.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogoutToVoteAnonymously = async () => {
    try {
      setIsLoggingOut(true)
      await authService.logout()
      window.location.reload()
    } catch (logoutError) {
      setErrorMessage(
        logoutError instanceof Error
          ? logoutError.message
          : 'Could not log out right now.',
      )
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      setErrorMessage('Could not copy the link automatically.')
    }
  }

  if (isLoading) {
    return (
      <PollShell>
        <Card className="border border-white/10 bg-zinc-900/85">
          <CardContent className="p-10 text-center text-zinc-400">
            Loading poll...
          </CardContent>
        </Card>
      </PollShell>
    )
  }

  if (!poll) {
    return (
      <PollShell>
        <PollStateCard
          title="Poll not available"
          description={errorMessage || 'This poll could not be loaded.'}
        />
      </PollShell>
    )
  }

  return (
    <PollShell>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <Card className="border border-white/10 bg-zinc-900/85 shadow-xl shadow-cyan-950/25 backdrop-blur-xl">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-heading text-[11px] uppercase tracking-[0.22em] text-cyan-300 sm:text-[13px]">
                    Live Poll Link
                  </div>
                  <CardTitle className="mt-2 text-2xl leading-tight text-white sm:text-4xl">
                    {poll.title}
                  </CardTitle>
                  <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
                    {poll.description?.trim() ||
                      `Hello from the ${poll.creator?.username || 'creator'}.`}
                  </CardDescription>
                </div>
                <Button
                  asChild
                  className="border-cyan-400/25 bg-cyan-400/5 text-cyan-200 hover:bg-cyan-400/10"
                  variant="outline"
                >
                  <Link to="/">
                    <ArrowLeft className="size-4" />
                    Back
                  </Link>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <MetaTile
                  icon={Clock3}
                  label="Time left"
                  value={formatTimeLeft(timeLeftMs)}
                />
                <MetaTile
                  icon={UserRound}
                  label="Mode"
                  value={
                    poll.responseMode === 'ANONYMOUS' ? 'Public' : 'Private'
                  }
                />
                <MetaTile
                  icon={Clock3}
                  label="Responses"
                  value={String(
                    analytics?.totalResponses ?? liveTotalResponses,
                  )}
                />
              </div>
            </CardHeader>
          </Card>

          {blockedAuthenticatedOnAnonymous ? (
            <PollStateCard
              title="Anonymous poll only"
              description="You cannot vote here while logged in. This poll accepts responses only from anonymous users."
              actions={[
                {
                  label: isLoggingOut ? 'Logging out...' : 'Logout and vote',
                  onClick: () => void handleLogoutToVoteAnonymously(),
                  disabled: isLoggingOut,
                  variant: 'default',
                },
                {
                  label: 'Go to workspace',
                  onClick: () => void navigate({ to: '/workspace' }),
                  variant: 'outline',
                },
              ]}
            />
          ) : blockedGuestOnPrivate ? (
            <PollStateCard
              title="Login required"
              description="This is a private poll. Login or sign up first if you want to vote in this poll."
              actions={[
                {
                  label: 'Go to login',
                  to: '/login',
                  variant: 'default',
                },
                {
                  label: 'Create account',
                  to: '/signup',
                  variant: 'outline',
                },
              ]}
            />
          ) : showAnalyticsView ? (
            <PollAnalyticsView
              analytics={analytics}
              creatorName={poll.creator?.username || 'creator'}
              shareUrl={shareUrl}
              timeLeftMs={timeLeftMs}
              onCopyLink={() => void handleCopyLink()}
            />
          ) : canStartAnonymousVoting && !anonymousReady ? (
            <Card className="border border-white/10 bg-zinc-900/85 shadow-xl shadow-cyan-950/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">
                  Enter your name to continue
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  This public poll accepts anonymous responses. Add your name on
                  this link, then continue to the questions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  className="h-12 border-white/10 bg-zinc-950/70 text-zinc-100"
                  placeholder="Your name"
                  value={anonymousName}
                  onChange={(event) => setAnonymousName(event.target.value)}
                />
                <Button
                  className="pixel-hover-button border border-cyan-300 bg-cyan-400 text-zinc-950 hover:bg-cyan-300"
                  onClick={handleAnonymousStart}
                >
                  Continue to poll
                  <ArrowRight className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ) : canVote ? (
            <PollVotingView
              analytics={analytics}
              isSubmitting={isSubmitting}
              liveTotalResponses={liveTotalResponses}
              liveVotes={liveVotes}
              onSelectOption={handleSelectOption}
              onSubmit={() => void handleSubmitPoll()}
              poll={poll}
              timeLeftMs={timeLeftMs}
              votes={votes}
            />
          ) : (
            <PollStateCard
              title="Thanks for participating"
              description="Your response has been received. Results will be shown on this same link after the poll expires."
            />
          )}
        </section>
      </div>

      <AlertDialog open={showResultNotice} onOpenChange={setShowResultNotice}>
        <AlertDialogContent className="border border-cyan-400/20 bg-zinc-900 text-zinc-50">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-cyan-400/10 text-cyan-300">
              <Clock3 className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Response submitted</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Results will be shown on this link only after the poll expires.
              This message will close in 10 seconds.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="bg-cyan-400 text-zinc-950 hover:bg-cyan-300"
              onClick={() => setShowResultNotice(false)}
            >
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(errorMessage)}
        onOpenChange={(open) => !open && setErrorMessage(null)}
      >
        <AlertDialogContent className="border border-red-400/20 bg-zinc-900 text-zinc-50">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-red-400/10 text-red-300">
              <ShieldAlert className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Poll action unavailable</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              {errorMessage || 'Something went wrong on this poll link.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="bg-cyan-400 text-zinc-950 hover:bg-cyan-300"
              onClick={() => setErrorMessage(null)}
            >
              Okay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PollShell>
  )
}
