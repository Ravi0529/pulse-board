import { ArrowLeft, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import type { CarouselApi } from '@/components/ui/carousel'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Poll } from '@/services/pollServices'
import type { PollAnalytics } from '@/services/analyticsServices'
import { formatTimeLeft } from './poll-shared'
import type { LiveVotesMap, VoteMap } from './poll-shared'

interface PollVotingViewProps {
  analytics: PollAnalytics | null
  carouselApi?: CarouselApi
  currentQuestionIndex: number
  isSubmitting: boolean
  liveVotes: LiveVotesMap
  onAdvance: () => void
  onSelectOption: (questionId: string, optionId: string) => void
  poll: Poll
  setCarouselApi: (api: CarouselApi) => void
  timeLeftMs: number
  votes: VoteMap
}

export function PollVotingView({
  analytics,
  carouselApi,
  currentQuestionIndex,
  isSubmitting,
  liveVotes,
  onAdvance,
  onSelectOption,
  poll,
  setCarouselApi,
  timeLeftMs,
  votes,
}: PollVotingViewProps) {
  const currentQuestion = poll.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === poll.questions.length - 1
  const currentSelection = votes[currentQuestion.id]

  return (
    <Card className="border border-white/10 bg-zinc-900/85 shadow-xl shadow-cyan-950/20 backdrop-blur-xl">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-white">
              Question {currentQuestionIndex + 1} of {poll.questions.length}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              One question is shown at a time. Move back and forth whenever you
              need.
            </CardDescription>
          </div>
          <div className="border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-cyan-200">
            {formatTimeLeft(timeLeftMs)} left
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-6 sm:px-6">
        <Carousel
          className="mx-auto w-full max-w-4xl"
          opts={{ align: 'start', loop: false }}
          setApi={setCarouselApi}
        >
          <CarouselContent>
            {poll.questions.map((question, index) => (
              <CarouselItem key={question.id}>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="font-heading text-[11px] uppercase tracking-[0.22em] text-cyan-300">
                      {question.required
                        ? 'Required question'
                        : 'Optional question'}
                    </div>
                    <h2 className="text-2xl leading-tight text-white">
                      {question.question}
                    </h2>
                  </div>

                  <div className="grid gap-3">
                    {question.options.map((option) => {
                      const analyticsQuestion = analytics
                        ? analytics.questions.find(
                            (aq) => aq.questionId === question.id,
                          )
                        : undefined

                      const analyticsVotes = analyticsQuestion
                        ? analyticsQuestion.options.find(
                            (ao) => ao.optionId === option.id,
                          )?.votes
                        : undefined

                      const liveVotesBucket = liveVotes[question.id] as
                        | Record<string, number>
                        | undefined

                      const liveVoteCount =
                        analyticsVotes ?? liveVotesBucket?.[option.id] ?? 0

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
                              <p className="mt-2 text-sm text-zinc-400">
                                {liveVoteCount} user
                                {liveVoteCount === 1 ? '' : 's'} picked this
                                option
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

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm leading-6 text-zinc-400">
                      {currentSelection
                        ? 'Selection saved for this question.'
                        : question.required
                          ? 'Choose one option to continue.'
                          : 'You can skip this optional question if needed.'}
                    </p>

                    <Button
                      className="pixel-hover-button border border-cyan-300 bg-cyan-400 text-zinc-950 hover:bg-cyan-300"
                      disabled={
                        isSubmitting ||
                        (question.required && !votes[question.id])
                      }
                      onClick={onAdvance}
                    >
                      {isSubmitting && isLastQuestion
                        ? 'Submitting...'
                        : isLastQuestion
                          ? 'Submit response'
                          : 'Next question'}
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>

                  {index > 0 ? (
                    <Button
                      className="border-cyan-400/25 bg-cyan-400/5 text-cyan-200 hover:bg-cyan-400/10"
                      type="button"
                      variant="outline"
                      onClick={() => carouselApi?.scrollPrev()}
                    >
                      <ArrowLeft className="size-4" />
                      Previous question
                    </Button>
                  ) : null}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 top-auto bottom-0 translate-y-0 lg:-left-12 lg:top-1/2 lg:bottom-auto lg:-translate-y-1/2" />
          <CarouselNext className="right-0 top-auto bottom-0 translate-y-0 lg:-right-12 lg:top-1/2 lg:bottom-auto lg:-translate-y-1/2" />
        </Carousel>
      </CardContent>
    </Card>
  )
}
