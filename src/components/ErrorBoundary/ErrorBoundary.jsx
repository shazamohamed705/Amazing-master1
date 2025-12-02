import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Keep the error visible in development tools without crashing the UI
    console.error('[ErrorBoundary]', error, info);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
    if (typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (typeof fallback === 'function') {
        return fallback({
          error,
          resetErrorBoundary: this.resetErrorBoundary,
        });
      }

      if (fallback) {
        return fallback;
      }

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1F1F2C',
            color: '#fff',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            حدث خطأ غير متوقع
          </h1>
          <p style={{ color: '#ABB3BA', marginBottom: '1.5rem' }}>
            نحاول إصلاحه الآن، يرجى إعادة تحميل الصفحة.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#F7EC06',
              color: '#1F1F2C',
              border: 'none',
              borderRadius: '10px',
              padding: '0.75rem 1.5rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            إعادة التحميل
          </button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;

