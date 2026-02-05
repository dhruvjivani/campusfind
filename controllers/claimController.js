const Claim = require('../models/Claim');
const Item = require('../models/Item');

// @desc    Create claim
// @route   POST /api/claims
// @access  Private
const createClaim = async (req, res) => {
  try {
    const { item_id } = req.body;
    
    // Check if item exists
    const item = await Item.findById(item_id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if item is already claimed
    if (item.status === 'claimed') {
      return res.status(400).json({ message: 'Item is already claimed' });
    }
    
    // Create claim
    const claimData = {
      item_id,
      claimer_id: req.user.id,
      owner_id: item.user_id // Original reporter is potential owner
    };
    
    const claim = await Claim.create(claimData);
    
    res.status(201).json({
      message: 'Claim submitted successfully',
      claim
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get claim by ID
// @route   GET /api/claims/:id
// @access  Private
const getClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    
    // Check if user is authorized to view this claim
    if (claim.claimer_id !== req.user.id && claim.owner_id !== req.user.id && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Not authorized to view this claim' });
    }
    
    res.json(claim);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify claim (staff only)
// @route   PUT /api/claims/:id/verify
// @access  Private/Staff
const verifyClaim = async (req, res) => {
  try {
    const { status, verification_notes } = req.body;
    
    if (!['verified', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const claim = await Claim.updateStatus(req.params.id, status, verification_notes);
    
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    
    res.json({
      message: 'Claim verification updated successfully',
      claim
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's claims
// @route   GET /api/claims/user/my-claims
// @access  Private
const getUserClaims = async (req, res) => {
  try {
    const claims = await Claim.getUserClaims(req.user.id);
    
    res.json({
      success: true,
      count: claims.length,
      data: claims
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get claims for an item
// @route   GET /api/items/:id/claims
// @access  Private
const getItemClaims = async (req, res) => {
  try {
    const claims = await Claim.findByItemId(req.params.id);
    
    res.json({
      success: true,
      count: claims.length,
      data: claims
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update claim
// @route   PUT /api/claims/:id
// @access  Private
const updateClaim = async (req, res) => {
  try {
    const { status, verification_notes } = req.body;
    
    const claim = await Claim.findById(req.params.id);
    
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    
    // Check authorization - claimer or staff can update
    if (claim.claimer_id !== req.user.id && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Not authorized to update this claim' });
    }
    
    // Validate status if provided
    if (status && !['pending', 'verified', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const updatedClaim = await Claim.update(req.params.id, {
      status: status || claim.status,
      verification_notes: verification_notes || claim.verification_notes
    });
    
    res.json({
      message: 'Claim updated successfully',
      claim: updatedClaim
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete/Cancel claim
// @route   DELETE /api/claims/:id
// @access  Private
const deleteClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    
    // Check authorization - claimer or staff can delete
    if (claim.claimer_id !== req.user.id && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Not authorized to delete this claim' });
    }
    
    // Only pending claims can be deleted
    if (claim.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending claims can be cancelled' });
    }
    
    const deleted = await Claim.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    
    res.json({ message: 'Claim deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createClaim,
  getClaim,
  verifyClaim,
  updateClaim,
  getUserClaims,
  getItemClaims,
  deleteClaim
};