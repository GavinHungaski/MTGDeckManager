import { Component } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import './ErrorBoundary.css';

// Fallback UI component
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="error-boundary">
      <div className="error-boundary-content">
        <h2 className="error-boundary-title">Something went wrong</h2>
        <pre className="error-boundary-message">{error.message}</pre>
        <button 
          onClick={resetErrorBoundary}
          className="error-boundary-button"
          aria-label="Try again"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

// Error Boundary component wrapper
export const ErrorBoundary = ({ children, fallback }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || ErrorFallback}
      onReset={() => {
        // Reset any state that caused the error
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

// Class-based error boundary for more control
export class ClassErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    
    // You could send this to a service like Sentry
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div role="alert" className="error-boundary">
          <div className="error-boundary-content">
            <h2 className="error-boundary-title">Something went wrong</h2>
            <pre className="error-boundary-message">
              {this.state.error?.message || 'An unexpected error occurred'}
            </pre>
            <button 
              onClick={this.handleReset}
              className="error-boundary-button"
              aria-label="Try again"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;