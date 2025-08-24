export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages = [] } = req.body || {};

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, // we will set this in Vercel
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",   // lightweight & fast
        messages,
      }),
    });

    const data = await response.json();

    // Send back the assistant's reply
    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "(no reply)",
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Something went wrong." });
  }
}
