export default async function handler(req, res) {
  // ===== CORS =====
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    console.log('📥 PAYMENT INIT CALLED');

    // ===== ENV =====
    const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
    const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';

    if (!SERVER_KEY) {
      console.error('❌ MIDTRANS_SERVER_KEY missing');
      return res.status(500).json({
        success: false,
        message: 'MIDTRANS_SERVER_KEY not set'
      });
    }

    // ===== BODY =====
    const body = req.body;

    if (!body || Object.keys(body).length === 0) {
      console.error('❌ Empty request body');
      return res.status(400).json({
        success: false,
        message: 'Request body is empty'
      });
    }

    console.log('📦 Payload:', body);

    const { orderId, amount, email, phone, name, itemDetails } = body;

    if (!orderId || !amount || !email || !phone || !name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // ===== TRANSACTION =====
    const transactionData = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount
      },
      customer_details: {
        first_name: name,
        email,
        phone
      },
      item_details: itemDetails || [
        {
          id: 'cv-export',
          price: amount,
          quantity: 1,
          quantity: 1,
          name: 'CV Export & Print License'
        }
      ]
    };

    const MIDTRANS_URL = IS_PRODUCTION
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    const auth = Buffer
      .from(`${SERVER_KEY}:`)
      .toString('base64');

    console.log('🌐 Midtrans URL:', MIDTRANS_URL);

    // ===== CALL MIDTRANS =====
    const midtransRes = await fetch(MIDTRANS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(transactionData)
    });

    const text = await midtransRes.text();

    console.log('📨 Midtrans status:', midtransRes.status);
    console.log('📨 Midtrans raw:', text.slice(0, 200));

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: 'Invalid response from Midtrans',
        raw: text
      });
    }

    if (!midtransRes.ok || !data.token) {
      return res.status(midtransRes.status).json({
        success: false,
        message: data.status_message || 'Midtrans error',
        details: data
      });
    }

    console.log('✅ TOKEN CREATED');

    return res.status(200).json({
      success: true,
      token: data.token
    });

  } catch (err) {
    console.error('🔥 SERVER ERROR:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
  }
}
