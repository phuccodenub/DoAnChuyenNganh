/**
 * Ping Route
 * Lightweight liveness endpoint returning plain text
 */

import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /ping:
 *   get:
 *     summary: Ping endpoint
 *     description: Returns plain text "pong" for quick liveness checks
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Pong
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: pong
 */
router.get('/ping', (req, res) => {
  res.type('text/plain').status(200).send('pong');
});

export default router;


