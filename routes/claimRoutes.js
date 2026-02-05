const express = require('express');
const router = express.Router();
const {
  createClaim,
  getClaim,
  verifyClaim,
  updateClaim,
  getUserClaims,
  getItemClaims,
  deleteClaim
} = require('../controllers/claimController');
const { protect, authorize } = require('../middleware/auth');

// Private routes
router.post('/', protect, createClaim);
router.get('/user/my-claims', protect, getUserClaims);
router.get('/:id', protect, getClaim);
router.put('/:id', protect, updateClaim);
router.delete('/:id', protect, deleteClaim);

// Staff-only routes
router.put('/:id/verify', protect, authorize('staff'), verifyClaim);

module.exports = router;