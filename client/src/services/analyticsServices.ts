import axios from 'axios'

import { api } from './api'

export interface PollAnalyticsOption {
  optionId: string
  text: string
  votes: number
  percentage: number
}

export interface PollAnalyticsQuestion {
  questionId: string
  question: string
  required: boolean
  options: PollAnalyticsOption[]
}

export interface PollAnalytics {
  pollId: string
  title: string
  totalResponses: number
  isPublished: boolean
  expiresAt: string
  questions: PollAnalyticsQuestion[]
}

interface ErrorResponse {
  error?: string | { formErrors?: string[] }
  message?: string
}

function toApiError(error: unknown): Error {
  if (axios.isAxiosError<ErrorResponse>(error)) {
    const payloadError = error.response?.data.error
    const formError =
      typeof payloadError === 'object' &&
      Array.isArray(payloadError.formErrors) &&
      payloadError.formErrors.length > 0
        ? payloadError.formErrors[0]
        : null

    const message =
      (typeof payloadError === 'string' ? payloadError : null) ||
      formError ||
      error.response?.data.message ||
      error.message

    return new Error(message)
  }

  if (error instanceof Error) {
    return error
  }

  return new Error('Something went wrong. Please try again.')
}

export const analyticsService = {
  async getPollAnalytics(pollId: string): Promise<PollAnalytics> {
    try {
      const { data } = await api.get<PollAnalytics>(`/analytics/${pollId}`)
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },
}
