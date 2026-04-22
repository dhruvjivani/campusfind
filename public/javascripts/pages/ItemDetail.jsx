/**
 * ItemDetail.jsx — Single item detail view  (route: /items/:id)
 *
 * Features:
 *  • Fetches item data by ID from the URL param
 *  • Shows full item metadata in a structured grid
 *  • "Claim This Item" button opens a modal for authenticated students
 *  • Item owner sees an "Edit" button (links to /edit/:id)
 *  • Staff see a reminder to use the Staff Panel for claim management
 */

const { useState, useEffect } = React;
const { useParams, useHistory, Link } = ReactRouterDOM;

/**
 * ItemDetail component
 * @param {{ user: object|null }} props
 */
function ItemDetail({ user }) {
  const { id }   = useParams();  // item ID from the URL
  const history  = useHistory();

  /* ── State ───────────────────────────────────────────────────────────────── */
  const [item,         setItem]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');

  /* Fetch item whenever the URL param changes */
  useEffect(() => { loadItem(); }, [id]);

  /** Calls GET /api/items/:id */
  const loadItem = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getItemById(id);
      setItem(response.data);
    } catch {
      setError('Could not load item. It may have been removed.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading / error states ──────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="container">
        <div className="loading"><div className="spinner"></div><p>Loading item…</p></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container">
        <div className="alert error">⚠️ {error || 'Item not found.'}</div>
        <button className="btn-secondary" onClick={() => history.push('/browse')}>
          ← Back to Browse
        </button>
      </div>
    );
  }

  /* ── Derived flags ───────────────────────────────────────────────────────── */
  const isStaff    = user && user.role === 'staff';
  const isOwner    = user && item.user_id === user.id;
  const canClaim   = user && !isStaff && !isOwner && item.status !== 'claimed';
  const statusIcon = item.status === 'lost' ? '🔴' : item.status === 'found' ? '🟢' : '✅';

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <div className="container">

      {/* Back button */}
      <button className="btn-secondary" onClick={() => history.push('/browse')}
        style={{ marginBottom: 20 }}>
        ← Back to Browse
      </button>

      <div className="item-detail-card">
        {/* Item image */}
        {item.image_url && (
          <img
            src={item.image_url} alt={item.title}
            className="item-detail-image"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}

        <div className="item-detail-body">
          {/* Title + status badge */}
          <div className="card-header">
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>{item.title}</h2>
            <span className={`badge ${item.status}`}>
              {statusIcon} {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
          </div>

          {/* Description */}
          <p style={{ color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.7 }}>
            {item.description}
          </p>

          {/* Structured metadata grid */}
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
              <p>📅 {new Date(item.created_at).toLocaleDateString('en-CA', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}</p>
            </div>
            {item.first_name && (
              <div className="item-meta-field">
                <label>Posted By</label>
                <p>👤 {item.first_name} {item.last_name}</p>
              </div>
            )}
          </div>

          {/* Success alert after claiming */}
          {claimSuccess && <div className="alert success">✅ {claimSuccess}</div>}

          {/* ── Action buttons / info alerts ─────────────────────────────── */}

          {/* Owner: Edit button */}
          {isOwner && (
            <Link to={`/edit/${item.id}`} style={{ textDecoration: 'none' }}>
              <button style={{ marginBottom: 8, width: '100%' }}>✏️ Edit This Item</button>
            </Link>
          )}

          {/* Student: Claim button */}
          {canClaim && (
            <button className="success btn-full" onClick={() => setShowClaimForm(true)}>
              ✋ Claim This Item
            </button>
          )}

          {/* Guest: login prompt */}
          {!user && (
            <div className="alert info">
              <span>ℹ️</span>{' '}
              <span>
                <button
                  onClick={() => history.push('/login')}
                  style={{ background:'none', textDecoration:'underline',
                           cursor:'pointer', color:'inherit', border:'none',
                           padding:0, fontWeight:600 }}
                >Sign in</button>{' '}to claim this item.
              </span>
            </div>
          )}

          {/* Already claimed */}
          {item.status === 'claimed' && (
            <div className="alert info">✅ This item has already been claimed.</div>
          )}

          {/* Staff reminder */}
          {isStaff && (
            <div className="alert warning">
              🏛 Staff view — use the{' '}
              <button
                onClick={() => history.push('/staff')}
                style={{ background:'none', textDecoration:'underline',
                         cursor:'pointer', color:'inherit', border:'none', padding:0, fontWeight:600 }}
              >Staff Panel</button>{' '}to manage this item's claims.
            </div>
          )}

        </div>
      </div>

      {/* Claim modal */}
      {showClaimForm && (
        <ClaimItem
          itemId={id}
          onClose={() => setShowClaimForm(false)}
          onClaimSuccess={() => {
            setShowClaimForm(false);
            setClaimSuccess('Claim submitted! Staff will review it shortly.');
            loadItem(); // refresh status
          }}
        />
      )}

    </div>
  );
}
