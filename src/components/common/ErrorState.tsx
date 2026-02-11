import Button from '../ui/Button'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="state-container">
      <h2>Could not load data</h2>
      <p>{message}</p>
      {onRetry ? <Button onClick={onRetry}>Try again</Button> : null}
    </div>
  )
}

export default ErrorState
