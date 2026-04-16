const { useState } = React;

function ClaimItem({ itemId, onClose, onClaimSuccess }) {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Please describe why you believe this item is yours.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await apiService.createClaim({
        item_id: itemId,
        verification_notes: notes,
      });
      if (onClaimSuccess) onClaimSuccess(response.data);
    } catch (err) {
      setError(err.message || 'Failed to submit claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <h2>✋ Submit a Claim</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
          Describe why you believe this item belongs to you. Include serial numbers,
          unique markings, initials, or any other proof of ownership.
        </p>

        {error && <div className="alert error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Proof of Ownership <span className="required-star">*</span></label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
              rows="5"
              placeholder="e.g., Serial number: ABC123, 'DJ' initials on the inside tag, bought from Staples in September, has a crack on the top-left corner..."
            />
          </div>

          <div className="modal-actions">
            <button type="submit" disabled={loading} className="success">
              {loading ? '⏳ Submitting...' : '✅ Submit Claim'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
