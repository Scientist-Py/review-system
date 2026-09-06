/**
 * Review generation service powered by NVIDIA NIM (build.nvidia.com).
 * Features deep diversity engineering to ensure 100% unique, randomized openings.
 */

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const DEFAULT_MODEL = "meta/llama-3.2-90b-vision-instruct";

// Random perspective angles to guarantee completely diverse sentence structures
const DIVERSITY_ANGLES = [
  "Focus on specific dish taste & texture",
  "Focus on quick serving time and staff courtesy",
  "Focus on relaxing atmosphere & comfortable seating",
  "Focus on portion size and value for money",
  "Focus on casual evening snack or coffee break",
  "Focus on group gathering and sharing food",
  "Focus on pleasant surprise about local food quality",
  "Focus on clean tables and peaceful environment",
  "Focus on how hot/fresh the food was served",
  "Focus on a recommendation for first-time visitors"
];

export async function generateReviewDraft({
  selectedItems = [],
  companions = "",
  experienceRating = 5,
  writingTone = "Casual",
  language = "English",
  userApprovedExamples = []
}) {
  const apiKey = import.meta.env.VITE_NVIDIA_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
  const model = import.meta.env.VITE_NVIDIA_MODEL || DEFAULT_MODEL;

  const itemsList = selectedItems && selectedItems.length > 0 
    ? selectedItems.join(", ") 
    : "overall cafe experience";

  const companionContext = companions 
    ? `Visited with: ${companions}` 
    : "General visit";

  const chosenAngle = DIVERSITY_ANGLES[Math.floor(Math.random() * DIVERSITY_ANGLES.length)];

  // Inject user approved examples for few-shot learning
  let learningBlock = "";
  if (userApprovedExamples && userApprovedExamples.length > 0) {
    learningBlock = `\nSTYLE PREFERENCE EXAMPLES:
${userApprovedExamples.slice(-3).map((ex, idx) => `Example ${idx + 1}: ${ex}`).join("\n")}
`;
  }

  // Construct Google Maps SEO & Anti-Repetition Prompt
  const systemPrompt = `You are a real customer writing a 1-sentence or 2-sentence review for "Chapter One Cafe" on Google Maps.

CRITICAL VARIETY & OPENING RULES:
* NEVER start reviews with the same predictable words (DO NOT start with "Garam", "Food", "Best", "Clean", "Visited", "Great", "Nice", "This").
* Start with something completely random: dish names, time of day, a quick reaction, an honest observation, speed of service, or conversation with friends.
* Review Angle for this review: ${chosenAngle}
* Length: 15 to 35 words. Simple, punchy, spoken language.
* No quotation marks, no emojis, no hashtags, no robotic/marketing copy.

GOOGLE LOCAL SEO RULES:
* Mention items selected: ${itemsList}.
* Include companion context naturally if given: ${companionContext}.
* Only mention "Baghpat" in approximately 25% of reviews naturally (e.g. "good food in Baghpat", "one of the top spots in Baghpat").

LANGUAGE INSTRUCTION:
* If English: Natural conversational Indian English.
* If Hinglish: Natural casual Hinglish (Hindi words written in English alphabet, e.g. "Pizza ka crust kafi soft tha aur cold coffee chilled mili.").

OUTPUT:
Return ONLY the review text.`;

  const userPrompt = `Write a completely unique review.
Items: ${itemsList}
Companion: ${companionContext}
Language: ${language}
Tone: ${writingTone}
Rating: ${experienceRating}/5
${learningBlock}`;

  // If NVIDIA API key is available, call NVIDIA NIM
  if (apiKey && apiKey.trim() !== "" && !apiKey.startsWith("YOUR_")) {
    try {
      const response = await fetch(NVIDIA_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.88,
          top_p: 0.95,
          max_tokens: 120
        })
      });

      if (response.ok) {
        const data = await response.json();
        let text = data?.choices?.[0]?.message?.content;
        if (text) {
          text = cleanGeneratedText(text);
          if (text.length > 8) {
            return {
              text: text.trim(),
              source: "nvidia-nim",
              modelUsed: model
            };
          }
        }
      } else {
        console.warn("NVIDIA NIM API response status:", response.status);
      }
    } catch (error) {
      console.error("NVIDIA NIM API failed, using diversified local generator:", error);
    }
  }

  // Fallback to local randomized generator
  const fallbackText = generateDiverseFallbackReview({
    selectedItems,
    companions,
    language
  });

  return {
    text: fallbackText,
    source: "fallback"
  };
}

