// api/payment/webhook.js
export const config = {
  runtime: 'nodejs'
};

import { store } from '../_store.js';

export default async function handler(req, res) {
  // Saweria mengirim POST dengan format tertentu
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 WEBHOOK RECEIVED:', JSON.stringify(req.body, null, 2));

    // Saweria mengirim data dengan format berbeda, bisa jadi:
    // { reference_id, amount, status, customer_name, etc }
    // Atau mungkin: { order_id, amount, status }
    
    const { reference_id, order_id, amount, status } = req.body || {};
    const finalOrderId = order_id || reference_id;

    if (!finalOrderId) {
      console.error('❌ No order_id or reference_id in webhook');
      return res.status(400).json({
        success: false,
        message: 'Missing order_id'
      });
    }

    // Cari order di store
    const order = store.get(finalOrderId);

    if (!order) {
      console.warn('⚠️ Order not found:', finalOrderId);
      // Jangan throw error, hanya log - webhook tetap return 200
      return res.status(200).json({
        success: true,
        message: 'Webhook processed (order not in store)'
      });
    }

    // Update status berdasarkan notifikasi Saweria
    // Saweria biasanya mengirim status: "completed", "pending", "failed"
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

    // Simpan kembali ke store
    store.set(finalOrderId, order);

    // PENTING: Saweria memerlukan response 200 untuk acknowledge webhook
    return res.status(200).json({
      success: true,
      message: 'Webhook processed'
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