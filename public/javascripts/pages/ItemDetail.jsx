const { useState, useEffect } = React;

function ItemDetail({ itemId, onNavigate, user }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');

  useEffect(() => { loadItem(); }, [itemId]);

  const loadItem = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getItemById(itemId);
      setItem(response.data);
    } catch (err) {
      setError('Could not load item. It may have been removed.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading"><div className="spinner"></div><p>Loading item...</p></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container">
        <div className="alert error">⚠️ {error || 'Item not found.'}</div>
        <button className="btn-secondary" onClick={() => onNavigate('browse')}>← Back to Browse</button>
      </div>
    );
  }

  const isStaff = user && user.role === 'staff';
  const canClaim = user && item.status !== 'claimed' && item.user_id !== user.id && !isStaff;
  const statusIcon = item.status === 'lost' ? '🔴' : item.status === 'found' ? '🟢' : '✅';

  return (
    <div className="container">
      <button className="btn-secondary" onClick={() => onNavigate('browse')} style={{ marginBottom: 20 }}>
        ← Back to Browse
      </button>

      <div className="item-detail-card">
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.title}
            className="item-detail-image"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}

        <div className="item-detail-body">
          <div className="card-header">
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>{item.title}</h2>
            <span className={`badge ${item.status}`}>
              {statusIcon} {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
          </div>

          <p style={{ color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.7 }}>{item.description}</p>

          <div className="item-meta-grid">
            <div className="item-meta-field">
              <label>Category</label>
              <p>🏷 {item.category}</p>
            </div>
            <div className="item-meta-field">
              <label>Location</label>
              <p>📍 {item.location_found}</p>
            </div>
            <div className="item-meta-field">
              <label>Campus</label>
              <p>🏫 {item.campus}</p>
            </div>
            <div className="item-meta-field">
              <label>Date Posted</label>
              <p>📅 {new Date(item.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            {item.first_name && (
              <div className="item-meta-field">
                <label>Posted By</label>
                <p>👤 {item.first_name} {item.last_name}</p>
              </div>
            )}
          </div>

          {claimSuccess && <div className="alert success">✅ {claimSuccess}</div>}

          {/* Claim CTA */}
          {canClaim && (
            <button className="success btn-full" onClick={() => setShowClaimForm(true)}>
              ✋ Claim This Item
            </button>
          )}

          {!user && (
            <div className="alert info">
              <span>ℹ️</span>
              <span>
                <button
                  onClick={() => onNavigate('login')}
                  style={{ background: 'none', textDecoration: 'underline', cursor: 'pointer', color: 'inherit', border: 'none', padding: 0, fontWeight: 600 }}
                >
                  Sign in
                </button>
                {' '}to claim this item.
              </span>
            </div>
          )}

          {item.status === 'claimed' && (
            <div className="alert info">✅ This item has already been claimed.</div>
          )}

          {user && item.user_id === user.id && (
            <div className="alert warning">📝 This is your own listing.</div>
          )}

          {isStaff && item.status !== 'claimed' && (
            <div className="alert warning">🏛 Staff view — use the Staff Panel to manage this item's claims.</div>
          )}
        </div>
      </div>

      {showClaimForm && (
        <ClaimItem
          itemId={itemId}
          onClose={() => setShowClaimForm(false)}
          onClaimSuccess={() => {
            setShowClaimForm(false);
            setClaimSuccess('Claim submitted! Staff will review it and get back to you.');
            loadItem();
          }}
        />
      )}
    </div>
  );
}
