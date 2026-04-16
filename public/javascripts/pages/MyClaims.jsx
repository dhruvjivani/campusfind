const { useState, useEffect } = React;

function MyClaims({ onNavigate }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getMyClaims();
      setClaims(response.data || []);
    } catch (err) {
      setError('Failed to load claims. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const map = { pending: 'pending', verified: 'found', rejected: 'lost', completed: 'claimed' };
    return map[status] || 'pending';
  };

  return (
    <div className="container">
      <h2>My Claims</h2>
      <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
        Track the status of items you have claimed.
      </p>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="loading"><div className="spinner"></div><p>Loading your claims...</p></div>
      ) : claims.length === 0 ? (
        <div className="empty-state">
          <p>You haven't submitted any claims yet.</p>
          <button onClick={() => onNavigate('browse')} style={{ marginTop: '1rem' }}>
            Browse Items to Claim
          </button>
        </div>
      ) : (
        <div className="grid">
          {claims.map(claim => (
            <div key={claim.id} className="card">
              {claim.item_image && (
                <img
                  src={claim.item_image}
                  alt={claim.item_title || 'Item'}
                  className="card-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div className="card-header">
                <h3 className="card-title">{claim.item_title || 'Item'}</h3>
                <span className={`badge ${getStatusClass(claim.status)}`}>
                  {claim.status.toUpperCase()}
                </span>
              </div>
              {claim.verification_notes && (
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Your notes:</strong> {claim.verification_notes}
                </p>
              )}
              <div className="card-meta">
                <span>Submitted: {new Date(claim.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
