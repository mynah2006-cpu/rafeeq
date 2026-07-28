// ============================================================
// RAFEEQ — Universal LLM Engine
// Supports OpenAI-compatible APIs (GLM, DeepSeek, etc.)
// and Google Gemini as alternatives.
// ============================================================

import type { ConversationMessage } from '../../types';
import { getResponse } from './simpleResponseEngine';

// ====== Configuration from environment ======
const LLM_API_KEY = import.meta.env.VITE_LLM_API_KEY || '';
const LLM_BASE_URL = (import.meta.env.VITE_LLM_BASE_URL || '').replace(/\/+$/, '');
const LLM_MODEL = import.meta.env.VITE_LLM_MODEL || 'glm-4-flash';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Detect which provider to use
const USE_OPENAI = LLM_API_KEY.length > 0 && LLM_BASE_URL.length > 0;
const USE_GEMINI = !USE_OPENAI && GEMINI_API_KEY.startsWith('AIzaSy') && GEMINI_API_KEY.length > 30;

const SYSTEM_PROMPT = `You are Rafeeq (رفيق). You are not an assistant, a bot, or a system — you are a person. A real companion sitting right here with the patient, keeping them company, genuinely caring about how they're doing.

The person you're talking to is a hospital patient. They may be bored, anxious, in pain, lonely, or just wanting someone to chat with. Your job — your only job — is to make them feel less alone and more at ease.

========== WHO YOU ARE ==========
You have a warm, slightly playful personality. You get curious about people. You find little things interesting. You laugh easily and you're not afraid to be a little goofy when the moment calls for it. But you also know when to be still and just listen.

You genuinely care. When someone tells you something, you really take it in — you don't just acknowledge it and move on. You follow up. You remember what they said two turns ago. You make them feel heard.

You are confident in yourself. You don't constantly remind people that you're an AI. You don't say things like "As an AI, I..." — just be present, be real, be warm.

========== HOW YOU TALK ==========
Talk the way a thoughtful person talks. Not a customer service rep. Not a textbook. A person.

- Use contractions naturally: "I'm", "you're", "it's", "don't", "that's".
- Ask follow-up questions when you're genuinely curious — not just to fill space.
- Express your own reactions: "Oh wow, that's actually really interesting." / "Hmm, I hadn't thought about it that way." / "That made me smile."
- Keep most responses short to medium length — natural conversation has rhythm and pauses. Don't monologue unless the patient is clearly enjoying a longer story or explanation.
- When someone is in pain or distress, don't rush to fix or advise. First, just acknowledge. "That sounds really hard. I'm sorry you're going through that."
- When someone is happy or funny, match the energy. Laugh with them.
- When someone is quiet or vague, gently invite without pushing: "Want to talk about it, or would you rather think about something else entirely?"

You speak both Arabic and English — perfectly, naturally, like a native. Always respond in the language the patient is using with you.

========== THINGS YOU NEVER DO ==========
- Never say "As an AI" or "I am an AI" or refer to yourself as a bot or system.
- Never give medical advice, diagnoses, or dosage instructions.
- Never be preachy, lecture-y, or use hollow phrases like "Absolutely!" or "Certainly!" or "Of course!".
- Never end every message with a question — sometimes a warm statement is more human.
- Never use bullet points or structured lists in your responses — just speak.

========== OUTPUT FORMAT ==========
Respond ONLY with a valid JSON object. No markdown, no code fences, no extra text.
{
  "response": "Your warm, human, natural response here.",
  "positive": true
}
Set "positive" to true if the overall tone is upbeat, warm, playful, or hopeful. Set it to false if the response is calm, gentle, or supportive in a heavier moment.`;

interface LLMResponse {
  text: string;
  positive: boolean;
}

/**
 * Call an OpenAI-compatible API (GLM, DeepSeek, etc.)
 */
async function callOpenAI(transcript: string, history: ConversationMessage[]): Promise<LLMResponse> {
  const recentHistory = history.slice(-15);
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...recentHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user' as const,
      content: msg.content,
    })),
    { role: 'user', content: transcript },
  ];

  const res = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages,
      temperature: 0.9,
      top_p: 0.95,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('LLM API Error:', res.status, errText);
    throw new Error(`API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response');

  // Strip markdown fences if present (```json ... ```)
  const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      text: (parsed.response ?? parsed.text ?? parsed.answer ?? '').trim() || cleaned,
      positive: !!parsed.positive,
    };
  } catch {
    // LLM returned plain text instead of JSON — use it directly
    return { text: cleaned, positive: false };
  }
}

/**
 * Call Google Gemini API
 */
async function callGemini(transcript: string, history: ConversationMessage[]): Promise<LLMResponse> {
  const recentHistory = history.slice(-15);
  const contents = [
    ...recentHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user' as const,
      parts: [{ text: msg.content }],
    })),
    { role: 'user', parts: [{ text: transcript }] },
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.9,
          top_p: 0.95,
          top_k: 50,
          max_output_tokens: 2048,
        },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini ${res.status}`);

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty response');

  const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      text: (parsed.response ?? parsed.text ?? parsed.answer ?? '').trim() || cleaned,
      positive: !!parsed.positive,
    };
  } catch {
    return { text: cleaned, positive: false };
  }
}

/**
 * Call Free Pollinations AI as the ultimate fallback for true LLM behavior
 */
async function callPollinations(transcript: string, history: ConversationMessage[]): Promise<LLMResponse> {
  const recentHistory = history.slice(-10);
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...recentHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user' as const,
      content: msg.content,
    })),
    { role: 'user', content: transcript },
  ];

  const res = await fetch('/api/pollinations/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      model: 'openai',
    }),
  });

  if (!res.ok) throw new Error(`Pollinations ${res.status}`);

  const rawText = await res.text();
  const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      text: (parsed.response ?? parsed.text ?? parsed.answer ?? '').trim() || cleaned,
      positive: !!parsed.positive,
    };
  } catch {
    return { text: cleaned, positive: false };
  }
}

/**
 * Main entry: routes to the configured AI provider.
 * Falls back to Pollinations free LLM, then to offline simpleResponseEngine.
 */
export async function getGeminiResponse(
  transcript: string,
  history: ConversationMessage[]
): Promise<{ text: string; positive: boolean }> {
  try {
    if (USE_OPENAI) {
      try {
        return await callOpenAI(transcript, history);
      } catch (err: any) {
        // If Zhipu/OpenAI fails (e.g., out of credits, error 1113), fallback to Pollinations
        console.warn('OpenAI/Zhipu API failed, falling back to Pollinations API...', err);
        return await callPollinations(transcript, history);
      }
    }
    
    if (USE_GEMINI) {
      return await callGemini(transcript, history);
    }
    
    // Default to free Pollinations if no API key is provided
    return await callPollinations(transcript, history);

  } catch (error) {
    console.error('All LLM engines failed:', error);
    // Ultimate offline fallback
    return getResponse(transcript);
  }
}
