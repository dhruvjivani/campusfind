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

/**
 * @swagger
 * /api/claims:
 *   post:
 *     summary: Submit a claim for a found item
 *     tags: [Claims]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [item_id]
 *             properties:
 *               item_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Claim submitted successfully
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
 *                   $ref: '#/components/schemas/Claim'
 *       400:
 *         description: Item already claimed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 */
router.post('/', protect, createClaim);

/**
 * @swagger
 * /api/claims/user/my-claims:
 *   get:
 *     summary: Get user's claims
 *     tags: [Claims]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User's claims retrieved
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
router.get('/user/my-claims', protect, getUserClaims);

/**
 * @swagger
 * /api/claims/{id}:
 *   get:
 *     summary: Get claim by ID
 *     tags: [Claims]
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
 *         description: Claim found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Claim'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to view this claim
 *       404:
 *         description: Claim not found
 *   put:
 *     summary: Update claim
 *     tags: [Claims]
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
 *               status:
 *                 type: string
 *                 enum: [pending, verified, rejected, completed]
 *               verification_notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Claim updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Claim not found
 *   delete:
 *     summary: Cancel/delete a pending claim
 *     tags: [Claims]
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
 *         description: Claim deleted successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Only pending claims can be cancelled
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Claim not found
 */
router.get('/:id', protect, getClaim);
router.put('/:id', protect, updateClaim);
router.delete('/:id', protect, deleteClaim);

/**
 * @swagger
 * /api/claims/{id}/verify:
 *   put:
 *     summary: Verify or reject a claim (staff only)
 *     tags: [Claims]
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
 *                 enum: [verified, rejected, completed]
 *                 example: "verified"
 *               verification_notes:
 *                 type: string
 *                 example: "Student verified ownership by providing receipt"
 *     responses:
 *       200:
 *         description: Claim verified successfully
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
 *                   $ref: '#/components/schemas/Claim'
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Staff only
 *       404:
 *         description: Claim not found
 */
router.put('/:id/verify', protect, authorize('staff'), verifyClaim);

module.exports = router;