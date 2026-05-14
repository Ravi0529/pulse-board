import axios from 'axios'

import { api } from './api'

export interface SubmitPollAnswerInput {
  questionId: string
  optionId: string
}

export interface SubmitPollResponseInput {
  anonymousIdentifier?: string
  answers: SubmitPollAnswerInput[]
}

export interface PollResponseRecord {
  id: string
  pollId: string
  userId?: string | null
  anonymousIdentifier?: string | null
  submittedAt: string
}

interface SubmitPollResponseApiResponse {
  message: string
  response: PollResponseRecord
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

export const responseService = {
  async submitPollResponse(
    pollId: string,
    input: SubmitPollResponseInput,
  ): Promise<PollResponseRecord> {
    try {
      const { data } = await api.post<SubmitPollResponseApiResponse>(
        `/responses/${pollId}/respond`,
        input,
      )

      return data.response
    } catch (error) {
      throw toApiError(error)
    }
  },
}
