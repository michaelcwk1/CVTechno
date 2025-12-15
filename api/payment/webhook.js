// api/payment/webhook.js
export const config = {
  runtime: 'nodejs'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 WEBHOOK RECEIVED:', JSON.stringify(req.body, null, 2));

    const body = req.body || {};
    const orderStore = global.orderStore || new Map();

    // Saweria format yang dikirim:
    // {
    //   id: "uuid",
    //   type: "donation",
    //   amount_raw: 5000,
    //   donator_email: "user@email.com",
    //   donator_name: "Name",
    //   message: "optional message"
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
        message: 'Invalid webhook (not a donation)'
      });
    }

    console.log('💰 DONATION RECEIVED:', {
      saweriaId,
      amount: amount_raw,
      email: donator_email,
      message
    });

    console.log('📦 Current store size:', orderStore.size);
    console.log('📋 Orders in store:', Array.from(orderStore.keys()));

    // Strategy: Match berdasarkan email + amount
    let foundOrderId = null;

    for (const [orderId, order] of orderStore.entries()) {
      console.log(`📌 Checking order ${orderId}:`, {
        orderEmail: order.email,
        orderAmount: order.amount,
        saweriaEmail: donator_email,
        saweriaAmount: amount_raw,
        emailMatch: order.email === donator_email,
        amountMatch: Math.abs(order.amount - amount_raw) < 100
      });

      if (
        order.email === donator_email &&
        order.status === 'pending' &&
        Math.abs(order.amount - amount_raw) < 100
      ) {
        foundOrderId = orderId;
        console.log('✅ FOUND MATCHING ORDER:', orderId);
        break;
      }
    }

    if (!foundOrderId) {
      console.warn('⚠️ No matching order found for email:', donator_email);
      return res.status(200).json({
        success: true,
        message: 'No matching order'
      });
    }

    // Update order status
    const order = orderStore.get(foundOrderId);
    order.status = 'success';
    order.paidAt = Date.now();
    order.saweriaId = saweriaId;

    orderStore.set(foundOrderId, order);

    console.log('✅ PAYMENT CONFIRMED:', foundOrderId, {
      status: order.status,
      paidAt: order.paidAt
    });

    return res.status(200).json({
      success: true,
      orderId: foundOrderId,
      message: 'Payment confirmed'
    });

  } catch (err) {
    console.error('🔥 WEBHOOK ERROR:', err);
    return res.status(200).json({
      success: false,
      message: 'Error processing webhook'
    });
  }
}