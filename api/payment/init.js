export const config = {
  runtime: 'nodejs'
};

import { store } from '../_store.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, name, email } = req.body || {};

    if (!amount || !email) {
      return res.status(400).json({
        success: false,
        message: 'amount dan email wajib'
      });
    }

    const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    store.set(orderId, {
      amount,
      name: name || 'Guest User',
      email,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    console.log('🧾 ORDER CREATED:', orderId, { amount, email });

    const saweriaUsername = process.env.SAWERIA_USERNAME || 'eilasya';
    const paymentUrl = `https://saweria.co/${saweriaUsername}?amount=${amount}&order_id=${orderId}`;

    return res.status(200).json({
      success: true,
      orderId,
      paymentUrl,
      message: 'Silakan selesaikan pembayaran di Saweria'
    });

  } catch (err) {
    console.error('🔥 INIT ERROR:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
  }
}

// export default async function handler(req, res) {
//   // ===== CORS =====
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }

//   if (req.method !== 'POST') {
//     return res.status(405).json({
//       success: false,
//       message: 'Method not allowed'
//     });
//   }

//   try {
//     console.log('📥 PAYMENT INIT CALLED');

//     // ===== ENV =====
//     const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
//     const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';

//     if (!SERVER_KEY) {
//       console.error('❌ MIDTRANS_SERVER_KEY missing');
//       return res.status(500).json({
//         success: false,
//         message: 'MIDTRANS_SERVER_KEY not set'
//       });
//     }

//     // ===== BODY =====
//     const body = req.body;

//     if (!body || Object.keys(body).length === 0) {
//       console.error('❌ Empty request body');
//       return res.status(400).json({
//         success: false,
//         message: 'Request body is empty'
//       });
//     }

//     console.log('📦 Payload:', JSON.stringify(body, null, 2));
//     console.log('🔧 Environment:', IS_PRODUCTION ? 'PRODUCTION' : 'SANDBOX');

//     const { orderId, amount, email, phone, name, itemDetails } = body;

//     // ===== VALIDATION =====
//     if (!orderId || !amount || !email) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields: orderId, amount, email'
//       });
//     }

//     // Sanitize phone - remove special chars
//     const cleanPhone = String(phone || '08123456789').replace(/\D/g, '');
//     if (cleanPhone.length < 10) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid phone number'
//       });
//     }

//     // ===== TRANSACTION DETAILS =====
//     const calculatedAmount = itemDetails
//       ? itemDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0)
//       : amount;

//     const transactionData = {
//       transaction_details: {
//         order_id: String(orderId).trim(),
//         gross_amount: calculatedAmount
//       },
//       customer_details: {
//         first_name: String(name || 'Guest').substring(0, 50),
//         email: String(email).substring(0, 100),
//         phone: cleanPhone
//       },
//       item_details: itemDetails && itemDetails.length > 0
//         ? itemDetails.map(item => ({
//             id: String(item.id),
//             price: Number(item.price),
//             quantity: Number(item.quantity),
//             name: String(item.name).substring(0, 255)
//           }))
//         : [
//             {
//               id: 'cv-export',
//               price: calculatedAmount,
//               quantity: 1,
//               name: 'CV Export & Print License'
//             }
//           ]
//     };

//     // ===== VALIDATE AMOUNTS MATCH =====
//     const itemTotal = transactionData.item_details.reduce(
//       (sum, item) => sum + (item.price * item.quantity),
//       0
//     );

//     if (itemTotal !== transactionData.transaction_details.gross_amount) {
//       console.warn('⚠️ Amount mismatch - adjusting');
//       transactionData.transaction_details.gross_amount = itemTotal;
//     }

//     // ===== DETERMINE MIDTRANS URL BASED ON ENV =====
//     const MIDTRANS_URL = IS_PRODUCTION
//       ? 'https://app.midtrans.com/snap/v1/transactions'
//       : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

//     const auth = Buffer.from(`${SERVER_KEY}:`).toString('base64');

//     console.log('🌐 Midtrans URL:', MIDTRANS_URL);
//     console.log('📊 Transaction Data:', JSON.stringify(transactionData, null, 2));

//     // ===== CALL MIDTRANS =====
//     const midtransRes = await fetch(MIDTRANS_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Basic ${auth}`,
//         'Accept': 'application/json'
//       },
//       body: JSON.stringify(transactionData)
//     });

//     const text = await midtransRes.text();

//     console.log('📨 Midtrans status:', midtransRes.status);
//     console.log('📨 Midtrans response:', text);

//     let data;
//     try {
//       data = JSON.parse(text);
//     } catch (e) {
//       console.error('❌ Failed to parse response:', text);
//       return res.status(500).json({
//         success: false,
//         message: 'Invalid response from Midtrans',
//         raw: text
//       });
//     }

//     // ===== ERROR HANDLING =====
//     if (!midtransRes.ok) {
//       console.error('❌ Midtrans error:', data);
//       return res.status(midtransRes.status).json({
//         success: false,
//         message: data.status_message || 'Midtrans API error',
//         details: data
//       });
//     }

//     if (!data.token) {
//       console.error('❌ No token in response:', data);
//       return res.status(500).json({
//         success: false,
//         message: 'No token returned from Midtrans',
//         details: data
//       });
//     }

//     console.log('✅ TOKEN CREATED:', data.token);

//     return res.status(200).json({
//       success: true,
//       token: data.token,
//       redirect_url: data.redirect_url,
//       environment: IS_PRODUCTION ? 'production' : 'sandbox'
//     });

//   } catch (err) {
//     console.error('🔥 SERVER ERROR:', err);
//     return res.status(500).json({
//       success: false,
//       message: err.message || 'Internal Server Error',
//       error: process.env.NODE_ENV === 'development' ? err.stack : undefined
//     });
//   }
// }