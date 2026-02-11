import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Application error', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="state-container">
          <h1>Something went wrong</h1>
          <p>Please refresh the page and try again.</p>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
