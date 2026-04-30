import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', border: '1px solid #cc0000', borderRadius: '8px', margin: '2rem' }}>
          <h2 style={{ color: '#cc0000', marginBottom: '1rem' }}>Something went wrong.</h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>The application encountered an unexpected error.</p>
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', textAlign: 'left', overflowX: 'auto', fontSize: '0.8em' }}>
            {this.state.errorMsg}
          </pre>
          <div style={{ textAlign: 'left', marginTop: '1.5rem' }}>
            <p style={{ fontWeight: 'bold' }}>Troubleshooting steps:</p>
            <ul style={{ fontSize: '0.9em', color: '#555', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Check your internet connection.</li>
              <li>Refresh the page to clear temporary glitches.</li>
              <li>If you're using a restrictive network (like a VPN or corporate firewall), some API calls might be blocked.</li>
              <li>This experimental service might temporarily run into an unexpected state or rate limit. Reloading usually fixes it!</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '2rem', padding: '0.75rem 1.5rem', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
