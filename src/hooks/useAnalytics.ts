import { analyticsApi } from '../services/api'
import { useCallback } from 'react'

const SESSION_KEY = 'kranes_session_id'

const getSessionId = (): string => {
  const existing = localStorage.getItem(SESSION_KEY)
  if (existing) {
    return existing
  }

  const generated = crypto.randomUUID()
  localStorage.setItem(SESSION_KEY, generated)
  return generated
}

export const useAnalytics = () => {
  const track = useCallback((eventType: string, metadata?: Record<string, unknown>) => {
    void analyticsApi.track({
      eventType,
      metadata,
      sessionId: getSessionId(),
    })
  }, [])

  return { track }
}
