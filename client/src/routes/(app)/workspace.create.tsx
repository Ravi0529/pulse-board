import { useMemo, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useFieldArray, useForm } from 'react-hook-form'
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CircleHelp,
  FilePlus2,
  Globe2,
  LockKeyhole,
  Plus,
  ShieldAlert,
  Trash2,
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
import { DateTimePicker24h } from '@/components/DateTimePicker'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { pollService } from '@/services/pollServices'

export const Route = createFileRoute('/(app)/workspace/create')({
  component: CreatePollPage,
})

type ResponseModeValue = 'ANONYMOUS' | 'AUTHENTICATED'

interface PollCreateFormValues {
  title: string
  description: string
  responseMode: ResponseModeValue
  expiresAt: string
  questions: Array<{
    question: string
    required: boolean
    options: Array<{
      value: string
    }>
  }>
}

function CreatePollPage() {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [minExpiryAt] = useState(() => getMinDateTime())
  const [defaultExpiryAt] = useState(() => getDefaultExpiryDateTime())

  const form = useForm<PollCreateFormValues>({
    defaultValues: {
      title: '',
      description: '',
      responseMode: 'AUTHENTICATED',
      expiresAt: defaultExpiryAt,
      questions: [createQuestion()],
    },
    mode: 'onBlur',
  })

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form

  const selectedResponseMode = watch('responseMode')
  const selectedExpiryAt = watch('expiresAt')

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: 'questions',
  })

  const responseModeCopy = useMemo(
    () => ({
      AUTHENTICATED: {
        label: 'Private poll',
        description: 'Only authenticated users can respond to this poll.',
        icon: LockKeyhole,
      },
      ANONYMOUS: {
        label: 'Public poll',
        description: 'Anyone can answer this poll without signing in.',
        icon: Globe2,
      },
    }),
    [],
  )

  const onSubmit = handleSubmit(async (values) => {
    try {
      setIsSubmitting(true)
      setErrorMessage(null)

      const createdPoll = await pollService.createPoll({
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        responseMode: values.responseMode,
        expiresAt: new Date(values.expiresAt).toISOString(),
        questions: values.questions.map((question) => ({
          question: question.question.trim(),
          required: question.required,
          options: question.options.map((option) => option.value.trim()),
        })),
      })

      await navigate({
        to: '/workspace/$pollId',
        params: { pollId: createdPoll.id },
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Something went wrong while creating your poll.'

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

        <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-10 lg:px-10">
          <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <Card className="border border-white/10 bg-zinc-900/85 shadow-xl shadow-cyan-950/25 backdrop-blur-xl sm:shadow-2xl sm:shadow-cyan-950/30">
              <CardHeader className="space-y-4 px-4 pt-4 sm:px-6 sm:pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex size-12 items-center justify-center border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                    <FilePlus2 className="size-6" />
                  </div>
                  <Button
                    asChild
                    className="border-cyan-400/25 bg-cyan-400/5 text-cyan-200 hover:bg-cyan-400/10"
                    variant="outline"
                  >
                    <Link to="/workspace">
                      <ArrowLeft className="size-4" />
                      Back to workspace
                    </Link>
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="font-heading text-[11px] uppercase tracking-[0.22em] text-cyan-300 sm:text-[13px] sm:tracking-[0.24em]">
                    Poll Creator
                  </div>
                  <CardTitle className="max-w-3xl text-2xl leading-tight text-white sm:text-4xl">
                    Build a poll
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                <form className="space-y-6" onSubmit={onSubmit}>
                  <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                    <FormBlock
                      label="Poll title"
                      error={errors.title?.message}
                      icon={<FilePlus2 className="size-4" />}
                    >
                      <Input
                        aria-invalid={Boolean(errors.title)}
                        className="h-12 border-white/10 bg-zinc-950/70 pl-12 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:border-cyan-400/60 focus-visible:ring-cyan-400/20"
                        placeholder="Weekly product feedback pulse"
                        {...register('title', {
                          required: 'Poll title is required',
                          minLength: {
                            value: 3,
                            message: 'Title must be at least 3 characters long',
                          },
                          maxLength: {
                            value: 255,
                            message: 'Title must be 255 characters or fewer',
                          },
                          validate: (value) =>
                            value.trim().length >= 3 ||
                            'Title must be at least 3 characters long',
                        })}
                      />
                    </FormBlock>

                    <FormBlock
                      label="Expires at"
                      error={errors.expiresAt?.message}
                      icon={<CalendarClock className="size-4" />}
                    >
                      <input
                        type="hidden"
                        {...register('expiresAt', {
                          required: 'Expiry date and time are required',
                          validate: (value) =>
                            new Date(value).getTime() > Date.now() ||
                            'Expiry date must be in the future',
                        })}
                      />
                      <DateTimePicker24h
                        value={selectedExpiryAt}
                        min={minExpiryAt}
                        onChange={(value) =>
                          setValue('expiresAt', value, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          })
                        }
                        className="pl-12"
                      />
                    </FormBlock>
                  </div>

                  <FormBlock
                    label="Description"
                    error={errors.description?.message}
                    icon={<CircleHelp className="size-4" />}
                  >
                    <textarea
                      aria-invalid={Boolean(errors.description)}
                      className="min-h-32 w-full border border-white/10 bg-zinc-950/70 px-4 py-3 pl-12 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-400/60 focus:outline-none focus:ring-4 focus:ring-cyan-400/20"
                      maxLength={2000}
                      placeholder="Tell participants what this poll is about and what kind of feedback you want."
                      {...register('description', {
                        maxLength: {
                          value: 2000,
                          message:
                            'Description must be 2000 characters or fewer',
                        },
                      })}
                    />
                  </FormBlock>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-200 sm:text-sm">
                        Poll visibility
                      </p>
                      <p className="text-sm leading-6 text-zinc-400">
                        Choose how people are allowed to respond.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {(
                        Object.entries(responseModeCopy) as Array<
                          [
                            ResponseModeValue,
                            (typeof responseModeCopy)[ResponseModeValue],
                          ]
                        >
                      ).map(([value, config]) => {
                        const Icon = config.icon

                        return (
                          <label
                            key={value}
                            className={`cursor-pointer border p-4 transition ${
                              selectedResponseMode === value
                                ? 'border-cyan-300 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(103,232,249,0.2)]'
                                : 'border-white/10 bg-zinc-950/55 hover:border-cyan-400/30'
                            }`}
                            onClick={() =>
                              setValue('responseMode', value, {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              })
                            }
                          >
                            <input
                              className="sr-only"
                              checked={selectedResponseMode === value}
                              type="radio"
                              value={value}
                              {...register('responseMode', {
                                required: 'Choose a poll visibility option',
                              })}
                            />
                            <div className="flex items-start gap-3">
                              <div
                                className={`inline-flex size-10 items-center justify-center border text-cyan-300 ${
                                  selectedResponseMode === value
                                    ? 'border-cyan-300/40 bg-cyan-400/20'
                                    : 'border-cyan-400/20 bg-cyan-400/10'
                                }`}
                              >
                                <Icon className="size-5" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-white">
                                    {config.label}
                                  </p>
                                  {selectedResponseMode === value ? (
                                    <span className="border border-cyan-300/30 bg-cyan-400/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-cyan-200">
                                      Selected
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-sm leading-6 text-zinc-400">
                                  {config.description}
                                </p>
                              </div>
                            </div>
                          </label>
                        )
                      })}
                    </div>

                    <p className="min-h-5 text-xs leading-5 text-red-300 sm:text-sm">
                      {errors.responseMode?.message || ''}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-heading text-xs uppercase tracking-[0.14em] text-cyan-300">
                          Questions
                        </p>
                        <p className="mt-1 text-sm leading-6 text-zinc-300">
                          Add at least one question. Each question needs two or
                          more options.
                        </p>
                      </div>

                      <Button
                        className="border-cyan-400/25 bg-cyan-400/5 text-cyan-200 hover:bg-cyan-400/10"
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={() => appendQuestion(createQuestion())}
                      >
                        <Plus className="size-4" />
                        Add question
                      </Button>
                    </div>

                    {typeof errors.questions?.message === 'string' ? (
                      <p className="text-sm text-red-300">
                        {errors.questions.message}
                      </p>
                    ) : null}

                    <div className="space-y-4">
                      {questionFields.map((questionField, questionIndex) => (
                        <QuestionEditor
                          key={questionField.id}
                          canRemove={questionFields.length > 1}
                          control={control}
                          errors={errors}
                          index={questionIndex}
                          register={register}
                          removeQuestion={removeQuestion}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm leading-6 text-zinc-300">
                      When you create this poll, it will be saved with the
                      current authenticated user as the creator.
                    </p>

                    <Button
                      className="pixel-hover-button group border border-cyan-300 bg-cyan-400 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-950 hover:bg-cyan-300"
                      disabled={isSubmitting}
                      type="submit"
                    >
                      {isSubmitting ? 'Creating poll...' : 'Create poll'}
                      <ArrowRight className="pixel-hover-arrow size-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border border-white/10 bg-zinc-900/75 backdrop-blur-xl">
              <CardHeader className="space-y-3 px-4 pt-4 sm:px-6 sm:pt-6">
                <div className="inline-flex size-12 items-center justify-center border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                  <CircleHelp className="size-6" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="font-heading text-base leading-relaxed text-white sm:text-lg">
                    Builder rules
                  </CardTitle>
                  <CardDescription className="text-sm leading-6 text-zinc-400">
                    A quick guide based on the backend validation rules.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6">
                <GuideTile
                  title="Poll basics"
                  value="Title must be at least 3 characters. Description is optional."
                />
                <GuideTile
                  title="Visibility"
                  value="Private means authenticated responders only. Public means anonymous responders are allowed."
                />
                <GuideTile
                  title="Questions"
                  value="You can add 1 to 20 questions, and every question needs at least 2 options."
                />
                <GuideTile
                  title="Expiry"
                  value="The poll expiry date must always be set to a future time."
                />
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
            <AlertDialogTitle>Poll creation failed</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              {errorMessage ||
                'We could not create your poll. Please review the form and try again.'}
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

function QuestionEditor({
  control,
  register,
  errors,
  index,
  canRemove,
  removeQuestion,
}: {
  control: ReturnType<typeof useForm<PollCreateFormValues>>['control']
  register: ReturnType<typeof useForm<PollCreateFormValues>>['register']
  errors: ReturnType<
    typeof useForm<PollCreateFormValues>
  >['formState']['errors']
  index: number
  canRemove: boolean
  removeQuestion: (index: number) => void
}) {
  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: `questions.${index}.options`,
  })

  const questionError = errors.questions?.[index]

  return (
    <Card className="border border-white/10 bg-zinc-950/55">
      <CardHeader className="space-y-3 px-4 pt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg text-white">
              Question {index + 1}
            </CardTitle>
            <CardDescription className="text-sm leading-6 text-zinc-400">
              Write a clear prompt and the answer choices people can pick from.
            </CardDescription>
          </div>

          <Button
            className="border-red-400/25 bg-red-400/5 text-red-200 hover:bg-red-400/10"
            disabled={!canRemove}
            size="sm"
            type="button"
            variant="outline"
            onClick={() => removeQuestion(index)}
          >
            <Trash2 className="size-4" />
            Remove
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4 pb-4">
        <FormBlock
          label="Question text"
          error={questionError?.question?.message}
          icon={<CircleHelp className="size-4" />}
        >
          <Input
            aria-invalid={Boolean(questionError?.question)}
            className="h-12 border-white/10 bg-zinc-950/70 pl-12 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:border-cyan-400/60 focus-visible:ring-cyan-400/20"
            placeholder="What should we improve in this sprint?"
            {...register(`questions.${index}.question`, {
              required: 'Question text is required',
              minLength: {
                value: 3,
                message: 'Question must be at least 3 characters long',
              },
              validate: (value) =>
                value.trim().length >= 3 ||
                'Question must be at least 3 characters long',
            })}
          />
        </FormBlock>

        <label className="flex items-center gap-3 border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-200">
          <input
            className="size-4 accent-cyan-400"
            type="checkbox"
            {...register(`questions.${index}.required`)}
          />
          Mark this question as required
        </label>

        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-200 sm:text-sm">
                Options
              </p>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                Add between 2 and 10 answer options.
              </p>
            </div>

            <Button
              className="border-cyan-400/25 bg-cyan-400/5 text-cyan-200 hover:bg-cyan-400/10"
              disabled={optionFields.length >= 10}
              size="sm"
              type="button"
              variant="outline"
              onClick={() => appendOption({ value: '' })}
            >
              <Plus className="size-4" />
              Add option
            </Button>
          </div>

          <div className="space-y-3">
            {optionFields.map((optionField, optionIndex) => (
              <div key={optionField.id}>
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-white/8 bg-white/3 text-sm text-zinc-400">
                    {optionIndex + 1}
                  </div>
                  <div className="flex-1">
                    <Input
                      aria-invalid={Boolean(
                        questionError?.options?.[optionIndex]?.value,
                      )}
                      className="h-12 border-white/10 bg-zinc-950/70 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:border-cyan-400/60 focus-visible:ring-cyan-400/20"
                      placeholder={`Option ${optionIndex + 1}`}
                      {...register(
                        `questions.${index}.options.${optionIndex}.value`,
                        {
                          required: 'Option cannot be empty',
                          validate: (value) =>
                            value.trim().length > 0 || 'Option cannot be empty',
                        },
                      )}
                    />
                  </div>
                  <Button
                    className="border-red-400/25 bg-red-400/5 text-red-200 hover:bg-red-400/10"
                    disabled={optionFields.length <= 2}
                    size="icon"
                    type="button"
                    variant="outline"
                    onClick={() => removeOption(optionIndex)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <p className="mt-1 min-h-5 pl-15 text-xs leading-5 text-red-300 sm:text-sm">
                  {questionError?.options?.[optionIndex]?.value?.message || ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FormBlock({
  label,
  error,
  icon,
  children,
}: {
  label: string
  error?: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-2">
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

function GuideTile({ title, value }: { title: string; value: string }) {
  return (
    <div className="border border-white/10 bg-zinc-950/55 p-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-400">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-zinc-200">{value}</p>
    </div>
  )
}

function createQuestion() {
  return {
    question: '',
    required: true,
    options: [{ value: '' }, { value: '' }],
  }
}

function getMinDateTime() {
  return toDateTimeLocalValue(new Date(Date.now() + 5 * 60 * 1000))
}

function getDefaultExpiryDateTime() {
  return toDateTimeLocalValue(new Date(Date.now() + 24 * 60 * 60 * 1000))
}

function toDateTimeLocalValue(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16)
}
