import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  BarChart3,
  Clock,
  MessageSquare,
  Zap,
  Shield,
  Activity,
  Share2,
  Eye,
  Trophy,
  Sparkles,
  ChevronRight,
  Star,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="dark min-h-screen overflow-hidden bg-zinc-950 text-zinc-50">
      <div className="relative isolate min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.14),transparent_30%),linear-gradient(160deg,#09090b_0%,#111827_45%,#0f172a_100%)]" />
        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[32px_32px]" />
        <div className="absolute inset-0 opacity-12 bg-[linear-gradient(45deg,rgba(34,211,238,0.18)_25%,transparent_25%,transparent_50%,rgba(34,211,238,0.18)_50%,rgba(34,211,238,0.18)_75%,transparent_75%,transparent)] bg-size-[18px_18px]" />

        <div className="absolute left-1/2 top-16 h-40 w-40 -translate-x-1/2 bg-cyan-400/20 blur-3xl animate-pulse sm:top-24 sm:h-56 sm:w-56" />
        <div
          className="absolute right-0 top-1/3 h-64 w-64 bg-purple-500/10 blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute bottom-0 left-0 h-48 w-48 bg-emerald-500/10 blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />

        <main className="relative">
          <section className="relative mx-auto max-w-7xl px-4 pt-20 sm:px-6 sm:pt-32 lg:px-10">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 backdrop-blur-sm">
                <Sparkles className="size-3 text-cyan-400" />
                <span className="text-[10px] uppercase tracking-wider text-cyan-300">
                  Next-Gen Polling Platform
                </span>
              </div>

              <h1 className="mx-auto max-w-5xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                <span className="bg-linear-to-r from-cyan-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent font-heading sm:text-6xl lg:text-7xl">
                  Pulse Board
                </span>
                <br />
                Turn Feedback Into
                <span className="relative ml-3 inline-block">
                  <span className="relative z-10">Collective Power</span>
                  <div className="absolute bottom-2 left-0 right-0 h-3 bg-cyan-400/30 blur-sm" />
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
                Create high-stakes polls, gather real-time responses, and watch
                analytics evolve like a live leaderboard. The ultimate feedback
                arena for creators and communities.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  className="group relative overflow-hidden border border-cyan-300 bg-cyan-400 px-8 py-6 text-base font-semibold uppercase tracking-wider text-zinc-950 transition-all hover:bg-cyan-300 hover:shadow-lg hover:shadow-cyan-400/25"
                >
                  <Link to="/signup">
                    <span className="relative z-10 flex items-center gap-2">
                      Start Your Campaign
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="border-cyan-400/30 bg-cyan-400/5 px-8 py-6 text-base font-semibold text-cyan-200 backdrop-blur-sm hover:bg-cyan-400/10"
                >
                  <a href="/workspace">
                    Explore the Arena
                    <ChevronRight className="size-4" />
                  </a>
                </Button>
              </div>

              <div className="mt-20 grid grid-cols-1 gap-6 border-y border-white/10 py-10 sm:grid-cols-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-400 sm:text-2xl font-heading">
                    Real-time
                  </div>
                  <div className="mt-2 text-sm text-zinc-400">
                    Live Analytics
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-400 sm:text-2xl font-heading">
                    Unlimited
                  </div>
                  <div className="mt-2 text-sm text-zinc-400">
                    Poll Creation
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-400 sm:text-2xl font-heading">
                    100%
                  </div>
                  <div className="mt-2 text-sm text-zinc-400">
                    Response Control
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            id="features"
            className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32 lg:px-10"
          >
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Power-Up Your{' '}
                <span className="text-2xl font-heading bg-linear-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  Polling Experience
                </span>
              </h2>
              <p className="mt-4 text-zinc-400">
                Everything you need to create engaging polls and gather
                meaningful feedback
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Zap}
                title="Real-time Updates"
                description="Watch responses pour in live with WebSocket-powered analytics. Every vote triggers instant updates."
                gradient="from-cyan-400/20 to-cyan-600/20"
                iconColor="text-cyan-400"
              />
              <FeatureCard
                icon={Shield}
                title="Smart Authentication"
                description="Choose between anonymous public polls or authenticated-only access for premium feedback."
                gradient="from-blue-400/20 to-blue-600/20"
                iconColor="text-blue-400"
              />
              <FeatureCard
                icon={Clock}
                title="Expiry System"
                description="Set automatic expiration dates. Polls close themselves when time runs out."
                gradient="from-purple-400/20 to-purple-600/20"
                iconColor="text-purple-400"
              />
              <FeatureCard
                icon={BarChart3}
                title="Analytics Dashboard"
                description="Get detailed insights with question-wise breakdowns, option percentages, and participation metrics."
                gradient="from-emerald-400/20 to-emerald-600/20"
                iconColor="text-emerald-400"
              />
              <FeatureCard
                icon={Share2}
                title="Shareable Links"
                description="Generate unique poll links to share anywhere. Perfect for social media, email, or embed."
                gradient="from-orange-400/20 to-orange-600/20"
                iconColor="text-orange-400"
              />
              <FeatureCard
                icon={Trophy}
                title="Results Publishing"
                description="Publish final results to let everyone see the outcome. Great for contests and surveys."
                gradient="from-yellow-400/20 to-yellow-600/20"
                iconColor="text-yellow-400"
              />
            </div>
          </section>

          <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32 lg:px-10">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                How to{' '}
                <span className="text-2xl font-heading bg-linear-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  Dominate the Game
                </span>
              </h2>
              <p className="mt-4 text-zinc-400">
                Three simple steps to launch your feedback campaign
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <StepCard
                number="01"
                title="Create Your Poll"
                description="Add multiple questions, set requirements, choose response mode, and pick an expiry date."
                icon={MessageSquare}
              />
              <StepCard
                number="02"
                title="Share the Link"
                description="Get a unique public URL and share it with your audience anywhere online."
                icon={Share2}
              />
              <StepCard
                number="03"
                title="Watch & Analyze"
                description="Monitor live responses, view analytics, and publish results when ready."
                icon={Activity}
              />
            </div>
          </section>

          <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32 lg:px-10">
            <Card className="relative overflow-hidden border border-cyan-400/20 bg-linear-to-br from-zinc-900/90 to-zinc-900/50 backdrop-blur-xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.15),transparent_50%)]" />

              <CardHeader className="relative text-center">
                <div className="mx-auto mb-4 inline-flex size-16 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10">
                  <Eye className="size-8 text-cyan-400" />
                </div>
                <CardTitle className="text-2xl text-white sm:text-3xl">
                  Ready to Launch Your First Poll?
                </CardTitle>
                <CardDescription className="mx-auto max-w-2xl text-base text-zinc-400">
                  Join creators who are already using Pulse Board to gather
                  meaningful feedback and engage their communities.
                </CardDescription>
              </CardHeader>

              <CardContent className="relative flex justify-center pb-8">
                <Button
                  asChild
                  className="group border border-cyan-300 bg-cyan-400 px-8 py-6 text-base font-semibold uppercase tracking-wider text-zinc-950 hover:bg-cyan-300"
                >
                  <Link to="/signup">
                    Get Started Now
                    <Star className="ml-2 size-4 transition-transform group-hover:scale-110" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  iconColor,
}: {
  icon: any
  title: string
  description: string
  gradient: string
  iconColor: string
}) {
  return (
    <div className="group relative">
      <div
        className={`absolute inset-0 rounded-lg bg-linear-to-br ${gradient} opacity-0 blur-xl transition-opacity group-hover:opacity-100`}
      />
      <Card className="relative h-full border border-white/10 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/30 hover:bg-zinc-900/70">
        <CardHeader>
          <div
            className={`mb-4 inline-flex size-12 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 ${iconColor}`}
          >
            <Icon className="size-6" />
          </div>
          <CardTitle className="text-lg text-white">{title}</CardTitle>
          <CardDescription className="text-zinc-400">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

function StepCard({
  number,
  title,
  description,
  icon: Icon,
}: {
  number: string
  title: string
  description: string
  icon: any
}) {
  return (
    <div className="relative">
      <div className="absolute -top-3 left-4 text-6xl font-black text-cyan-400/10 select-none">
        {number}
      </div>
      <Card className="relative border border-white/10 bg-zinc-900/50 backdrop-blur-sm transition-all hover:border-cyan-400/30">
        <CardHeader>
          <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10">
            <Icon className="size-6 text-cyan-400" />
          </div>
          <CardTitle className="text-xl text-white">{title}</CardTitle>
          <CardDescription className="text-zinc-400">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
