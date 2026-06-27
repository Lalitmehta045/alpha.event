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
    const body = await req.json();
    const { eventType, venueType, guestCount, themeColors, budget, selectedProducts, balloonColors, mode, productName, productDescription, productImageUrl, userCustomPrompt } = body;

    // ── Balloon Recolor Mode (simplified flow) ──
    if (mode === "balloon-recolor" && balloonColors && balloonColors.length > 0 && productName) {
      debugLog.push("MODE: balloon-recolor");

      const colorList = balloonColors.join(", ");
      const colorJoin = balloonColors.join(" and ");
      const desc = productDescription ? ` Description: ${productDescription}.` : "";
      const hasApiKey = !!process.env.OPENAI_API_KEY;

      const promptA = `Edit this balloon decoration image. Keep EVERYTHING exactly the same — the room, wall color, background, flooring, furniture, all props, butterfly decorations, arch backdrop structure and its ORIGINAL color, cylinder stand, and overall composition. ONLY recolor the BALLOONS to: ${colorList}. The arch panel, backdrop board, and all non-balloon elements must remain their original colors unchanged. Do not change any non-balloon elements. Every balloon must be ${colorJoin} colored.${userCustomPrompt ? ` Additionally, apply these custom changes to the image: ${userCustomPrompt}` : ""}`;

      debugLog.push(`PROMPT_A: ${promptA.substring(0, 150)}...`);

      // Generate single image
      let variationAUrl = "";
      let variationBUrl = "";

      if (hasApiKey && productImageUrl) {
        const generateImage = async (prompt: string, label: string) => {
          try {
            const imgRes = await fetchWithTimeout(productImageUrl, {}, 10000);
            const arrayBuffer = await imgRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const mimeType = imgRes.headers.get('content-type') || 'image/png';
            const blob = new Blob([buffer], { type: mimeType });

            const formData = new FormData();
            formData.append("image", blob, "product.png");
            formData.append("prompt", prompt);
            formData.append("model", "gpt-image-1");
            formData.append("n", "1");
            formData.append("size", "1024x1024");

            const res = await fetchWithTimeout(
              "https://api.openai.com/v1/images/edits",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                body: formData as any,
              },
              120000
            );
            const data = await res.json();
            if (data.data && data.data[0]) {
              const url = data.data[0].url || (data.data[0].b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : "");
              debugLog.push(`IMAGE_${label}_OK: URL length=${url.length}`);
              return url;
            } else {
              debugLog.push(`IMAGE_${label}_ERROR: ${JSON.stringify(data.error || data)}`);
            }
          } catch (err: any) {
            debugLog.push(`IMAGE_${label}_EXCEPTION: ${err?.message || err}`);
          }
          return "";
        };

        // Only generate Prompt A to save time and API costs
        variationAUrl = await generateImage(promptA, "A");
        variationBUrl = variationAUrl; // Duplicate for schema safety
      } else if (!productImageUrl) {
        debugLog.push("IMAGE_A_ERROR: productImageUrl is missing, cannot use edit endpoint.");
      }

      // Fallback
      if (!variationAUrl || !variationBUrl) {
        const fallbacks = [
          "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1024&q=80",
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1024&q=80",
        ];
        variationAUrl = variationAUrl || fallbacks[0];
        variationBUrl = variationBUrl || fallbacks[1];
      }

      await connectDB();
      const newConcept = await AIConceptModel.create({
        eventType: "Balloon Decoration",
        venueType: "Event Venue",
        guestCount: "50-100",
        themeColors: balloonColors,
        budget: 0,
        promptUsed: promptA,
        variationAUrl,
        variationBUrl,
      });

      return NextResponse.json({
        success: true,
        data: { _id: newConcept._id, variationAUrl, variationBUrl },
        _debug: debugLog,
      });
    }

    // ── Original Event Architect Mode ──
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

    // Balloon-specific color enhancement
    let balloonColorInstruction = "";
    if (eventType === "Balloon Decoration" && balloonColors && balloonColors.length > 0) {
      balloonColorInstruction = `CRITICAL REQUIREMENT: The decoration MUST prominently feature balloons in these EXACT colors: ${balloonColors.join(", ")}. The balloons should be the dominant visual element. Show balloon arches, bouquets, garlands, and clusters all in ${balloonColors.join(" and ")} colors. Every balloon visible must be one of these colors.`;
      basePrompt += ` ${balloonColorInstruction}`;
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
${balloonColorInstruction ? `\nBALLOON COLOR REQUIREMENT: ${balloonColorInstruction}` : ""}

Provide EXACTLY two prompts separated by '|||'.
Prompt 1 should focus on a symmetrical layout incorporating the Required Scale/Style.
Prompt 2 should focus on creative or dramatic lighting incorporating the Required Scale/Style.
Make them highly descriptive and visual, focusing on lighting, ${eventType === "Balloon Decoration" ? "balloon arrangements, balloon arches, balloon bouquets," : "floral arrangements,"} stage setup, and textures. STRICTLY ensure the grandeur matches the Required Scale/Style. Do not include introductory or concluding text, just the two prompts separated by '|||'.`;

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

        // Only generate Prompt A to save time
        variationAUrl = await generateImage(promptA, "A");
        variationBUrl = variationAUrl; // Duplicate for schema safety
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
