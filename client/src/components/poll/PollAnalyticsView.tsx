import { Copy } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import type { PollAnalytics } from '@/services/analyticsServices'
import { formatTimeLeft, SideInfo } from './poll-shared'

const chartConfig = {
  votes: {
    label: 'Votes',
    color: '#22d3ee',
  },
} satisfies ChartConfig

interface PollAnalyticsViewProps {
  analytics: PollAnalytics | null
  creatorName: string
  shareUrl: string
  timeLeftMs: number
  onCopyLink: () => void
}

export function PollAnalyticsView({
  analytics,
  shareUrl,
  timeLeftMs,
  onCopyLink,
}: PollAnalyticsViewProps) {
  return (
    <div className="space-y-6">
      <Card className="border border-white/10 bg-zinc-900/85 shadow-xl shadow-cyan-950/20 backdrop-blur-xl">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-white">
                {analytics?.isPublished
                  ? 'Public results'
                  : `Creator analytics`}
              </CardTitle>
              <CardDescription className="text-zinc-400">
                {analytics?.isPublished
                  ? 'The poll has expired, so results are visible to everyone on this same link.'
                  : 'You are the creator, so live analytics are visible here while the poll is active.'}
              </CardDescription>
            </div>
            <Button
              className="border-cyan-400/25 bg-cyan-400/5 text-cyan-200 hover:bg-cyan-400/10"
              type="button"
              variant="outline"
              onClick={onCopyLink}
            >
              <Copy className="size-4" />
              Copy link
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <SideInfo
            label="Total responses"
            value={String(analytics?.totalResponses ?? 0)}
          />
          <SideInfo label="Share link" value={shareUrl} mono />
          <SideInfo
            label="Time left"
            value={
              analytics?.isPublished ? 'Expired' : formatTimeLeft(timeLeftMs)
            }
          />
        </CardContent>
      </Card>

      {analytics ? (
        <div className="space-y-6">
          {analytics.questions.map((question, index) => (
            <Card
              key={question.questionId}
              className="border border-white/10 bg-zinc-900/85 shadow-xl shadow-cyan-950/20 backdrop-blur-xl"
            >
              <CardHeader>
                <CardTitle className="text-white">
                  Question {index + 1}
                </CardTitle>
                <CardDescription className="text-zinc-300">
                  {question.question}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {question.options.map((option) => (
                    <div
                      key={option.optionId}
                      className="border border-white/10 bg-zinc-950/55 p-4"
                    >
                      <p className="text-sm font-medium text-white">
                        {option.text}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-cyan-200">
                        {option.votes}
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">
                        {option.percentage}% of responses
                      </p>
                    </div>
                  ))}
                </div>

                <ChartContainer config={chartConfig} className="h-72 w-full">
                  <BarChart
                    accessibilityLayer
                    data={question.options.map((option) => ({
                      option: option.text,
                      votes: option.votes,
                    }))}
                    margin={{ top: 16, right: 12, left: 0, bottom: 12 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="option"
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar dataKey="votes" fill="var(--color-votes)" radius={0}>
                      <LabelList
                        dataKey="votes"
                        position="top"
                        className="fill-zinc-200"
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border border-white/10 bg-zinc-900/85">
          <CardContent className="p-8 text-center text-zinc-400">
            Loading analytics...
          </CardContent>
        </Card>
      )}
    </div>
  )
}
