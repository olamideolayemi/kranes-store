import { useContext } from 'react'
import type { ToastContextValue } from '../components/ui/ToastContext'
import ToastContext from '../components/ui/ToastContext'

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return context
}
