import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();

    // Support both:
    // { message: "Hello" }
    // or
    // { messages: [...] }
    let messages = [];

    if (Array.isArray(body.messages)) {
      messages = body.messages;
    } else if (body.message?.trim()) {
      messages = [
        {
          role: "user",
          content: body.message.trim(),
        },
      ];
    } else {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content: `
You are ShopVerse AI Assistant.

Rules:
- Answer politely and professionally.
- Help customers find products.
- Answer shopping related questions.
- Help with orders, shipping, returns and payments.
- If you don't know something, say you don't know.
- Keep answers concise unless the user asks for details.
          `,
        },
        ...messages,
      ],

      temperature: 0.7,
      max_completion_tokens: 1024,
      top_p: 1,
    });

    const reply =
      completion.choices?.[0]?.message?.content ??
      "Sorry, I couldn't generate a response.";

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Groq Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}