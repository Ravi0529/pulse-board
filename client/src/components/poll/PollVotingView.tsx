import { Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PollAnalytics } from '@/services/analyticsServices'
import type { Poll } from '@/services/pollServices'
import { formatTimeLeft } from './poll-shared'
import type { LiveVotesMap, VoteMap } from './poll-shared'

interface PollVotingViewProps {
  analytics: PollAnalytics | null
  isSubmitting: boolean
  liveTotalResponses: number
  liveVotes: LiveVotesMap
  onSelectOption: (questionId: string, optionId: string) => void
  onSubmit: () => void
  poll: Poll
  timeLeftMs: number
  votes: VoteMap
}

export function PollVotingView({
  isSubmitting,
  onSelectOption,
  onSubmit,
  poll,
  timeLeftMs,
  votes,
}: PollVotingViewProps) {
  const requiredComplete = poll.questions
    .filter((question) => question.required)
    .every((question) => Boolean(votes[question.id]))

  const canSubmit =
    requiredComplete &&
    poll.questions.some((question) => Boolean(votes[question.id]))

  return (
    <Card className="border border-white/10 bg-zinc-900/85 shadow-xl shadow-cyan-950/20 backdrop-blur-xl">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-white">Answer the poll</CardTitle>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.14em]">
            <span className="border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-cyan-200">
              {formatTimeLeft(timeLeftMs)} left
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-10 px-4 pb-6 sm:px-6">
        {poll.questions.map((question, index) => {
          return (
            <div
              key={question.id}
              className={
                index > 0 ? 'border-t border-white/10 pt-10' : undefined
              }
            >
              <div className="space-y-2">
                <div className="font-heading text-[11px] uppercase tracking-[0.22em] text-cyan-300">
                  Question {index + 1} of {poll.questions.length} ·{' '}
                  {question.required ? 'Required' : 'Optional'}
                </div>
                <h2 className="text-xl leading-tight text-white">
                  {question.question}
                </h2>
              </div>

              <div className="mt-5 grid gap-3">
                {question.options.map((option) => {
                  return (
                    <button
                      key={option.id}
                      className={`w-full border p-4 text-left transition ${
                        votes[question.id] === option.id
                          ? 'border-cyan-300 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(103,232,249,0.2)]'
                          : 'border-white/10 bg-zinc-950/55 hover:border-cyan-400/30'
                      }`}
                      type="button"
                      onClick={() => onSelectOption(question.id, option.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-medium text-white">
                            {option.text}
                          </p>
                        </div>
                        {votes[question.id] === option.id ? (
                          <span className="border border-cyan-300/30 bg-cyan-400/15 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-200">
                            Selected
                          </span>
                        ) : null}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        <div className="flex flex-col gap-3 border border-white/10 bg-zinc-950/55 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-zinc-400">
            {!requiredComplete
              ? 'Answer every required question, then submit once.'
              : canSubmit
                ? 'Ready to submit your response.'
                : 'Choose at least one answer (for example a required question) to submit.'}
          </p>
          <Button
            className="pixel-hover-button shrink-0 border border-cyan-300 bg-cyan-400 text-zinc-950 hover:bg-cyan-300"
            disabled={isSubmitting || !canSubmit}
            type="button"
            onClick={onSubmit}
          >
            {isSubmitting ? 'Submitting…' : 'Submit all answers'}
            <Send className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
