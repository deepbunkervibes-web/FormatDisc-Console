/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  /**
   * Optional children to be rendered by the boundary.
   */
  children?: ReactNode;
}

interface State {
  /**
   * Whether an error has been captured by the boundary.
   */
  hasError: boolean;
  /**
   * The error object captured, if any.
   */
  error?: Error;
}

/**
 * ErrorBoundary component to catch runtime exceptions.
 * Explicitly extends Component with generic Props and State to ensure standard React component 
 * properties like state, props, and setState are correctly inherited.
 */
class ErrorBoundary extends Component<Props, State> {
  // Fix: Initialize state as a class property for robust type inference of `this.state`, `this.props`, and `this.setState`.
  state: State = {
    hasError: false,
    error: undefined
  };

  /**
   * Updates state so the next render shows the fallback UI when an error is caught.
   */
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * Logs error information for diagnostic purposes.
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Runtime error captured:", error, errorInfo);
  }
  
  /**
   * Resets the error state and reloads the application context.
   */
  public handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  }

  public render() {
    // Checking the current state for error indicators.
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback" role="alert" style={{ padding: '40px', textAlign: 'center', color: 'white', background: '#030305', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: '#ff4d4d', marginBottom: '16px' }}>System Exception Detected</h2>
          <p style={{ opacity: 0.6, maxWidth: '400px', marginBottom: '32px' }}>
            A runtime fault interrupted execution. The application state may be inconsistent.
          </p>
          <button 
            onClick={this.handleReset} 
            style={{ 
              background: '#00f2ff', 
              color: 'black', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '4px', 
              fontWeight: 'bold', 
              cursor: 'pointer' 
            }}
          >
            Reinitialize Application
          </button>
        </div>
      );
    }

    // Returning the children from the props inherited from Component.
    return this.props.children;
  }
}

export default ErrorBoundary;