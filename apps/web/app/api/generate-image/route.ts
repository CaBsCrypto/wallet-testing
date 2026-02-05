import { NextRequest, NextResponse } from "next/server";

// We use direct REST API for Imagen 3 as the SDK 'generateContent' method 
// currently doesn't support the 'predict' endpoint structure required for this model.

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Missing GOOGLE_API_KEY" }, { status: 500 });
        }

        const body = await req.json();
        const { prompt } = body;

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        console.log("Generating image (REST) for prompt:", prompt);

        // Imagen 3 Endpoint
        // Using 'predict' method which is standard for image models in Vertex/Gemini legacy paths
        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;

        const restBody = {
            instances: [
                { prompt: prompt }
            ],
            parameters: {
                sampleCount: 1,
                aspectRatio: "1:1" // Good for NFT format
            }
        };

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(restBody)
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error("Imagen API Error Body:", errText);
            // Don't leak full error to client if it contains sensitive info, but helpful for debug
            throw new Error(`Google API Error: ${res.status} - ${errText}`);
        }

        const data = await res.json();
        // Structure check: predictions[0].bytesBase64Encoded
        const b64 = data.predictions?.[0]?.bytesBase64Encoded;

        if (b64) {
            console.log("Image generated successfully!");
            return NextResponse.json({ image: `data:image/png;base64,${b64}` });
        }

        // If structure is different, log it
        console.error("Unexpected API Response Structure:", JSON.stringify(data).substring(0, 200));
        throw new Error("No image data in response (predictions empty)");

    } catch (e: any) {
        console.error("Gemini Generation Failed:", e);
        return NextResponse.json({ error: e.message || "Generation failed" }, { status: 500 });
    }
}
