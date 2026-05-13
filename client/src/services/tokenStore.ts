const ACCESS_KEY = import.meta.env.VITE_ACCESS_KEY
const USER_KEY = import.meta.env.VITE_USER_KEY

export interface AuthUser {
  id: string
  username: string
  email: string
  createdAt?: string | null
}

export interface TokenStorePayload {
  accessToken?: string | null
  user?: AuthUser | null
}

function getStorage() {
  if (typeof window === 'undefined') return null

  return window.localStorage
}

export const tokenStore = {
  getAccess: () => getStorage()?.getItem(ACCESS_KEY) || null,
  getUser: (): AuthUser | null => {
    const storage = getStorage()
    const raw = storage?.getItem(USER_KEY)
    if (!raw) return null

    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      storage?.removeItem(USER_KEY)
      return null
    }
  },

  set: ({ accessToken, user }: TokenStorePayload) => {
    const storage = getStorage()
    if (!storage) return

    if (accessToken) storage.setItem(ACCESS_KEY, accessToken)
    if (user) storage.setItem(USER_KEY, JSON.stringify(user))
  },

  clear: () => {
    const storage = getStorage()
    if (!storage) return

    storage.removeItem(ACCESS_KEY)
    storage.removeItem(USER_KEY)
  },
}
