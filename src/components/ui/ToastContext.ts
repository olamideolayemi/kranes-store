import { createContext } from 'react'
import type { ToastMessage, ToastType } from '../../types/models'

export interface ToastContextValue {
  toasts: ToastMessage[]
  showToast: (message: string, type?: ToastType) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export default ToastContext
