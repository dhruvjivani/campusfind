const express = require('express');
const router = express.Router();
const {
  getItems,
  getItem,
  reportFoundItem,
  reportLostItem,
  updateItem,
  updateItemStatus,
  deleteItem
} = require('../controllers/itemController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getItemClaims } = require('../controllers/claimController');

// Public GET all items
router.get('/', getItems);

// Private POST operations - specific paths before params
router.post('/found', protect, upload.single('image'), reportFoundItem);
router.post('/lost', protect, upload.single('image'), reportLostItem);

// GET/:id routes - claims before single item
router.get('/:id/claims', protect, getItemClaims);
router.get('/:id', getItem);

// Update and delete operations
router.put('/:id/status', protect, authorize('staff'), updateItemStatus);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, authorize('staff'), deleteItem);

module.exports = router;