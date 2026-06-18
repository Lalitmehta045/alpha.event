import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AIConceptModel from "@/lib/models/AIConcept.model";

// Allow up to 120 seconds for this route (for VPS/serverless platforms)
export const maxDuration = 120;

// Helper: fetch with timeout using AbortController
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: Request) {
  const debugLog: string[] = [];
  try {
    const { eventType, venueType, guestCount, themeColors, budget, selectedProducts } = await req.json();

    if (!eventType || !venueType || !guestCount || !themeColors || themeColors.length === 0 || !budget) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    let promptA = "";
    let promptB = "";
    let basePrompt = `A premium event design concept. Event Type: ${eventType}, Venue: ${venueType}, Guests: ${guestCount}, Colors: ${themeColors.join(" and ")}.`;
    if (selectedProducts) {
      basePrompt += ` The design must strongly feature these specific products/elements: ${selectedProducts}.`;
    }

    let budgetStyle = "";
    if (budget < 50000) {
      budgetStyle = "Minimalistic, elegant, intimate, and cost-effective. Focus on simple focal points, fairy lights, and tasteful but limited floral arrangements. Avoid grand chandeliers or massive structures.";
    } else if (budget < 150000) {
      budgetStyle = "Premium and sophisticated. Rich floral centerpieces, elegant draping, professional ambient lighting, and modern stylish decor.";
    } else {
      budgetStyle = "Lavish, opulent, and ultra-luxury. Massive floral ceiling installations, crystal chandeliers, grand architectural elements, and extravagant detailing.";
    }

    // Step 1: Generate smart prompts using GPT (with 15s timeout)
    const hasApiKey = !!process.env.OPENAI_API_KEY;
    debugLog.push(`API_KEY_EXISTS: ${hasApiKey}`);

    if (hasApiKey) {
      debugLog.push(`API_KEY_PREFIX: ${process.env.OPENAI_API_KEY!.substring(0, 7)}...`);
      try {
        const textPrompt = `You are an expert event designer. I need 2 distinct, highly descriptive prompts for an AI image generator (like DALL-E) to create photorealistic 4K event setups.
Event Type: ${eventType}
Venue: ${venueType}
Guests: ${guestCount}
Colors: ${themeColors.join(" and ")}
Budget: ₹${budget}
Required Scale/Style Based on Budget: ${budgetStyle}
${selectedProducts ? `Specific Elements to Feature: ${selectedProducts}` : ""}

Provide EXACTLY two prompts separated by '|||'.
Prompt 1 should focus on a symmetrical layout incorporating the Required Scale/Style.
Prompt 2 should focus on creative or dramatic lighting incorporating the Required Scale/Style.
Make them highly descriptive and visual, focusing on lighting, floral arrangements, stage setup, and textures. STRICTLY ensure the grandeur matches the Required Scale/Style. Do not include introductory or concluding text, just the two prompts separated by '|||'.`;

        const chatRes = await fetchWithTimeout(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [{ role: "user", content: textPrompt }],
              temperature: 0.7,
            }),
          },
          15000 // 15 second timeout for text generation
        );

        const chatData = await chatRes.json();

        if (chatData.choices && chatData.choices[0]) {
          const responseText = chatData.choices[0].message.content;
          const splitPrompts = responseText.split("|||");

          if (splitPrompts.length >= 2) {
            promptA = splitPrompts[0].trim();
            promptB = splitPrompts[1].trim();
          }
        }
      } catch (promptErr: any) {
        const errMsg = promptErr?.message || String(promptErr);
        debugLog.push(`PROMPT_GEN_ERROR: ${errMsg}`);
        console.warn("OpenAI prompt generation failed/timed out, using fallbacks.", errMsg);
      }
    } else {
      debugLog.push("NO_API_KEY: Skipping OpenAI calls");
      console.warn("OPENAI_API_KEY is not set. Using fallback prompts and images.");
    }

    if (!promptA || !promptB) {
      promptA = basePrompt + " Elegant premium styling with symmetrical layout, highly detailed, photorealistic.";
      promptB = basePrompt + " Creative luxury styling with dramatic lighting and modern aesthetics, photorealistic.";
    }

    // Step 2: Generate images with DALL-E 3 (with 40s timeout per image)
    let variationAUrl = "";
    let variationBUrl = "";

    if (hasApiKey) {
      try {
        debugLog.push("STARTING_IMAGE_GEN");
        console.log("Generating images with OpenAI DALL-E 3...");

        // Generate images concurrently to reduce total time
        const generateImage = async (prompt: string, label: string) => {
          try {
            const res = await fetchWithTimeout(
              "https://api.openai.com/v1/images/generations",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                  model: "gpt-image-2",
                  prompt: prompt,
                  n: 1,
                  size: "1024x1024",
                  quality: "auto",
                }),
              },
              120000 // 120 second timeout per image
            );

            const data = await res.json();
            if (data.data && data.data[0]) {
              const url = data.data[0].url || (data.data[0].b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : "");
              debugLog.push(`IMAGE_${label}_OK: URL length=${url.length}`);
              return url;
            } else {
              const errDetail = JSON.stringify(data.error || data);
              debugLog.push(`IMAGE_${label}_ERROR: ${errDetail}`);
              console.error(`OpenAI Error ${label}:`, errDetail);
            }
          } catch (err: any) {
            debugLog.push(`IMAGE_${label}_EXCEPTION: ${err?.message || err}`);
            console.error(`Image ${label} generation failed/timed out:`, err?.message || err);
          }
          return "";
        };

        const [urlA, urlB] = await Promise.all([
          generateImage(promptA, "A"),
          generateImage(promptB, "B")
        ]);

        variationAUrl = urlA;
        variationBUrl = urlB;

      } catch (err: any) {
        console.error("Failed to generate images with OpenAI:", err?.message || err);
      }
    }

    // Fallback if OpenAI key is missing or request failed/timed out
    if (!variationAUrl || !variationBUrl) {
      debugLog.push(`USING_FALLBACK: A=${!variationAUrl}, B=${!variationBUrl}`);
      console.warn("Using fallback images for missing variations...");
      const curatedImages = [
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1024&q=80",
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1024&q=80",
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1024&q=80",
        "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1024&q=80",
        "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1024&q=80"
      ];

      const shuffled = curatedImages.sort(() => 0.5 - Math.random());
      variationAUrl = variationAUrl || shuffled[0];
      variationBUrl = variationBUrl || shuffled[1];
    }

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
      _debug: debugLog,
    });
  } catch (error: any) {
    console.error("Error generating AI concepts:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to generate concepts" },
      { status: 500 }
    );
  }
}
