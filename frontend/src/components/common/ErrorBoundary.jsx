import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-slate-800">
            Something went wrong
          </h2>
          <p className="mb-4 max-w-md text-slate-600">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
          >
            Reload page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
