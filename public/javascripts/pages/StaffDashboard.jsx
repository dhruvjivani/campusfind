/**
 * StaffDashboard.jsx — Staff Control Panel  (route: /staff)
 *
 * Staff-only route — enforced by StaffRoute in App.jsx.
 *
 * Features:
 *  • Live stats cards (total / lost / found / claimed)
 *  • Three tabs: Overview | Manage Items | Verify Claims
 *  • Item management: change status via dropdown, delete items
 *  • Claims management: expand per-item claims, verify / reject / complete
 *  • Auto-refreshes local state after every action (no manual page reload needed)
 */

const { useState, useEffect } = React;
const { useHistory, Link }    = ReactRouterDOM;

/**
 * StaffDashboard component
 * @param {{ user: object }} props - Authenticated staff user
 */
function StaffDashboard({ user }) {
  const history = useHistory();

  /* ── Tab state ───────────────────────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'items' | 'claims'

  /* ── Data state ──────────────────────────────────────────────────────────── */
  const [items,  setItems]  = useState([]);
  const [stats,  setStats]  = useState({ total:0, lost:0, found:0, claimed:0 });
  const [loading, setLoading] = useState(true);
  const [error,   setError]  = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  /* Per-item claims panel */
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [itemClaims,     setItemClaims]     = useState({});   // { [itemId]: Claim[] }
  const [claimsLoading,  setClaimsLoading]  = useState({});   // { [itemId]: boolean }

  /* Action loading states */
  const [statusChanging, setStatusChanging] = useState({}); // { [itemId]: boolean }
  const [deletingItem,   setDeletingItem]   = useState(null);
  const [verifyingClaim, setVerifyingClaim] = useState({}); // { [claimId]: boolean }

  /* Fetch all items + stats on mount */
  useEffect(() => { loadAll(); }, []);

  /** Loads all items and computes stats from four parallel API calls */
  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [allRes, lostRes, foundRes, claimedRes] = await Promise.all([
        apiService.getItems({}),
        apiService.getItems({ status: 'lost' }),
        apiService.getItems({ status: 'found' }),
        apiService.getItems({ status: 'claimed' }),
      ]);
      setStats({
        total:   allRes.total    || 0,
        lost:    lostRes.total   || 0,
        found:   foundRes.total  || 0,
        claimed: claimedRes.total || 0,
      });
      setItems(allRes.data || []);
    } catch {
      setError('Failed to load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  /** Displays a temporary success message for 3 seconds */
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  /* ── Item actions ────────────────────────────────────────────────────────── */

  /**
   * Changes an item's status via PUT /api/items/:id/status
   * Updates local state immediately to avoid re-fetching the whole list.
   */
  const handleStatusChange = async (itemId, newStatus) => {
    setStatusChanging(prev => ({ ...prev, [itemId]: true }));
    try {
      await apiService.updateItemStatus(itemId, { status: newStatus });
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: newStatus } : i));
      showSuccess(`Item status updated to "${newStatus}".`);
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setStatusChanging(prev => ({ ...prev, [itemId]: false }));
    }
  };

  /**
   * Deletes an item via DELETE /api/items/:id
   * Removes it from local state on success.
   */
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Permanently delete this item? This cannot be undone.')) return;
    setDeletingItem(itemId);
    try {
      await apiService.deleteItem(itemId);
      setItems(prev => prev.filter(i => i.id !== itemId));
      showSuccess('Item deleted successfully.');
    } catch (err) {
      setError(err.message || 'Failed to delete item.');
    } finally {
      setDeletingItem(null);
    }
  };

  /* ── Claims panel ────────────────────────────────────────────────────────── */

  /**
   * Toggles the claims panel for an item.
   * Lazy-loads claims on first open via GET /api/items/:id/claims
   */
  const toggleClaims = async (itemId) => {
    if (expandedItemId === itemId) { setExpandedItemId(null); return; }
    setExpandedItemId(itemId);
    if (!itemClaims[itemId]) {
      setClaimsLoading(prev => ({ ...prev, [itemId]: true }));
      try {
        const res = await apiService.getItemClaims(itemId);
        setItemClaims(prev => ({ ...prev, [itemId]: res.data || [] }));
      } catch {
        setItemClaims(prev => ({ ...prev, [itemId]: [] }));
      } finally {
        setClaimsLoading(prev => ({ ...prev, [itemId]: false }));
      }
    }
  };

  /**
   * Verifies, rejects, or completes a claim via PUT /api/claims/:id/verify
   * @param {number} claimId
   * @param {number} itemId    - Parent item (used to update local claim list)
   * @param {string} status    - 'verified' | 'rejected' | 'completed'
   */
  const handleVerifyClaim = async (claimId, itemId, status) => {
    setVerifyingClaim(prev => ({ ...prev, [claimId]: true }));
    try {
      await apiService.verifyClaim(claimId, { status });
      /* Update the claim's status in local state */
      setItemClaims(prev => ({
        ...prev,
        [itemId]: (prev[itemId] || []).map(c =>
          c.id === claimId ? { ...c, status } : c
        ),
      }));
      /* If verified/completed, mark the item as claimed in the items list */
      if (status === 'verified' || status === 'completed') {
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'claimed' } : i));
      }
      showSuccess(`Claim ${status}.`);
    } catch (err) {
      setError(err.message || 'Failed to update claim.');
    } finally {
      setVerifyingClaim(prev => ({ ...prev, [claimId]: false }));
    }
  };

  /** Renders a coloured badge for any status string */
  const statusBadge = (s) => <span className={`badge ${s}`}>{s}</span>;

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <div className="container">

      {/* ── Staff header banner ──────────────────────────────────────────── */}
      <div className="staff-header">
        <div className="staff-header-icon">🏛</div>
        <div>
          <h2>Staff Control Panel</h2>
          <p>Welcome back, {user.first_name}. Manage items and verify claims below.</p>
        </div>
      </div>

      {/* Feedback alerts */}
      {successMsg && <div className="alert success">✅ {successMsg}</div>}
      {error && (
        <div className="alert error">
          ⚠️ {error}
          <button className="btn-sm btn-secondary" style={{ marginLeft: 8 }}
            onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <div className="stat-card blue">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">📦 Total Items</div>
        </div>
        <div className="stat-card red">
          <div className="stat-number">{stats.lost}</div>
          <div className="stat-label">🔴 Lost</div>
        </div>
        <div className="stat-card green">
          <div className="stat-number">{stats.found}</div>
          <div className="stat-label">🟢 Found</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-number">{stats.claimed}</div>
          <div className="stat-label">✅ Claimed</div>
        </div>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <div className="tabs">
        {['overview', 'items', 'claims'].map(tab => (
          <button key={tab}
            className={`tab-btn${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' ? '📊 Overview'
             : tab === 'items'   ? '📦 Manage Items'
             :                     '📋 Verify Claims'}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          TAB: Overview
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div>
          {/* Quick action buttons */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => setActiveTab('items')}>📦 Manage Items</button>
              <button className="btn-staff" onClick={() => setActiveTab('claims')}>📋 Review Claims</button>
              <button className="btn-secondary" onClick={() => history.push('/browse')}>
                🔎 Public Browse View
              </button>
            </div>
          </div>

          {/* Recent items preview */}
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Recent Items</h3>
            {loading ? (
              <div className="loading"><div className="spinner"></div></div>
            ) : (
              items.slice(0, 5).map(item => (
                <div key={item.id} className="item-row">
                  <div className="item-row-info">
                    <h4>{item.title}</h4>
                    <p>📍 {item.location_found} · {item.campus} · {new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
                    {statusBadge(item.status)}
                    <Link to={`/items/${item.id}`} style={{ textDecoration:'none' }}>
                      <button className="btn-sm">View</button>
                    </Link>
                  </div>
                </div>
              ))
            )}
            {items.length > 5 && (
              <button className="btn-secondary" style={{ marginTop:12, width:'100%' }}
                onClick={() => setActiveTab('items')}>
                View All {items.length} Items →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: Manage Items (CRUD — Read / Update / Delete)
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'items' && (
        <div>
          <div className="page-header">
            <h2>All Items</h2>
            <p>Change status, delete items, or expand to review their claims.</p>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner"></div><p>Loading items…</p></div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">📭</span>
              <h3>No items yet</h3>
              <p>Items posted by users will appear here.</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id}>
                {/* Item row */}
                <div className="item-row">
                  <div className="item-row-info">
                    <h4>{item.title}</h4>
                    <p>🏷 {item.category} · 📍 {item.location_found} · {item.campus} · {new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="item-row-actions">
                    {statusBadge(item.status)}

                    {/* Status dropdown */}
                    <select className="status-select"
                      value={item.status}
                      disabled={statusChanging[item.id]}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    >
                      <option value="lost">Lost</option>
                      <option value="found">Found</option>
                      <option value="claimed">Claimed</option>
                    </select>

                    {/* Toggle claims panel */}
                    <button className="btn-sm" onClick={() => toggleClaims(item.id)}>
                      {expandedItemId === item.id ? '▲ Hide Claims' : '📋 Claims'}
                    </button>

                    {/* View on public page */}
                    <Link to={`/items/${item.id}`} style={{ textDecoration:'none' }}>
                      <button className="btn-sm btn-secondary">View</button>
                    </Link>

                    {/* Delete */}
                    <button className="btn-sm danger"
                      disabled={deletingItem === item.id}
                      onClick={() => handleDeleteItem(item.id)}>
                      {deletingItem === item.id ? '…' : '🗑'}
                    </button>
                  </div>
                </div>

                {/* Expandable claims panel */}
                {expandedItemId === item.id && (
                  <ClaimsPanelInline
                    itemId={item.id}
                    claims={itemClaims[item.id]}
                    loading={claimsLoading[item.id]}
                    verifyingClaim={verifyingClaim}
                    onVerify={handleVerifyClaim}
                    statusBadge={statusBadge}
                  />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: Verify Claims
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'claims' && (
        <div>
          <div className="page-header">
            <h2>Verify Claims</h2>
            <p>Click an item to expand its claim submissions and take action.</p>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : (
            /* Show only found/claimed items since those are claimable */
            items.filter(i => i.status !== 'lost').map(item => (
              <div key={item.id} style={{ marginBottom: 8 }}>
                <div className="item-row" style={{ cursor:'pointer' }}
                  onClick={() => toggleClaims(item.id)}>
                  <div className="item-row-info">
                    <h4>{item.title}</h4>
                    <p>📍 {item.location_found} · {item.campus}</p>
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    {statusBadge(item.status)}
                    <button className="btn-sm btn-staff">
                      {expandedItemId === item.id ? '▲ Hide' : '📋 Claims'}
                    </button>
                  </div>
                </div>

                {expandedItemId === item.id && (
                  <ClaimsPanelInline
                    itemId={item.id}
                    claims={itemClaims[item.id]}
                    loading={claimsLoading[item.id]}
                    verifyingClaim={verifyingClaim}
                    onVerify={handleVerifyClaim}
                    statusBadge={statusBadge}
                  />
                )}
              </div>
            ))
          )}

          {!loading && items.filter(i => i.status !== 'lost').length === 0 && (
            <div className="empty-state">
              <span className="empty-state-icon">📭</span>
              <h3>No claimable items</h3>
              <p>Claims can only be submitted on found items.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ClaimsPanelInline — Reusable expandable claims list used in both tabs
───────────────────────────────────────────────────────────────────────────── */
/**
 * @param {{ itemId, claims, loading, verifyingClaim, onVerify, statusBadge }} props
 */
function ClaimsPanelInline({ itemId, claims, loading, verifyingClaim, onVerify, statusBadge }) {
  if (loading) {
    return (
      <div className="claims-panel">
        <div style={{ textAlign:'center', padding:12 }}>
          <div className="spinner" style={{ width:24, height:24, borderWidth:2, margin:'0 auto 8px' }}></div>
          <p style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>Loading claims…</p>
        </div>
      </div>
    );
  }

  if (!claims || claims.length === 0) {
    return (
      <div className="claims-panel">
        <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', textAlign:'center', padding:'12px 0' }}>
          No claims submitted for this item yet.
        </p>
      </div>
    );
  }

  return (
    <div className="claims-panel">
      {claims.map(claim => (
        <div key={claim.id} className="claim-row">
          <div className="claim-info">
            <p><strong>Claimer:</strong> {claim.claimer_first_name || 'Unknown'} {claim.claimer_last_name || ''}</p>
            {claim.verification_notes && (
              <p style={{ marginTop:4, background:'#f8fafc', padding:'6px 10px',
                          borderRadius:4, fontSize:'0.85rem' }}>
                💬 "{claim.verification_notes}"
              </p>
            )}
            <p style={{ color:'var(--text-muted)', fontSize:'0.8rem', marginTop:4 }}>
              {new Date(claim.created_at).toLocaleDateString()}
            </p>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
            {statusBadge(claim.status)}

            {/* Action buttons shown only in actionable states */}
            {claim.status === 'pending' && (
              <div className="claim-actions">
                <button className="btn-sm success"
                  disabled={verifyingClaim[claim.id]}
                  onClick={() => onVerify(claim.id, itemId, 'verified')}>
                  {verifyingClaim[claim.id] ? '…' : '✅ Verify'}
                </button>
                <button className="btn-sm danger"
                  disabled={verifyingClaim[claim.id]}
                  onClick={() => onVerify(claim.id, itemId, 'rejected')}>
                  {verifyingClaim[claim.id] ? '…' : '❌ Reject'}
                </button>
              </div>
            )}
            {claim.status === 'verified' && (
              <button className="btn-sm btn-staff"
                disabled={verifyingClaim[claim.id]}
                onClick={() => onVerify(claim.id, itemId, 'completed')}>
                {verifyingClaim[claim.id] ? '…' : '🏁 Complete'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
