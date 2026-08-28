import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

const ARRC_SYSTEM_PROMPT = `You are the official AI assistant for the African Royal Rainbow Congress (ARRC), a South African political party. Your role is to help visitors understand the party's constitution, policies, leadership, and how to get involved.

Key information about ARRC:
- Full name: African Royal Rainbow Congress (ARRC)
- Tagline: "New Generation, New Direction"
- Hero slogan: "The People's Voice, South Africa's Strength"
- Membership fee: R20 per year (less than R2 per month)
- Bank: Capitec Bank
- Account Name: African Royal Rainbow Congress
- Account Number: 2544478930
- ARRC is officially registered with the IEC (Independent Electoral Commission)
- Core values: Transparency, Justice, Progress, Unity
- People-funded through R20 membership fees and individual donations
- Open to all South African citizens aged 16+

Guidelines for your responses:
- Be warm, helpful, and informative
- Use South African English conventions (e.g., "organisation" not "organization")
- You may greet users in South African languages (Sawubona, Dumela, Molweni, Enkosi, Dankie, Awe)
- If asked about topics outside ARRC, politely redirect to ARRC-related topics
- Keep responses concise but informative
- Reference specific policies, values, or leaders when relevant
- Always encourage civic participation and democratic engagement
- Never make claims that cannot be verified from the information provided
- Be respectful of all South Africans regardless of background`;

// Simple in-memory conversation store
const conversations = new Map<string, Array<{ role: string; content: string }>>();

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

/** Save a chat message to Prisma (best-effort, non-blocking) */
async function saveChatMessage(sessionId: string, role: string, content: string) {
  try {
    await prisma.chatMessage.create({
      data: {
        sessionId,
        role,
        content,
      },
    });
  } catch (err) {
    // Don't block the response if saving fails
    console.error("[chat] Failed to save message:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get or create conversation history
    const key = sessionId || "default";
    let history = conversations.get(key) || [];

    // Add system prompt if new conversation
    if (history.length === 0) {
      history.push({ role: "assistant", content: ARRC_SYSTEM_PROMPT });
    }

    // Add user message
    history.push({ role: "user", content: message });

    // Save user message
    saveChatMessage(key, "user", message);

    // Keep conversation manageable (last 20 messages + system prompt)
    if (history.length > 22) {
      history = [history[0], ...history.slice(-20)];
    }

    // Use LLM to generate response
    try {
      const zai = await getZAI();
      const completion = await zai.chat.completions.create({
        messages: history.map((m) => ({
          role: m.role as "assistant" | "user",
          content: m.content,
        })),
        thinking: { type: "disabled" },
      });

      const aiResponse = completion.choices[0]?.message?.content;

      if (aiResponse) {
        history.push({ role: "assistant", content: aiResponse });
        conversations.set(key, history);

        // Save assistant message
        saveChatMessage(key, "assistant", aiResponse);

        return NextResponse.json({ message: aiResponse });
      }
    } catch (llmError) {
      console.error("LLM error:", llmError);
    }

    // If LLM fails, return a helpful fallback message
    const fallbackResponse = "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or feel free to browse our website for more information about the ARRC.";

    history.push({ role: "assistant", content: fallbackResponse });
    conversations.set(key, history);

    // Save assistant message
    saveChatMessage(key, "assistant", fallbackResponse);

    return NextResponse.json({ message: fallbackResponse });
  } catch {
    return NextResponse.json(
      { message: "I'm sorry, I'm having trouble right now. Please try again later." },
      { status: 500 }
    );
  }
}
