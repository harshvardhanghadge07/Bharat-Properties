import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <h1 style={{ fontSize: '8rem', fontWeight: 800, margin: 0, lineHeight: 1, color: 'var(--accent, #f97316)' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 600, margin: '1rem 0 0.5rem' }}>
        Page Not Found
      </h2>
      <p style={{ color: '#6b7280', maxWidth: 400, marginBottom: '2rem' }}>
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          to="/"
          style={{
            padding: '0.65rem 1.5rem',
            background: 'var(--accent, #f97316)',
            color: '#fff',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Go Home
        </Link>
        <Link
          to="/properties"
          style={{
            padding: '0.65rem 1.5rem',
            border: '2px solid var(--accent, #f97316)',
            color: 'var(--accent, #f97316)',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Browse Properties
        </Link>
      </div>
    </div>
  )
}
