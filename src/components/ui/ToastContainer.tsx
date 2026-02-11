import { useToast } from '../../hooks/useToast'

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
          type="button"
        >
          {toast.message}
        </button>
      ))}
    </div>
  )
}

export default ToastContainer