/**
 * Removes emojis, hashtags, quotation marks, and extra whitespace.
 */
function cleanGeneratedText(text) {
  if (!text) return "";
  return text
    .replace(/^["'“”]|["'“”]$/g, "")
    .replace(/["'“”]/g, "")
    .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "")
    .replace(/#\w+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Fully randomized local review generator with 8 distinct structural archetypes
 * so opening words and sentence shapes NEVER sound the same.
 */
function generateDiverseFallbackReview({
  selectedItems = [],
  companions = "",
  language = "English"
}) {
  const selectRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const isHinglish = language === "Hinglish";

  // Randomized dish specifics
  const dishes = selectedItems.length > 0 ? selectedItems : ["Pizza", "Cold Coffee"];
  const primaryDish = dishes[0] || "Pizza";
  const secondaryDish = dishes[1] || "Cold Coffee";

  if (isHinglish) {
    // 8 completely distinct Hinglish structural styles
    const hinglishTemplates = [
      // Style 1: Dish detail first
      `${primaryDish} ka taste expected se kafi behtar tha, aur ${secondaryDish} bhi ekdum chilled serve ki. Service kafi quick mili.`,
      // Style 2: Companion / evening timing first
      `Shaam ko ${companions ? companions.toLowerCase() + ' ke sath' : 'friends ke sath'} snacks ke liye stop kiya tha. ${primaryDish} ekdum fresh aur cheesy tha.`,
      // Style 3: Casual conversational reaction
      `Order 10 minute mein table pe aa gaya. ${primaryDish} aur ${secondaryDish} dono ka combination mast tha, dobara aane layak jagah hai.`,
      // Style 4: Local discovery / surprise
      `Baghpat mein itna achha cafe aur fresh ${primaryDish} expect nahi kiya tha. Seating kafi comfortable hai.`,
      // Style 5: Ambience and vibe first
      `Peaceful environment aur polite staff. ${primaryDish} garam aur tasty serve kiya, maza aa gaya.`,
      // Style 6: Simple and direct recommendation
      `${primaryDish} zaroor try karna yahan ka. Cheesy base aur balanced flavors the. Helpful staff overall.`,
      // Style 7: Portion & Value observation
      `Portion size aur pricing bilkul sahi hai. ${primaryDish} aur ${secondaryDish} dono badhiya the.`,
      // Style 8: Calm visit
      `Bina rush ke aaram se baithne ki achhi jagah hai. ${primaryDish} kafi tasty nikla, definitely 5 stars.`
    ];
    return selectRandom(hinglishTemplates);
  } else {
    // 8 completely distinct English structural styles
    const englishTemplates = [
      // Style 1: Dish taste first
      `The ${primaryDish.toLowerCase()} was loaded with toppings and baked to perfection. Paired it with ${secondaryDish.toLowerCase()} which was super refreshing.`,
      // Style 2: Companion / Timing first
      `Stopped by ${companions ? 'with ' + companions.toLowerCase() : 'with friends'} for evening snacks. The ${primaryDish.toLowerCase()} was served hot and tasted delicious.`,
      // Style 3: Fast service observation
      `Super quick table service and polite staff. Loved the taste of the ${primaryDish.toLowerCase()}, definitely coming back again.`,
      // Style 4: Local destination angle
      `A fantastic food spot in Baghpat. The ${primaryDish.toLowerCase()} and overall atmosphere exceeded expectations.`,
      // Style 5: Cozy atmosphere first
      `Cozy seating layout with relaxing vibes. The ${primaryDish.toLowerCase()} was fresh and flavorful.`,
      // Style 6: Direct recommendation
      `Highly recommend trying their ${primaryDish.toLowerCase()}. Great crust, fresh ingredients, and polite service.`,
      // Style 7: Value & portion angle
      `Generous portions and very reasonable pricing. The ${primaryDish.toLowerCase()} was filling and delicious.`,
      // Style 8: Overall pleasant experience
      `Quiet and comfortable place to spend quality time. The ${primaryDish.toLowerCase()} was delicious and served on time.`
    ];
    return selectRandom(englishTemplates);
  }
}
