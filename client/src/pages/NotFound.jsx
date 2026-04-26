import { Link } from 'react-router-dom';

/**
 * NotFound — 404 page
 * Rendered by the catch-all route at the bottom of App.jsx.
 */
function NotFound() {
  return (
    <div className="container">
      <div style={{
        maxWidth: 520,
        margin: '80px auto',
        textAlign: 'center',
        background: 'var(--card-bg)',
        borderRadius: 'var(--radius-lg)',
        padding: '56px 40px',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          fontSize: '6rem',
          fontWeight: 800,
          lineHeight: 1,
          background: 'linear-gradient(135deg, var(--primary), var(--staff))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 8,
        }}>
          404
        </div>

        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 16 }}>🔍</span>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 10, color: 'var(--text)' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.7 }}>
          Looks like this item went missing! The page you're looking for
          doesn't exist or may have been moved.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{
            background: 'var(--primary)', color: '#fff', padding: '11px 24px',
            borderRadius: 'var(--radius-sm)', textDecoration: 'none',
            fontWeight: 600, fontSize: '0.9rem', transition: 'background 0.2s',
          }}>
            🏠 Back to Home
          </Link>
          <Link to="/browse" style={{
            background: 'var(--bg)', color: 'var(--text)',
            border: '1.5px solid var(--border)', padding: '11px 24px',
            borderRadius: 'var(--radius-sm)', textDecoration: 'none',
            fontWeight: 600, fontSize: '0.9rem', transition: 'background 0.2s',
          }}>
            🔎 Browse Items
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
