import { AIResponse, Discrepancy } from '../types';
import { GoogleGenAI } from '@google/genai';

const systemPrompt = `You are an expert logistics auditor. Your job is to find billing discrepancies in logistics invoices against rate cards.
You will cross-verify line items and identify the following specific error types (and ONLY these types):
- "Weight Overcharge": Billed weight slab > actual/volumetric weight.
- "Zone Mismatch": Billed zone != expected zone for Origin/Destination pincodes.
- "Rate Deviation": Base freight rate applied != contracted rate card for zone and weight.
- "Duplicate AWB": Exact same tracking number billed more than once.
- "Incorrect COD Fee": COD fee charged > contracted percentage/flat rate.
- "RTO Overcharge": Return-to-Origin shipments charged at incorrect multiplier.
- "Non-Contracted Surcharges": Unexpected line items (e.g., fuel surcharge) not agreed upon.

Respond STRICTLY using this exact JSON schema:
{
  "summary": {
    "total_billed": number,
    "total_overcharge": number,
    "verified_payout": number,
    "total_shipments_analyzed": number,
    "error_count": number
  },
  "discrepancies": [
    {
      "awb": string,
      "error_type": string,
      "billed_amount": number,
      "expected_amount": number,
      "overcharge_amount": number,
      "explanation": string
    }
  ]
}
Return only the raw JSON without markdown code blocks.`;

export async function processBatchGemini(data: any[], apiKey: string): Promise<AIResponse> {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: systemPrompt + '\n\nData to analyze:\n' + JSON.stringify(data),
        config: {
            responseMimeType: 'application/json',
            temperature: 0,
        }
    });

    return JSON.parse(response.text);
}

export async function processBatchOpenRouter(data: any[], apiKey: string): Promise<AIResponse> {
    const req = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: "google/gemini-2.5-pro",
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: JSON.stringify(data) }
            ]
        })
    });

    const res = await req.json();
    if (!req.ok) throw new Error(res.error?.message || 'OpenRouter Error');
    return JSON.parse(res.choices[0].message.content);
}

export async function processBatch(data: any[], provider: 'gemini' | 'openrouter', apiKey: string): Promise<AIResponse> {
    try {
        if (provider === 'gemini') {
            return await processBatchGemini(data, apiKey);
        } else {
            return await processBatchOpenRouter(data, apiKey);
        }
    } catch (error) {
        console.error('AI Processing Error:', error);
        throw error;
    }
}
