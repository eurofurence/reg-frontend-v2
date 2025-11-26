import { captureException } from '@sentry/react'
import type { ReactNode } from 'react'
import { Component } from 'react'
import ErrorReport from './ErrorReport'

interface ErrorBoundaryProps {
  children: ReactNode
  operation?: string
}

interface ErrorBoundaryState {
  error?: Error
  componentStack?: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {}

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    captureException(error, {
      level: 'error',
      tags: { flow: 'ui', step: this.props.operation ?? 'unknown' },
      extra: { componentStack: info.componentStack },
    })

    this.setState({ componentStack: info.componentStack ?? undefined })
  }

  private handleRetry = () => {
    this.setState({ error: undefined, componentStack: undefined })
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorReport
          operation={this.props.operation}
          category="frontend"
          code="unknown"
          message={this.state.error.message}
          details={this.state.componentStack ?? this.state.error.stack}
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
