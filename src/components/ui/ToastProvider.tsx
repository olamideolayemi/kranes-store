import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { ToastMessage, ToastType } from '../../types/models'
import ToastContext from './ToastContext'

interface ToastProviderProps {
  children: ReactNode
}

function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = crypto.randomUUID()
      setToasts((current) => [...current, { id, message, type }])

      setTimeout(() => {
        removeToast(id)
      }, 2500)
    },
    [removeToast],
  )

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      removeToast,
    }),
    [toasts, showToast, removeToast],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export default ToastProvider
