import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AIConceptModel from "@/lib/models/AIConcept.model";

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

    let budgetStyle = "";
    if (budget < 50000) {
      budgetStyle = "Minimalistic, elegant, intimate, and cost-effective. Focus on simple focal points, fairy lights, and tasteful but limited floral arrangements. Avoid grand chandeliers or massive structures.";
    } else if (budget < 150000) {
      budgetStyle = "Premium and sophisticated. Rich floral centerpieces, elegant draping, professional ambient lighting, and modern stylish decor.";
    } else {
      budgetStyle = "Lavish, opulent, and ultra-luxury. Massive floral ceiling installations, crystal chandeliers, grand architectural elements, and extravagant detailing.";
    }

    if (process.env.OPENAI_API_KEY) {
      try {
        const textPrompt = `You are an expert event designer. I need 2 distinct, highly descriptive prompts for an AI image generator (like DALL-E) to create photorealistic 4K event setups.
Event Type: ${eventType}
Venue: ${venueType}
Guests: ${guestCount}
Colors: ${themeColors.join(" and ")}
Budget: ₹${budget}
Required Scale/Style Based on Budget: ${budgetStyle}

Provide EXACTLY two prompts separated by '|||'.
Prompt 1 should focus on a symmetrical layout incorporating the Required Scale/Style.
Prompt 2 should focus on creative or dramatic lighting incorporating the Required Scale/Style.
Make them highly descriptive and visual, focusing on lighting, floral arrangements, stage setup, and textures. STRICTLY ensure the grandeur matches the Required Scale/Style. Do not include introductory or concluding text, just the two prompts separated by '|||'.`;

        const chatRes = await fetch("https://api.openai.com/v1/chat/completions", {
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
        });

        const chatData = await chatRes.json();
        
        if (chatData.choices && chatData.choices[0]) {
          const responseText = chatData.choices[0].message.content;
          const splitPrompts = responseText.split("|||");
          
          if (splitPrompts.length >= 2) {
            promptA = splitPrompts[0].trim();
            promptB = splitPrompts[1].trim();
          }
        }
      } catch (promptErr) {
        console.warn("OpenAI prompt generation failed, using fallbacks.", promptErr);
      }
    }

    if (!promptA || !promptB) {
      promptA = basePrompt + " Elegant premium styling with symmetrical layout, highly detailed, photorealistic.";
      promptB = basePrompt + " Creative luxury styling with dramatic lighting and modern aesthetics, photorealistic.";
    }

    let variationAUrl = "";
    let variationBUrl = "";

    if (process.env.OPENAI_API_KEY) {
      try {
        console.log("Generating live images with OpenAI DALL-E 3...");
        const [resA, resB] = await Promise.all([
          fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: "gpt-image-2",
              prompt: promptA,
              n: 1,
              size: "1024x1024",
            }),
          }),
          fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: "gpt-image-2",
              prompt: promptB,
              n: 1,
              size: "1024x1024",
            }),
          }),
        ]);

        const dataA = await resA.json();
        const dataB = await resB.json();

        if (dataA.data && dataA.data[0]) {
          variationAUrl = dataA.data[0].url || (dataA.data[0].b64_json ? `data:image/png;base64,${dataA.data[0].b64_json}` : "");
        }
        if (dataB.data && dataB.data[0]) {
          variationBUrl = dataB.data[0].url || (dataB.data[0].b64_json ? `data:image/png;base64,${dataB.data[0].b64_json}` : "");
        }

        if (!variationAUrl) console.error("OpenAI Error A:", dataA.error || "No URL or b64_json returned");
        if (!variationBUrl) console.error("OpenAI Error B:", dataB.error || "No URL or b64_json returned");

      } catch (err) {
        console.error("Failed to generate images with OpenAI:", err);
      }
    }

    // Fallback if OpenAI key is missing or request failed
    if (!variationAUrl || !variationBUrl) {
      console.warn("Using fallback images...");
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
    });
  } catch (error: any) {
    console.error("Error generating AI concepts:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to generate concepts" },
      { status: 500 }
    );
  }
}
