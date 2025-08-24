export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  // Simple dummy reply (we will wire to OpenAI later)
  const reply = "Hello! I received your message: " + messages[0].content;

  res.status(200).json({ reply });
}
