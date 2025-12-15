export const config = {
  runtime: 'nodejs'
};

import { store } from '../_store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 WEBHOOK RECEIVED:', JSON.stringify(req.body, null, 2));

    const { reference_id, order_id, amount, status } = req.body || {};
    const finalOrderId = order_id || reference_id;

    if (!finalOrderId) {
      console.error('❌ No order_id or reference_id in webhook');
      return res.status(400).json({
        success: false,
        message: 'Missing order_id'
      });
    }

    const order = store.get(finalOrderId);

    if (!order) {
      console.warn('⚠️ Order not found:', finalOrderId);
      return res.status(200).json({
        success: true,
        message: 'Webhook processed (order not in store)'
      });
    }

    if (status === 'completed' || status === 'success') {
      order.status = 'success';
      order.paidAt = Date.now();
      console.log('✅ PAYMENT CONFIRMED:', finalOrderId);
    } else if (status === 'pending') {
      order.status = 'pending';
      console.log('⏳ PAYMENT PENDING:', finalOrderId);
    } else {
      order.status = 'failed';
      console.log('❌ PAYMENT FAILED:', finalOrderId);
    }

    store.set(finalOrderId, order);

    return res.status(200).json({
      success: true,
      message: 'Webhook processed'
    });

  } catch (err) {
    console.error('🔥 WEBHOOK ERROR:', err);
    return res.status(200).json({
      success: false,
      message: 'Error processing webhook'
    });
  }
}