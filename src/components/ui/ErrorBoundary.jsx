import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-kb-ivory)' }}>
          <div className="text-center px-6 max-w-md">
            <div style={{ width: '48px', height: '1px', background: 'rgba(212,120,138,0.4)', margin: '0 auto 2rem' }} />
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 300, fontStyle: 'italic', color: 'var(--color-kb-rose)', marginBottom: '0.5rem' }}>
              Algo salió mal
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--color-kb-mauve)', marginBottom: '2rem', lineHeight: 1.6 }}>
              Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
              className="btn-kb-ghost"
              style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
