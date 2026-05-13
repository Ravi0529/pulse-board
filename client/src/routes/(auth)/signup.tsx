import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldAlert,
  UserRound,
  MessageSquareQuote,
  PackageOpen,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { isAuthenticated } from '@/services/authSession'
import { authService } from '@/services/authServices'
import { FeatureTile } from '#/components/FeatureTile'

export const Route = createFileRoute('/(auth)/signup')({
  beforeLoad: () => {
    if (isAuthenticated()) {
      throw redirect({ to: '/workspace' })
    }
  },
  component: SignupPage,
})

interface SignupFormValues {
  username: string
  email: string
  password: string
}

function SignupPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated()) {
      void navigate({ to: '/workspace', replace: true })
    }
  }, [navigate])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignupFormValues>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
    mode: 'onBlur',
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      setIsSubmitting(true)
      setErrorMessage(null)

      await authService.signup(values)
      reset()
      await navigate({ to: '/login' })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Something went wrong while creating your account.'

      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <div className="dark min-h-screen overflow-hidden bg-zinc-950 text-zinc-50">
      <div className="relative isolate min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.14),transparent_30%),linear-gradient(160deg,#09090b_0%,#111827_45%,#0f172a_100%)]" />
        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[32px_32px]" />
        <div className="absolute inset-0 opacity-12 bg-[linear-gradient(45deg,rgba(34,211,238,0.18)_25%,transparent_25%,transparent_50%,rgba(34,211,238,0.18)_50%,rgba(34,211,238,0.18)_75%,transparent_75%,transparent)] bg-size-[18px_18px]" />
        <div className="absolute left-1/2 top-16 h-40 w-40 -translate-x-1/2 bg-cyan-400/20 blur-3xl animate-pulse sm:top-24 sm:h-56 sm:w-56" />

        <main className="relative mx-auto grid min-h-screen max-w-7xl items-start gap-8 px-4 py-6 sm:items-center sm:gap-10 sm:px-6 sm:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
          <section className="order-2 space-y-5 pb-4 lg:order-1 lg:space-y-6 lg:pr-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="font-heading text-[11px] uppercase tracking-[0.22em] text-cyan-300 sm:text-[13px] sm:tracking-[0.24em]">
                Pulse-Board
              </div>
              <h1 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                Join the live poll arena and start crafting sharper feedback
                loops.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-zinc-300 sm:text-lg sm:leading-7">
                Build your creator profile, spin up live questions, and turn
                audience reactions into momentum.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <FeatureTile
                icon={PackageOpen}
                title="Quick start"
                description="Claim your profile and get into poll creation in a few clicks."
              />
              <FeatureTile
                icon={ShieldAlert}
                title="Safer flows"
                description="Clear validation, protected routes, and better auth feedback."
              />
            </div>
          </section>

          <section className="order-1 lg:order-2">
            <Card className="mx-auto w-full max-w-xl border border-white/10 bg-zinc-900/85 shadow-xl shadow-cyan-950/25 backdrop-blur-xl sm:shadow-2xl sm:shadow-cyan-950/30">
              <CardHeader className="space-y-3 px-4 pt-4 sm:space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="inline-flex size-10 shrink-0 items-center justify-center border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 transition-transform duration-300 hover:scale-105 sm:size-12">
                    <MessageSquareQuote className="size-6" />
                  </div>
                  <div className="border border-white/10 bg-white/5 px-2.5 py-2 text-[10px] uppercase tracking-[0.14em] text-zinc-300 sm:px-3 sm:text-[11px]">
                    No queue time
                  </div>
                </div>
                <div className="space-y-1">
                  <CardTitle className="font-heading text-base leading-relaxed text-white sm:text-xl">
                    Create your account
                  </CardTitle>
                  <CardDescription className="text-sm leading-6 text-zinc-400 sm:text-base">
                    Set your handle, secure your login, and get ready to launch
                    your first poll.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="px-4 pb-4 sm:px-4">
                <form className="space-y-2.5 sm:space-y-3" onSubmit={onSubmit}>
                  <FormField
                    label="Username"
                    error={errors.username?.message}
                    icon={<UserRound className="size-4" />}
                  >
                    <Input
                      aria-invalid={Boolean(errors.username)}
                      autoComplete="username"
                      className="h-11 border-white/10 bg-zinc-950/70 pl-12 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:border-cyan-400/60 focus-visible:ring-cyan-400/20 sm:h-12"
                      placeholder="pick-a-username"
                      {...register('username', {
                        required: 'Username is required',
                        minLength: {
                          value: 2,
                          message: 'Username must be at least 2 characters',
                        },
                      })}
                    />
                  </FormField>

                  <FormField
                    label="Email"
                    error={errors.email?.message}
                    icon={<Mail className="size-4" />}
                  >
                    <Input
                      aria-invalid={Boolean(errors.email)}
                      autoComplete="email"
                      className="h-11 border-white/10 bg-zinc-950/70 pl-12 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:border-cyan-400/60 focus-visible:ring-cyan-400/20 sm:h-12"
                      placeholder="you@pollverse.dev"
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Enter a valid email address',
                        },
                      })}
                    />
                  </FormField>

                  <FormField
                    label="Password"
                    error={errors.password?.message}
                    icon={<LockKeyhole className="size-4" />}
                  >
                    <div className="relative">
                      <Input
                        aria-invalid={Boolean(errors.password)}
                        autoComplete="new-password"
                        className="h-11 border-white/10 bg-zinc-950/70 pl-12 pr-12 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:border-cyan-400/60 focus-visible:ring-cyan-400/20 sm:h-12"
                        placeholder="8+ characters to unlock the pulse board"
                        type={showPassword ? 'text' : 'password'}
                        {...register('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters',
                          },
                          pattern: {
                            value:
                              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                            message:
                              'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
                          },
                        })}
                      />
                      <button
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-zinc-400 transition hover:text-cyan-300"
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </FormField>

                  <Button
                    className="pixel-hover-button group h-11 w-full border border-cyan-300 bg-cyan-400 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-950 hover:bg-cyan-300 sm:h-12"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    {isSubmitting ? 'Creating account...' : 'Create account'}
                    <ArrowRight className="pixel-hover-arrow size-4" />
                  </Button>

                  <div className="flex flex-col items-stretch justify-between gap-3 border border-white/10 bg-black/20 px-3 py-3 text-sm text-zinc-400 sm:flex-row sm:items-center sm:px-4">
                    <span className="text-center sm:text-left">
                      Already have access credentials?
                    </span>
                    <Button
                      asChild
                      className="w-full border-cyan-400/25 bg-cyan-400/5 text-cyan-200 hover:bg-cyan-400/10 sm:w-auto"
                      size="sm"
                      variant="outline"
                    >
                      <Link to="/login">Go to login</Link>
                    </Button>
                  </div>
                </form>
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
            <AlertDialogTitle>Signup failed</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              {errorMessage ||
                'We could not create your account. Please review your details and try again.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="bg-cyan-400 text-zinc-950 hover:bg-cyan-300"
              onClick={() => setErrorMessage(null)}
            >
              Try again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface FormFieldProps {
  label: string
  error?: string
  icon: ReactNode
  children: ReactNode
}

function FormField({ label, error, icon, children }: FormFieldProps) {
  return (
    <label className="block space-y-1.5 sm:space-y-2">
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-200 sm:text-sm">
        {label}
      </span>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center border-r border-white/8 bg-white/3 text-zinc-500">
          {icon}
        </div>
        {children}
      </div>
      <div className="min-h-5 text-xs leading-5 text-red-300 sm:text-sm">
        {error || ''}
      </div>
    </label>
  )
}
