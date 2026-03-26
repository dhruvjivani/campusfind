const { useState } = React;

function ClaimItem({ itemId, onClose, onClaimSuccess }) {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000,
    }}>
      <div className="form-container" style={{ maxWidth: '500px', width: '90%', margin: 0 }}>
        <h2>Submit a Claim</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '1rem' }}>
          Describe why you believe this item is yours. Include serial numbers, initials, or other identifying details.
        </p>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Proof of Ownership *</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
              rows="5"
              placeholder="e.g., Serial number: ABC123, initials 'DJ' on the inside tag, bought it from Staples last September..."
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Submitting...' : 'Submit Claim'}
            </button>
            <button type="button" onClick={onClose} className="secondary" style={{ flex: 1 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
