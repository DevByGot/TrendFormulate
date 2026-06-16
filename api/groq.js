// Vercel serverless function — proxies requests to the Groq API.
// The real API key is stored in Vercel's environment variables (GROQ_API_KEY)
// and never exposed to the browser.

module.exports = async function handler(req, res) {
  // Only accept POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY environment variable is not set in Vercel." });
  }

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await groqRes.json();

    // Forward Groq's status code (handles 429 rate-limit, 401 bad key, etc.)
    return res.status(groqRes.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: "Proxy error", detail: err.message });
  }
};
