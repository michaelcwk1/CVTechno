export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { jobTitle, jobDescription, cvData } = req.body;

    if (!jobTitle || !jobDescription || !cvData) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API Key Gemini tidak ditemukan' });
    }

    const prompt = `
You are a professional CV writer.
Return ONLY valid JSON.
Do not add explanation or markdown.

JOB TITLE:
${jobTitle}

JOB DESCRIPTION:
${jobDescription}

CURRENT CV JSON:
${JSON.stringify(cvData, null, 2)}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const result = await response.json();

    console.log('Gemini raw response:', JSON.stringify(result, null, 2));

    const text =
      result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        error: 'AI tidak mengembalikan data',
        raw: result,
      });
    }

    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    return res.status(200).json({
      success: true,
      data: parsed,
    });

  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
