// routes/webhook.routes.js
import express from 'express';
import { handleStripeWebhook } from '../controllers/webhook.controller.js';

const router = express.Router();

// Stripe webhook needs raw body
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;