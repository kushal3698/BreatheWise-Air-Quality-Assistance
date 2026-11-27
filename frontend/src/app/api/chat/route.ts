import { NextRequest, NextResponse } from 'next/server';
import { generateLocalChatReply } from '@/lib/chatEngine';
import { sanitizeCity } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { message = '', language = 'en', household } = body;

    // Security input sanitization
    if (typeof message !== 'string') message = '';
    message = message.trim().slice(0, 1000);

    const city = sanitizeCity(body?.city);

    const validLangs = ['en', 'hi', 'te', 'ta'];
    if (!validLangs.includes(language)) language = 'en';

    // Optional: If GEMINI_API_KEY is configured in Vercel environment variables, we can call Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    if (apiKey && apiKey !== 'demo') {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `You are BreatheWise, an urban air quality and environmental health assistant for Indian cities.
Current City: ${city}
Language: ${language}
Household context: ${JSON.stringify(household || {})}

User question: ${message}

Provide actionable, practical, low-emission advice. Cite sources (indoor_air_quality, exercise_and_aqi, vulnerable_groups).
Include Why, Alternatives, and Estimated Impact. Use only supplied environmental numbers; never fabricate statistical figures. Include a non-medical disclaimer.`
                    }
                  ]
                }
              ]
            })
          }
        );
        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return NextResponse.json({
              reply: replyText,
              grounded_sources: ['kb/indoor_air_quality.md', 'kb/exercise_and_aqi.md'],
              suggested_questions: [
                'Should my 8-year-old play outside at 4 PM?',
                'Plan my commute tomorrow to minimise pollution',
                'Is it worth buying a purifier or building a DIY one?'
              ],
              disclaimer: 'BreatheWise provides environmental risk decision support, not medical advice. Consult qualified healthcare professionals for medical conditions.'
            });
          }
        }
      } catch {
        // If the model call fails, the assistant falls back to the rule-based provider
      }
    }

    // Default: Grounded deterministic RAG engine
    const result = generateLocalChatReply(message || '', city, language, household);
    return NextResponse.json(result);
  } catch {
    const fallback = generateLocalChatReply('overview', 'Delhi', 'en');
    return NextResponse.json(fallback);
  }
}
