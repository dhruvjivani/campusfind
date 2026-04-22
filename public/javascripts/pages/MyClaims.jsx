/**
 * MyClaims.jsx — Student's claim tracker  (route: /my-claims)
 *
 * Protected route — user must be logged in.
 *
 * Features:
 *  • Lists all claims submitted by the current user
 *  • Status badge + contextual info message per claim
 *  • Cancel button for pending claims (DELETE /api/claims/:id)
 *  • Link to the original item's detail page
 */

const { useState, useEffect } = React;
const { useHistory, Link }    = ReactRouterDOM;

/**
 * MyClaims component
 * @param {{ user: object }} props - Authenticated user (guaranteed by PrivateRoute)
 */
function MyClaims({ user }) {
  const history = useHistory();

  /* ── State ───────────────────────────────────────────────────────────────── */
  const [claims,     setClaims]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [cancelling, setCancelling] = useState({}); // { [claimId]: boolean }

  /* Load claims on mount */
  useEffect(() => { loadClaims(); }, []);

  /** Fetches GET /api/claims/user/my-claims */
  const loadClaims = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getMyClaims();
      setClaims(response.data || []);
    } catch {
      setError('Failed to load claims. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancels a pending claim via DELETE /api/claims/:id
   * Updates local state immediately after success (no full re-fetch needed).
   * @param {number} claimId
   */
  const handleCancel = async (claimId) => {
    if (!window.confirm('Cancel this claim?')) return;
    setCancelling(prev => ({ ...prev, [claimId]: true }));
    try {
      await apiService.deleteClaim(claimId);
      setClaims(prev => prev.filter(c => c.id !== claimId)); // optimistic removal
    } catch (err) {
      setError(err.message || 'Failed to cancel claim.');
    } finally {
      setCancelling(prev => ({ ...prev, [claimId]: false }));
    }
  };

  /** Maps claim status to a status icon */
  const statusIcon = { pending: '⏳', verified: '✅', rejected: '❌', completed: '🏁' };

  /** Contextual message shown below each claim's badge */
  const statusNote = {
    pending:   'Your claim is under review by staff.',
    verified:  'Claim approved — please contact staff to arrange pickup.',
    rejected:  'Your claim was not approved. Contact staff for more info.',
    completed: 'Item has been returned to you.',
  };

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <div className="container">

      <div className="page-header">
        <h2>My Claims</h2>
        <p>Track the status of items you have submitted claims for.</p>
      </div>

      {error && <div className="alert error">⚠️ {error}</div>}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your claims…</p>
        </div>
      ) : claims.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📋</span>
          <h3>No claims yet</h3>
          <p>Browse items to find something that belongs to you, then submit a claim.</p>
          <button onClick={() => history.push('/browse')}>Browse Items</button>
        </div>
      ) : (
        <div className="grid">
          {claims.map(claim => (
            <div key={claim.id} className="card">
              {/* Item thumbnail */}
              {claim.item_image && (
                <img
                  src={claim.item_image} alt={claim.item_title || 'Item'}
                  className="card-image"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}

              {/* Title + status badge */}
              <div className="card-header">
                <h3 className="card-title">{claim.item_title || 'Item'}</h3>
                <span className={`badge ${claim.status}`}>
                  {statusIcon[claim.status] || '⏳'}{' '}
                  {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                </span>
              </div>

              {/* Status message */}
              {statusNote[claim.status] && (
                <div className={`alert ${
                  claim.status === 'verified' || claim.status === 'completed' ? 'success'
                  : claim.status === 'rejected' ? 'error' : 'info'
                }`} style={{ marginBottom: 10 }}>
                  {statusNote[claim.status]}
                </div>
              )}

              {/* User's submitted notes */}
              {claim.verification_notes && (
                <div style={{
                  background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px', marginBottom: 10, fontSize: '0.87rem',
                }}>
                  <strong>Your submission:</strong><br />
                  <span style={{ color: 'var(--text-muted)' }}>{claim.verification_notes}</span>
                </div>
              )}

              <div className="card-meta">
                <span className="card-meta-item">
                  📅 Submitted {new Date(claim.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Action buttons */}
              <div className="card-actions">
                {claim.item_id && (
                  <Link to={`/items/${claim.item_id}`} style={{ flex: 1, textDecoration: 'none' }}>
                    <button className="btn-secondary" style={{ width: '100%' }}>View Item</button>
                  </Link>
                )}
                {/* Cancel only allowed on pending claims */}
                {claim.status === 'pending' && (
                  <button
                    className="danger"
                    disabled={cancelling[claim.id]}
                    onClick={() => handleCancel(claim.id)}
                  >
                    {cancelling[claim.id] ? '…' : '🗑 Cancel'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
