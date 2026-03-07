export const config = { runtime: "edge" };

const CATEGORIES = [
  "אורח חיים", "אוכל ושתייה", "אישיות", "עבודה וכסף",
  "חברות ויחסים", "נסיעות", "טכנולוגיה ובידור", "ספורט ובריאות",
  "בית ומגורים", "זמן פנוי", "ערכים", "הרגלים"
];

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405 });
  }

  const { n = 10, existing = [] } = await req.json().catch(() => ({}));
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "no key" }), { status: 500 });
  }

  const cats = [...CATEGORIES].sort(() => Math.random() - 0.5).slice(0, 4);
  const existingList = existing.slice(0, 30).join(", ");

  const prompt = `צור ${n} שאלות היכרות בינאריות בעברית לסיבוב משחק חברים ישראלי.
קטגוריות: ${cats.join(", ")}.
כל שאלה = שתי אפשרויות מנוגדות קצרות (1-3 מילים כל צד).
אל תחזור על: ${existingList || "אין"}.
החזר JSON בלבד, ללא markdown:
[{"id":"q1","left":"...","right":"...","label":"...?"},...]`;

  try {
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 800,
        temperature: 0.9,
        messages: [
          { role: "system", content: "אתה עוזר שמחזיר JSON בלבד, ללא הסבר." },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!resp.ok) throw new Error("groq " + resp.status);

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content || "[]";
    const clean = text.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(clean);

    if (!Array.isArray(questions) || questions.length < 1) throw new Error("bad json");

    return new Response(JSON.stringify(questions.slice(0, n)), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    console.error("gen error:", e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
