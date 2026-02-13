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

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get all items with optional filtering
 *     tags: [Items]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [electronics, textbooks, keys, id_cards, clothing, bags, other]
 *         description: Filter by item category
 *       - in: query
 *         name: campus
 *         schema:
 *           type: string
 *           enum: [Main, Waterloo, Cambridge]
 *         description: Filter by campus
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [found, lost, claimed]
 *         description: Filter by item status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Item'
 */
router.get('/', getItems);

/**
 * @swagger
 * /api/items/found:
 *   post:
 *     summary: Report a found item
 *     tags: [Items]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, category, location_found, campus]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "iPhone 14 Pro"
 *               category:
 *                 type: string
 *                 enum: [electronics, textbooks, keys, id_cards, clothing, bags, other]
 *                 example: "electronics"
 *               description:
 *                 type: string
 *                 example: "Found near library entrance, screen has crack"
 *               location_found:
 *                 type: string
 *                 example: "Library Building - Main Entrance"
 *               campus:
 *                 type: string
 *                 example: "Main"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Item image (JPG, PNG, GIF, WebP, max 5MB)
 *     responses:
 *       201:
 *         description: Item reported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Item reported successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Item'
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 */
router.post('/found', protect, upload.single('image'), reportFoundItem);

/**
 * @swagger
 * /api/items/lost:
 *   post:
 *     summary: Report a lost item
 *     tags: [Items]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, category, location_lost, campus]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Samsung Galaxy Watch"
 *               category:
 *                 type: string
 *                 enum: [electronics, textbooks, keys, id_cards, clothing, bags, other]
 *               description:
 *                 type: string
 *               location_lost:
 *                 type: string
 *                 example: "Parking Lot B"
 *               campus:
 *                 type: string
 *                 example: "Main"
 *     responses:
 *       201:
 *         description: Lost item reported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Item'
 *       401:
 *         description: Unauthorized
 */
router.post('/lost', protect, upload.single('image'), reportLostItem);

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get a single item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item not found
 *   put:
 *     summary: Update item details
 *     tags: [Items]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               location_found:
 *                 type: string
 *               campus:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to update this item
 *       404:
 *         description: Item not found
 *   delete:
 *     summary: Delete an item (staff only)
 *     tags: [Items]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Staff only
 *       404:
 *         description: Item not found
 */
router.get('/:id', getItem);

/**
 * @swagger
 * /api/items/{id}/status:
 *   put:
 *     summary: Update item status (staff only)
 *     tags: [Items]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [found, lost, claimed]
 *                 example: "claimed"
 *     responses:
 *       200:
 *         description: Item status updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Staff only
 *       404:
 *         description: Item not found
 */
router.put('/:id/status', protect, authorize('staff'), updateItemStatus);

/**
 * @swagger
 * /api/items/{id}/claims:
 *   get:
 *     summary: Get all claims for an item
 *     tags: [Items]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Claims retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Claim'
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/claims', protect, getItemClaims);

router.put('/:id', protect, updateItem);
router.delete('/:id', protect, authorize('staff'), deleteItem);

module.exports = router;