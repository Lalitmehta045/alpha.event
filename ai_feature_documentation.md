# AI Balloon Color Studio Feature Documentation

This document explains the architecture and flow of the "AI Balloon Color Studio" feature in our Next.js application.

## Overview
The feature allows users to select a balloon decoration product from the catalog, pick up to 5 custom pastel colors, and use AI to generate a photorealistic preview of that exact product using the new colors.

It relies on a two-step AI pipeline:
1. **Google Gemini (Vision)**: Analyzes the original product image and extracts structural layout.
2. **OpenAI DALL-E 3**: Reconstructs the image using the structural layout but strictly enforcing the user's custom balloon colors.

---

## 1. Frontend Implementation (`AIPlannerModal.tsx`)
**Location:** `src/components/common/aiPlanner/AIPlannerModal.tsx`

### Key Components & State
- **Floating Button:** A dynamic animated button ("Alpha Magic AI Planner") fixed to the bottom right of the screen.
- **Modal Multi-Step Flow:**
  - **Step 1: Product Selection** 
    - Filters Redux store products to only show those where category or name includes "balloon".
    - Uses pagination (8 items per page).
  - **Step 2: Color Selection**
    - Users can select 1 to 5 colors from a predefined `BALLOON_COLORS` list (Pastel Pink, Pastel Blue, Gold, Silver, etc.).
  - **Step 3: Loading / Processing**
    - Displays a scanning animation over the original product image and loops through loading texts.
  - **Step 4: Result Display**
    - Shows the DALL-E generated image.
    - Provides a WhatsApp **Enquire** button that pre-fills a message containing the Concept ID, Product Name, Colors, and a link to the image (`/api/concept-image/[id]?opt=A`).
    - Provides Lightbox View and Download functionalities.

### API Call
Makes a POST request to `/api/ai/generate-event-image` with:
- `mode: "balloon-recolor"`
- `productName`, `productDescription`, `productImageUrl`
- `balloonColors` (array of selected color names)
- Legacy fields (`eventType`, `venueType`, etc.) to maintain schema compatibility.

---

## 2. Backend API Route (`route.ts`)
**Location:** `src/app/api/ai/generate-event-image/route.ts`

### The AI Pipeline (`mode === "balloon-recolor"`)
The route is configured to allow a `maxDuration` of 120 seconds. 

#### Step 2.1: Image Analysis with Google Gemini
- Uses `gemini-2.5-flash` via `@google/generative-ai`.
- Fetches the `productImageUrl` and converts it to a base64 buffer.
- **Prompt Logic:** Instructs Gemini to act as a DALL-E prompt engineer. It must describe the background, room, furniture, and balloon arrangements exactly as they appear in the original image, but **replace** the balloon colors with the user's selected colors (e.g., "Pastel Pink and Gold"). It is strictly told NOT to mention original colors.
- If Gemini succeeds, it outputs a highly targeted `layoutDescription`.

#### Step 2.2: Image Generation with OpenAI DALL-E 3
- Uses the `layoutDescription` (from Gemini) as the prompt for DALL-E 3.
- *Fallback:* If Gemini fails or `productImageUrl` is missing, it falls back to a template string: `"A stunning, photorealistic image of a premium balloon decoration arrangement called [Name]... ALL balloons MUST be in these EXACT pastel colors: [Colors]..."*
- Calls OpenAI's `/v1/images/generations` with `model: "gpt-image-2"` (which maps to DALL-E 3 in this codebase logic), requesting a `1024x1024` image.

#### Step 2.3: Database Persistence
- Uses Mongoose model `AIConceptModel` to save the generation details.
- Saves `promptUsed`, `variationAUrl`, `variationBUrl` (duplicated), and the requested colors.
- Returns the MongoDB `_id` and the generated image URLs back to the frontend.

### Fallbacks
- If OpenAI or Gemini keys are missing, or API calls fail/timeout, the code elegantly falls back to curated Unsplash images to prevent app crashes and ensure the user still sees a result.

---

## Environment Variables Required
- `GEMINI_API_KEY`: For Google Gemini 2.5 Flash vision analysis.
- `OPENAI_API_KEY`: For DALL-E 3 image generation.
- `MONGODB_URI`: For database persistence.
