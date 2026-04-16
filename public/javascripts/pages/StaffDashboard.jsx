const { useState, useEffect } = React;

function StaffDashboard({ onNavigate, user }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, lost: 0, found: 0, claimed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Per-item claims panel state
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [itemClaims, setItemClaims] = useState({});
  const [claimsLoading, setClaimsLoading] = useState({});
  const [statusChanging, setStatusChanging] = useState({});
  const [deletingItem, setDeletingItem] = useState(null);
  const [verifyingClaim, setVerifyingClaim] = useState({});

  useEffect(() => {
    loadAll();
  }, []);

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
        total:   allRes.total || 0,
        lost:    lostRes.total || 0,
        found:   foundRes.total || 0,
        claimed: claimedRes.total || 0,
      });
      setItems(allRes.data || []);
    } catch (err) {
      setError('Failed to load data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  /* ── Item status change ── */
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

  /* ── Delete item ── */
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Permanently delete this item? This cannot be undone.')) return;
    setDeletingItem(itemId);
    try {
      await apiService.deleteItem(itemId);
      setItems(prev => prev.filter(i => i.id !== itemId));
      showSuccess('Item deleted.');
    } catch (err) {
      setError(err.message || 'Failed to delete item.');
    } finally {
      setDeletingItem(null);
    }
  };

  /* ── Toggle claims panel for an item ── */
  const toggleClaims = async (itemId) => {
    if (expandedItemId === itemId) {
      setExpandedItemId(null);
      return;
    }
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

  /* ── Verify / reject / complete a claim ── */
  const handleVerifyClaim = async (claimId, itemId, status, notes = '') => {
    setVerifyingClaim(prev => ({ ...prev, [claimId]: true }));
    try {
      await apiService.verifyClaim(claimId, { status, verification_notes: notes });
      setItemClaims(prev => ({
        ...prev,
        [itemId]: (prev[itemId] || []).map(c =>
          c.id === claimId ? { ...c, status } : c
        ),
      }));
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

  const statusBadge = (s) => <span className={`badge ${s}`}>{s}</span>;

  if (!user || user.role !== 'staff') {
    return (
      <div className="container">
        <div className="alert error">⛔ Access denied. This page is for staff only.</div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="staff-header">
        <div className="staff-header-icon">🏛</div>
        <div>
          <h2>Staff Control Panel</h2>
          <p>Welcome back, {user.first_name}. Manage items and verify claims below.</p>
        </div>
      </div>

      {successMsg && <div className="alert success">✅ {successMsg}</div>}
      {error && <div className="alert error">⚠️ {error} <button className="btn-sm btn-secondary" style={{ marginLeft: 8 }} onClick={() => setError('')}>Dismiss</button></div>}

      {/* Stats */}
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

      {/* Tab Bar */}
      <div className="tabs">
        <button className={`tab-btn${activeTab === 'overview' ? ' active' : ''}`} onClick={() => setActiveTab('overview')}>
          📊 Overview
        </button>
        <button className={`tab-btn${activeTab === 'items' ? ' active' : ''}`} onClick={() => setActiveTab('items')}>
          📦 Manage Items
        </button>
        <button className={`tab-btn${activeTab === 'claims' ? ' active' : ''}`} onClick={() => setActiveTab('claims')}>
          📋 Verify Claims
        </button>
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => setActiveTab('items')}>📦 Manage All Items</button>
              <button className="btn-staff" onClick={() => setActiveTab('claims')}>📋 Review Pending Claims</button>
              <button className="btn-secondary" onClick={() => onNavigate('browse')}>🔎 Browse Public View</button>
            </div>
          </div>

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
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    {statusBadge(item.status)}
                    <button className="btn-sm" onClick={() => onNavigate('itemdetail', item.id)}>View</button>
                  </div>
                </div>
              ))
            )}
            {items.length > 5 && (
              <button className="btn-secondary" style={{ marginTop: 12, width: '100%' }} onClick={() => setActiveTab('items')}>
                View All {items.length} Items →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Items Management Tab ── */}
      {activeTab === 'items' && (
        <div>
          <div className="page-header">
            <h2>All Items</h2>
            <p>Change item status or remove items. Click "View Claims" to review claim submissions.</p>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner"></div><p>Loading items...</p></div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">📭</span>
              <h3>No items yet</h3>
              <p>Items posted by users will appear here.</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id}>
                <div className="item-row">
                  <div className="item-row-info">
                    <h4>{item.title}</h4>
                    <p>
                      🏷 {item.category} · 📍 {item.location_found} · {item.campus} · {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="item-row-actions">
                    {statusBadge(item.status)}
                    <select
                      className="status-select"
                      value={item.status}
                      disabled={statusChanging[item.id]}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    >
                      <option value="lost">Lost</option>
                      <option value="found">Found</option>
                      <option value="claimed">Claimed</option>
                    </select>
                    <button
                      className="btn-sm"
                      onClick={() => toggleClaims(item.id)}
                    >
                      {expandedItemId === item.id ? '▲ Hide Claims' : '📋 View Claims'}
                    </button>
                    <button
                      className="btn-sm btn-secondary"
                      onClick={() => onNavigate('itemdetail', item.id)}
                    >
                      View
                    </button>
                    <button
                      className="btn-sm danger"
                      disabled={deletingItem === item.id}
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      {deletingItem === item.id ? '...' : '🗑'}
                    </button>
                  </div>
                </div>

                {/* Claims panel for this item */}
                {expandedItemId === item.id && (
                  <div className="claims-panel">
                    {claimsLoading[item.id] ? (
                      <div style={{ textAlign: 'center', padding: '16px' }}>
                        <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2, margin: '0 auto 8px' }}></div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading claims...</p>
                      </div>
                    ) : !itemClaims[item.id] || itemClaims[item.id].length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                        No claims submitted for this item yet.
                      </p>
                    ) : (
                      itemClaims[item.id].map(claim => (
                        <div key={claim.id} className="claim-row">
                          <div className="claim-info">
                            <p><strong>Claimer:</strong> {claim.claimer_first_name || 'Unknown'} {claim.claimer_last_name || ''}</p>
                            {claim.verification_notes && (
                              <p><strong>Notes:</strong> {claim.verification_notes}</p>
                            )}
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              Submitted: {new Date(claim.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            {statusBadge(claim.status)}
                            {claim.status === 'pending' && (
                              <div className="claim-actions">
                                <button
                                  className="btn-sm success"
                                  disabled={verifyingClaim[claim.id]}
                                  onClick={() => handleVerifyClaim(claim.id, item.id, 'verified')}
                                >
                                  {verifyingClaim[claim.id] ? '...' : '✅ Verify'}
                                </button>
                                <button
                                  className="btn-sm danger"
                                  disabled={verifyingClaim[claim.id]}
                                  onClick={() => handleVerifyClaim(claim.id, item.id, 'rejected')}
                                >
                                  {verifyingClaim[claim.id] ? '...' : '❌ Reject'}
                                </button>
                              </div>
                            )}
                            {claim.status === 'verified' && (
                              <button
                                className="btn-sm btn-staff"
                                disabled={verifyingClaim[claim.id]}
                                onClick={() => handleVerifyClaim(claim.id, item.id, 'completed')}
                              >
                                {verifyingClaim[claim.id] ? '...' : '🏁 Complete'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Claims Review Tab ── */}
      {activeTab === 'claims' && (
        <div>
          <div className="page-header">
            <h2>Verify Claims</h2>
            <p>Select an item below to review its claims.</p>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner"></div><p>Loading...</p></div>
          ) : (
            items.filter(i => i.status !== 'lost').map(item => (
              <div key={item.id} style={{ marginBottom: 8 }}>
                <div className="item-row" style={{ cursor: 'pointer' }} onClick={() => toggleClaims(item.id)}>
                  <div className="item-row-info">
                    <h4>{item.title}</h4>
                    <p>📍 {item.location_found} · {item.campus}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {statusBadge(item.status)}
                    <button className="btn-sm btn-staff">
                      {expandedItemId === item.id ? '▲ Hide' : '📋 Claims'}
                    </button>
                  </div>
                </div>

                {expandedItemId === item.id && (
                  <div className="claims-panel">
                    {claimsLoading[item.id] ? (
                      <div style={{ textAlign: 'center', padding: '16px' }}>
                        <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2, margin: '0 auto 8px' }}></div>
                      </div>
                    ) : !itemClaims[item.id] || itemClaims[item.id].length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                        No claims for this item.
                      </p>
                    ) : (
                      itemClaims[item.id].map(claim => (
                        <div key={claim.id} className="claim-row">
                          <div className="claim-info">
                            <p><strong>By:</strong> {claim.claimer_first_name || 'Unknown'} {claim.claimer_last_name || ''}</p>
                            {claim.verification_notes && (
                              <p style={{ marginTop: 4, background: '#f8fafc', padding: '6px 10px', borderRadius: 4, fontSize: '0.85rem' }}>
                                💬 "{claim.verification_notes}"
                              </p>
                            )}
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
                              {new Date(claim.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                            {statusBadge(claim.status)}
                            {claim.status === 'pending' && (
                              <>
                                <button
                                  className="btn-sm success"
                                  disabled={verifyingClaim[claim.id]}
                                  onClick={() => handleVerifyClaim(claim.id, item.id, 'verified')}
                                >
                                  ✅ Verify
                                </button>
                                <button
                                  className="btn-sm danger"
                                  disabled={verifyingClaim[claim.id]}
                                  onClick={() => handleVerifyClaim(claim.id, item.id, 'rejected')}
                                >
                                  ❌ Reject
                                </button>
                              </>
                            )}
                            {claim.status === 'verified' && (
                              <button
                                className="btn-sm btn-staff"
                                disabled={verifyingClaim[claim.id]}
                                onClick={() => handleVerifyClaim(claim.id, item.id, 'completed')}
                              >
                                🏁 Mark Complete
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))
          )}

          {!loading && items.filter(i => i.status !== 'lost').length === 0 && (
            <div className="empty-state">
              <span className="empty-state-icon">📭</span>
              <h3>No found/claimed items</h3>
              <p>Claims can only be made on found items.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
