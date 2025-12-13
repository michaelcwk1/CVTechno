export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  // Untuk sekarang cukup ACK
  return res.status(200).json({ received: true });
}
