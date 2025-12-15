// api/payment/status.js
export const config = {
  runtime: 'nodejs'
};

import { sharedStore } from '../_shared-store.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId } = req.query;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'orderId required'
      });
    }

    console.log('🔍 Checking order:', orderId);

    sharedStore.debug();

    const order = sharedStore.get(orderId);

    if (!order) {
      console.log('❌ Order not found:', orderId);
      return res.status(200).json({
        success: false,
        orderId,
        status: 'not_found',
        paid: false,
        error: 'Order not found'
      });
    }

    console.log('✅ Order found:', { orderId, status: order.status });

    return res.status(200).json({
      success: true,
      orderId,
      status: order.status,
      paid: order.status === 'success',
      amount: order.amount,
      email: order.email,
      createdAt: order.createdAt,
      paidAt: order.paidAt || null
    });

  } catch (err) {
    console.error('STATUS ERROR:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal error'
    });
  }
}