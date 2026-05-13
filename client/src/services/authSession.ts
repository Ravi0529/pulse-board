import { tokenStore } from './tokenStore'

export function isAuthenticated() {
  if (typeof window === 'undefined') return false

  return Boolean(tokenStore.getAccess() && tokenStore.getUser())
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null

  return tokenStore.getUser()
}
