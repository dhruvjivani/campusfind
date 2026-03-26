const { useState, useEffect } = React;

function ItemDetail({ itemId, onNavigate, user }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');
  useEffect(() => {
    loadItem();
  }, [itemId]);

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
        <div className="loading"><div className="spinner"></div><p>Loading...</p></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container">
        <div className="alert error">{error || 'Item not found.'}</div>
        <button onClick={() => onNavigate('browse')}>Back to Browse</button>
      </div>
    );
  }

  return (
    <div className="container">
      <button onClick={() => onNavigate('browse')} className="secondary" style={{ marginBottom: '1.5rem' }}>
        Back to Browse
      </button>

      <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.title}
            style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        <div className="card-header">
          <h2 className="card-title">{item.title}</h2>
          <span className={`badge ${item.status}`}>
            {item.status === 'lost' ? 'Lost' : item.status === 'found' ? 'Found' : 'Claimed'}
          </span>
        </div>

        <p style={{ marginBottom: '1.5rem', color: '#555' }}>{item.description}</p>

        <div className="card-meta" style={{ marginBottom: '1.5rem' }}>
          <span><strong>Category:</strong> {item.category}</span>
          <span><strong>Location:</strong> {item.location_found}</span>
          <span><strong>Campus:</strong> {item.campus}</span>
          <span><strong>Posted:</strong> {new Date(item.created_at).toLocaleDateString()}</span>
          {item.first_name && (
            <span><strong>By:</strong> {item.first_name} {item.last_name}</span>
          )}
        </div>

        {claimSuccess && <div className="alert success">{claimSuccess}</div>}

        {/* Claim button — only shown when appropriate */}
        {user && item.status !== 'claimed' && item.user_id !== user.id && (
          <button onClick={() => setShowClaimForm(true)} className="success">
            Claim This Item
          </button>
        )}
        {!user && (
          <div className="alert info">
            <button onClick={() => onNavigate('login')}
              style={{ background: 'none', textDecoration: 'underline', cursor: 'pointer', color: 'inherit', border: 'none', padding: 0 }}>
              Login
            </button> to claim this item.
          </div>
        )}
        {item.status === 'claimed' && (
          <div className="alert info">This item has already been claimed.</div>
        )}
      </div>

      {/* Claim modal rendered on top when triggered */}
      {showClaimForm && (
        <ClaimItem
          itemId={itemId}
          onClose={() => setShowClaimForm(false)}
          onClaimSuccess={() => {
            setShowClaimForm(false);
            setClaimSuccess('Claim submitted successfully! We will review it shortly.');
            loadItem();
          }}
        />
      )}
    </div>
  );
}
