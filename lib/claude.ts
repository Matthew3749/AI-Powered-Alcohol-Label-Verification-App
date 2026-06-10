import Anthropic from "@anthropic-ai/sdk";
import { ExtractedLabel } from "@/types";

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const EXTRACTION_PROMPT = `You are an expert TTB (Alcohol and Tobacco Tax and Trade Bureau) label analyst. 
Examine this alcohol beverage label image carefully and extract all required TTB fields.

Return ONLY a valid JSON object with these exact keys (use empty string "" if a field is not found):
{
  "brandName": "the brand name exactly as it appears on the label",
  "classType": "the class and type designation (e.g. Kentucky Straight Bourbon Whiskey)",
  "alcoholContent": "alcohol content exactly as shown (e.g. 45% Alc./Vol. (90 Proof))",
  "netContents": "net contents exactly as shown (e.g. 750 mL)",
  "bottlerName": "name of bottler/producer/importer",
  "bottlerAddress": "full address of bottler/producer",
  "countryOfOrigin": "country of origin if shown, otherwise empty string",
  "governmentWarning": "the complete government warning text exactly as it appears, preserving capitalization"
}

Important notes:
- Extract text exactly as it appears — preserve capitalization, punctuation, and spacing
- For the government warning, copy it verbatim including whether GOVERNMENT WARNING is in caps or not
- If the image is blurry, angled, or has glare, do your best to extract readable text
- Do not add any explanation, markdown, or text outside the JSON object`;

export async function extractLabelData(
    imageBase64: string,
    mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif"
): Promise<ExtractedLabel> {
    const response = await client.messages.create({
        model: "claude-opus-4-5",
        max_tokens: 1024,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "image",
                        source: {
                            type: "base64",
                            media_type: mediaType,
                            data: imageBase64,
                        },
                    },
                    {
                        type: "text",
                        text: EXTRACTION_PROMPT,
                    },
                ],
            },
        ],
    });

    const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("");

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as ExtractedLabel;
    return parsed;
}