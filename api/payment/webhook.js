// api/payment/webhook.js
export const config = {
  runtime: 'nodejs'
};

import { store } from '../_store.js';

// Mapping antara Saweria payment ID dengan order ID kita
// Key: saweria_id, Value: order_id
const paymentMapping = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 WEBHOOK RECEIVED:', JSON.stringify(req.body, null, 2));

    const body = req.body || {};
    
    // Saweria format:
    // {
    //   version: "2022.01",
    //   created_at: "2021-01-01T12:00:00+00:00",
    //   id: "uuid-dari-saweria",
    //   type: "donation",
    //   amount_raw: 69420,
    //   cut: 3471,
    //   donator_name: "Someguy",
    //   donator_email: "someguy@example.com",
    //   message: "order-id-kita-atau-keterangan-lain"
    // }

    const {
      id: saweriaId,
      type,
      amount_raw,
      donator_email,
      message
    } = body;

    if (!saweriaId || type !== 'donation') {
      console.warn('⚠️ Invalid webhook format:', body);
      return res.status(200).json({
        success: true,
        message: 'Invalid webhook format (not a donation)'
      });
    }

    console.log('💰 DONATION RECEIVED:', {
      saweriaId,
      amount: amount_raw,
      email: donator_email,
      message
    });

    // Cari order ID dari message (user harus tulis order ID di message saat bayar)
    // Atau cari di paymentMapping jika kita tracking
    let orderId = null;

    // Strategy 1: Cari order berdasarkan email yang match
    for (const [oid, order] of store.entries()) {
      if (order.email === donator_email && order.status === 'pending') {
        // Jika ada order pending dengan email yang sama dan amount match
        if (Math.abs(order.amount - amount_raw) < 100) { // tolerance 100
          orderId = oid;
          break;
        }
      }
    }

    if (!orderId) {
      console.warn('⚠️ Order not found for email:', donator_email);
      // Tetap return 200 agar Saweria stop retry
      return res.status(200).json({
        success: true,
        message: 'Order not found'
      });
    }

    const order = store.get(orderId);

    if (!order) {
      console.warn('⚠️ Order not in store:', orderId);
      return res.status(200).json({
        success: true,
        message: 'Order not in store'
      });
    }

    // Update status ke success
    order.status = 'success';
    order.paidAt = Date.now();
    order.saweriaId = saweriaId;

    store.set(orderId, order);
    paymentMapping.set(saweriaId, orderId);

    console.log('✅ PAYMENT CONFIRMED:', orderId, {
      status: order.status,
      amount: order.amount,
      paidAt: order.paidAt
    });

    return res.status(200).json({
      success: true,
      orderId,
      message: 'Payment confirmed'
    });

  } catch (err) {
    console.error('🔥 WEBHOOK ERROR:', err);
    // Tetap return 200 untuk tidak di-retry terus
    return res.status(200).json({
      success: false,
      message: 'Error processing webhook'
    });
  }
}