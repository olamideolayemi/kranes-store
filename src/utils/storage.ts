export const STORAGE_KEYS = {
  cart: 'kranes_cart',
  wishlist: 'kranes_wishlist',
  authToken: 'kranes_auth_token',
} as const

export const loadJSON = <T>(key: string, fallbackValue: T): T => {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallbackValue
  } catch (error) {
    console.error(`Failed to read ${key} from localStorage`, error)
    return fallbackValue
  }
}

export const saveJSON = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage`, error)
  }
}

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.authToken)
  } catch {
    return null
  }
}

export const setAuthToken = (token: string | null): void => {
  try {
    if (!token) {
      localStorage.removeItem(STORAGE_KEYS.authToken)
      return
    }

    localStorage.setItem(STORAGE_KEYS.authToken, token)
  } catch {
    // ignore storage errors in auth token helper
  }
}
