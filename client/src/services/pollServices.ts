import axios from 'axios'

import { api } from './api'

export type PollResponseMode = 'ANONYMOUS' | 'AUTHENTICATED'

export interface PollOption {
  id: string
  questionId: string
  text: string
  order: number
  createdAt?: string
  updatedAt?: string
}

export interface PollQuestion {
  id: string
  pollId: string
  question: string
  required: boolean
  order: number
  createdAt?: string
  updatedAt?: string
  options: PollOption[]
}

export interface Poll {
  id: string
  title: string
  description?: string | null
  creatorId: string
  creator?: {
    id: string
    username: string
    email: string
  } | null
  responseMode: PollResponseMode
  expiresAt: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
  questions: PollQuestion[]
  canVote?: boolean
  analyticsAvailable?: boolean
}

export interface CreatePollInput {
  title: string
  description?: string
  responseMode: PollResponseMode
  expiresAt: string
  questions: Array<{
    question: string
    required: boolean
    options: string[]
  }>
}

export interface UpdatePollInput {
  title?: string
  description?: string
  responseMode?: PollResponseMode
  expiresAt?: string
  questions?: Array<{
    question: string
    required: boolean
    options: string[]
  }>
}

interface PollResponse {
  poll: Poll
  message?: string
}

interface MyPollsResponse {
  polls: Poll[]
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

export const pollService = {
  async createPoll(input: CreatePollInput): Promise<Poll> {
    try {
      const { data } = await api.post<PollResponse>('/poll/create-poll', input)
      return data.poll
    } catch (error) {
      throw toApiError(error)
    }
  },

  async getMyPolls(): Promise<Poll[]> {
    try {
      const { data } = await api.get<MyPollsResponse>('/poll/my-polls')
      return data.polls
    } catch (error) {
      throw toApiError(error)
    }
  },

  async getPollById(pollId: string): Promise<Poll> {
    try {
      const { data } = await api.get<PollResponse>(`/poll/${pollId}`)
      return data.poll
    } catch (error) {
      throw toApiError(error)
    }
  },

  async updatePoll(pollId: string, input: UpdatePollInput): Promise<Poll> {
    try {
      const { data } = await api.put<PollResponse>(`/poll/${pollId}`, input)
      return data.poll
    } catch (error) {
      throw toApiError(error)
    }
  },

  async deletePoll(pollId: string): Promise<void> {
    try {
      await api.delete(`/poll/${pollId}`)
    } catch (error) {
      throw toApiError(error)
    }
  },

  async deletePollQuestion(pollId: string, questionId: string): Promise<Poll> {
    try {
      const { data } = await api.delete<PollResponse>(
        `/poll/${pollId}/questions/${questionId}`,
      )
      return data.poll
    } catch (error) {
      throw toApiError(error)
    }
  },

  async deleteQuestionOption(
    pollId: string,
    questionId: string,
    optionId: string,
  ): Promise<Poll> {
    try {
      const { data } = await api.delete<PollResponse>(
        `/poll/${pollId}/questions/${questionId}/options/${optionId}`,
      )
      return data.poll
    } catch (error) {
      throw toApiError(error)
    }
  },
}
