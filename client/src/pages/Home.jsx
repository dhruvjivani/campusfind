import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

/**
 * Home — Landing / Dashboard page (route: /)
 * Props: user (object|null)
 */
function Home({ user }) {
  const navigate = useNavigate();

  const [stats, setStats] = useState({ total: 0, lost: 0, found: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [allRes, lostRes, foundRes] = await Promise.all([
          apiService.getItems({}),
          apiService.getItems({ status: 'lost' }),
          apiService.getItems({ status: 'found' }),
        ]);
        setStats({
          total: allRes.total   || 0,
          lost:  lostRes.total  || 0,
          found: foundRes.total || 0,
        });
      } catch {
        // Stats are non-critical; silently ignore errors
      }
    };
    loadStats();
  }, []);

  const isStaff = user && user.role === 'staff';

  return (
    <div className="container">

      {/* Hero */}
      <div className="hero">
        <span className="hero-icon">🔍</span>
        <h1>
          Lost something on <span>campus</span>?<br />
          We'll help you find it.
        </h1>
        <p>
          CampusFind connects students and staff to reunite lost items with their owners —
          fast, secure, and completely free.
        </p>

        <div className="hero-actions">
          <button className="hero-btn-primary" onClick={() => navigate('/browse')}>
            🔎 Browse Items
          </button>

          {user ? (
            <>
              <button className="hero-btn-secondary" onClick={() => navigate('/post')}>
                + Post an Item
              </button>
              {isStaff && (
                <button className="hero-btn-secondary" onClick={() => navigate('/staff')}>
                  🏛 Staff Panel
                </button>
              )}
            </>
          ) : (
            <button className="hero-btn-secondary" onClick={() => navigate('/register')}>
              🎓 Create Account
            </button>
          )}
        </div>

        {user && (
          <p style={{ marginTop: 24, fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
            Welcome back,{' '}
            <strong style={{ color: '#93c5fd' }}>{user.first_name || user.email}</strong>
            {isStaff && <span className="badge staff" style={{ marginLeft: 8 }}>🏛 Staff</span>}
          </p>
        )}
      </div>

      {/* Live Stats */}
      <div className="grid-3" style={{ marginBottom: 32 }}>
        <div className="stat-card blue">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">📦 Total Items Listed</div>
        </div>
        <div className="stat-card red">
          <div className="stat-number">{stats.lost}</div>
          <div className="stat-label">🔴 Items Reported Lost</div>
        </div>
        <div className="stat-card green">
          <div className="stat-number">{stats.found}</div>
          <div className="stat-label">🟢 Items Found &amp; Listed</div>
        </div>
      </div>

      {/* How it works */}
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16 }}>How it works</h2>
      <div className="features-grid" style={{ marginBottom: 32 }}>
        <div className="feature-card">
          <div className="feature-icon blue">🔎</div>
          <h3>Browse &amp; Search</h3>
          <p>Filter items by category, status, campus, or keyword. Find your missing item fast.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon green">📦</div>
          <h3>Post Items</h3>
          <p>Report something you lost or found. Add photos, location, and a detailed description.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon purple">✅</div>
          <h3>Claim &amp; Verify</h3>
          <p>Submit a claim with proof of ownership. Staff review and approve claims securely.</p>
        </div>
      </div>

      {/* Guest CTA */}
      {!user && (
        <div className="card" style={{
          textAlign: 'center', padding: '40px 24px',
          background: 'linear-gradient(135deg, var(--primary-light), var(--staff-light))',
        }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: 10 }}>Ready to get started?</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
            Create a free account to post items, submit claims, and track your requests.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="success" onClick={() => navigate('/register')}>
              🎓 Register as Student
            </button>
            <button className="btn-secondary" onClick={() => navigate('/login')}>
              Already have an account? Sign In
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Home;
