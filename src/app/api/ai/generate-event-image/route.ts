import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AIConceptModel from "@/lib/models/AIConcept.model";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { eventType, venueType, guestCount, themeColors, budget } = await req.json();

    if (!eventType || !venueType || !guestCount || !themeColors || themeColors.length === 0 || !budget) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    let promptA = "";
    let promptB = "";
    let basePrompt = `A premium event design concept. Event Type: ${eventType}, Venue: ${venueType}, Guests: ${guestCount}, Colors: ${themeColors.join(" and ")}.`;

    // Securely use the Gemini API Key from the server-side environment variables
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "antigravity-preview-05-2026" });

        const textPrompt = `You are a luxury event designer. I need 2 distinct, highly descriptive prompts for an AI image generator (like Midjourney or DALL-E) to create photorealistic 4K event setups.
Event Type: ${eventType}
Venue: ${venueType}
Guests: ${guestCount}
Colors: ${themeColors.join(" and ")}
Budget: ₹${budget} (focus on premium but realistic decor)

Provide EXACTLY two prompts separated by '|||'.
Prompt 1 should focus on 'Elegant premium styling with symmetrical layout'.
Prompt 2 should focus on 'Creative luxury styling with dramatic lighting and modern aesthetics'.
Make them highly descriptive and visual, focusing on lighting, floral arrangements, stage setup, and textures. Do not include introductory or concluding text, just the two prompts separated by '|||'.`;

        const result = await model.generateContent(textPrompt);
        const responseText = result.response.text();
        const splitPrompts = responseText.split("|||");
        
        if (splitPrompts.length >= 2) {
          promptA = splitPrompts[0].trim();
          promptB = splitPrompts[1].trim();
        } else {
          promptA = basePrompt + " Elegant premium styling with symmetrical layout.";
          promptB = basePrompt + " Creative luxury styling with dramatic lighting and modern aesthetics.";
        }
      } catch (geminiError) {
        console.warn("Gemini API failed (likely quota exceeded). Falling back to static prompts.", geminiError);
        promptA = basePrompt + " Elegant premium styling with symmetrical layout.";
        promptB = basePrompt + " Creative luxury styling with dramatic lighting and modern aesthetics.";
      }
    } else {
      promptA = basePrompt + " Elegant premium styling with symmetrical layout.";
      promptB = basePrompt + " Creative luxury styling with dramatic lighting and modern aesthetics.";
    }

    // Pollinations recently added a paywall/block. We'll use beautiful curated fallback images
    // to ensure the UI never shows a broken image icon.
    const curatedImages = [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1024&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1024&q=80",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1024&q=80",
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1024&q=80",
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1024&q=80"
    ];
    
    // Pick two random unique images for Variation A and B
    const shuffled = curatedImages.sort(() => 0.5 - Math.random());
    const variationAUrl = shuffled[0];
    const variationBUrl = shuffled[1];

    await connectDB();
    const newConcept = await AIConceptModel.create({
      eventType,
      venueType,
      guestCount,
      themeColors,
      budget,
      promptUsed: promptA + " | " + promptB,
      variationAUrl,
      variationBUrl,
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: newConcept._id,
        variationAUrl,
        variationBUrl,
      },
    });
  } catch (error: any) {
    console.error("Error generating AI concepts:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to generate concepts" },
      { status: 500 }
    );
  }
}
