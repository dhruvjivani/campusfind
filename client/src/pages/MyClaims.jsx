import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../services/api';

/**
 * MyClaims — Student's claim tracker (route: /my-claims)
 * Protected route — login required.
 * Props: user (object)
 */
function MyClaims({ user }) {
  const navigate = useNavigate();

  const [claims,     setClaims]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [cancelling, setCancelling] = useState({});

  useEffect(() => { loadClaims(); }, []);

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

  const handleCancel = async (claimId) => {
    if (!window.confirm('Cancel this claim?')) return;
    setCancelling(prev => ({ ...prev, [claimId]: true }));
    try {
      await apiService.deleteClaim(claimId);
      setClaims(prev => prev.filter(c => c.id !== claimId));
    } catch (err) {
      setError(err.message || 'Failed to cancel claim.');
    } finally {
      setCancelling(prev => ({ ...prev, [claimId]: false }));
    }
  };

  const statusIcon = { pending: '⏳', verified: '✅', rejected: '❌', completed: '🏁' };
  const statusNote = {
    pending:   'Your claim is under review by staff.',
    verified:  'Claim approved — please contact staff to arrange pickup.',
    rejected:  'Your claim was not approved. Contact staff for more info.',
    completed: 'Item has been returned to you.',
  };

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
          <button onClick={() => navigate('/browse')}>Browse Items</button>
        </div>
      ) : (
        <div className="grid">
          {claims.map(claim => (
            <div key={claim.id} className="card">
              {claim.item_image && (
                <img
                  src={claim.item_image} alt={claim.item_title || 'Item'}
                  className="card-image"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}

              <div className="card-header">
                <h3 className="card-title">{claim.item_title || 'Item'}</h3>
                <span className={`badge ${claim.status}`}>
                  {statusIcon[claim.status] || '⏳'}{' '}
                  {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                </span>
              </div>

              {statusNote[claim.status] && (
                <div className={`alert ${
                  claim.status === 'verified' || claim.status === 'completed' ? 'success'
                  : claim.status === 'rejected' ? 'error' : 'info'
                }`} style={{ marginBottom: 10 }}>
                  {statusNote[claim.status]}
                </div>
              )}

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

              <div className="card-actions">
                {claim.item_id && (
                  <Link to={`/items/${claim.item_id}`} style={{ flex: 1, textDecoration: 'none' }}>
                    <button className="btn-secondary" style={{ width: '100%' }}>View Item</button>
                  </Link>
                )}
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

export default MyClaims;
