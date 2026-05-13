import axios from 'axios'

import { api } from './api'
import { tokenStore } from './tokenStore'
import type { AuthUser } from './tokenStore'

interface RegisterInput {
  email: string
  password: string
  username: string
}

interface LoginInput {
  email: string
  password: string
}

interface RegisterResponse {
  message: string
  user: AuthUser
}

interface LoginResponse {
  message: string
  token: string
}

interface CurrentUserResponse {
  user: AuthUser
}

interface ErrorResponse {
  error?: string
  message?: string
}

function toApiError(error: unknown): Error {
  if (axios.isAxiosError<ErrorResponse>(error)) {
    const message =
      error.response?.data.error ||
      error.response?.data.message ||
      error.message

    return new Error(message)
  }

  if (error instanceof Error) {
    return error
  }

  return new Error('Something went wrong. Please try again.')
}

export const authService = {
  async signup({
    email,
    password,
    username,
  }: RegisterInput): Promise<AuthUser> {
    try {
      const { data } = await api.post<RegisterResponse>('/auth/signup', {
        email,
        password,
        username,
      })

      tokenStore.set({ user: data.user })
      return data.user
    } catch (error) {
      throw toApiError(error)
    }
  },

  async login({
    email,
    password,
  }: LoginInput): Promise<{ accessToken: string; user: AuthUser }> {
    try {
      const { data } = await api.post<LoginResponse>('/auth/signin', {
        email,
        password,
      })
      tokenStore.set({ accessToken: data.token })

      const currentUser = await api.get<CurrentUserResponse>('/auth/me')
      tokenStore.set({ accessToken: data.token, user: currentUser.data.user })

      return {
        accessToken: data.token,
        user: currentUser.data.user,
      }
    } catch (error) {
      throw toApiError(error)
    }
  },

  async currentUser(): Promise<AuthUser> {
    try {
      const { data } = await api.get<CurrentUserResponse>('/auth/me')
      return data.user
    } catch (error) {
      throw toApiError(error)
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout')
      tokenStore.clear()
    } catch (error) {
      throw toApiError(error)
    }
  },
}
