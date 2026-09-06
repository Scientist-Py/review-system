/**
 * Review generation service powered by NVIDIA NIM (build.nvidia.com).
 * Default Model: meta/llama-3.3-70b-instruct
 * Includes local procedural fallback engine for 100% offline/keyless reliability.
 */

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const DEFAULT_MODEL = "meta/llama-3.2-90b-vision-instruct";

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
    : "overall dining experience";

  const companionContext = companions 
    ? `Customer visited with: ${companions}`
    : "General customer visit";

  // Inject user approved examples for few-shot learning
  let learningBlock = "";
  if (userApprovedExamples && userApprovedExamples.length > 0) {
    learningBlock = `\nLEARN FROM USER PREFERRED STYLES:
${userApprovedExamples.slice(-3).map((ex, idx) => `Example ${idx + 1}: ${ex}`).join("\n")}
`;
  }

  // Construct Google Maps SEO optimized prompt
  const systemPrompt = `You are a helpful customer review assistant for "Chapter One Cafe" in Baghpat.
Your goal is to write 1 realistic, authentic customer Google Maps review that boosts the cafe's local search ranking on Google Maps and Search.

ABSOLUTE REALISM RULES:
* The review must sound like a real person writing a quick Google review on their phone, NOT like marketing copy or AI.
* Length: 15 to 35 words (1 to 2 short sentences). Keep it concise, punchy, and natural.
* No quotation marks, no emojis, no hashtags, no bullet points, no corporate words ("moreover", "delightful", "impeccable", "culinary", "highly recommend").
* Avoid repeating cliché phrases like "bhot accha", "nice spot", "hangout" constantly. Use varied, fresh vocabulary.

GOOGLE LOCAL SEO RULES:
* Naturally weave in local search keywords when appropriate: "best cafe in Baghpat", "best food in Baghpat", "pizza in Baghpat", "family cafe", "cafe near bypass".
* Only mention Baghpat explicitly in about 30% of reviews. In others, use "this place", "here", "this cafe".
* Blend in dishes selected (${itemsList}) and companion context (${companions || "general"}).

LANGUAGE RULES:
* If English: Natural conversational Indian English.
* If Hinglish: Natural conversational Hinglish (Hindi written in English letters, e.g. "Pizza expected se better tha aur service bhi quick thi").

OUTPUT FORMAT:
Return ONLY the raw review text string. No quotes, no preamble, no explanations.`;

  const userPrompt = `Generate a review for:
- Dishes/Items: ${itemsList}
- Visit Type: ${companionContext}
- Star Rating: ${experienceRating}/5
- Language: ${language}
- Tone: ${writingTone}
${learningBlock}`;

  // If NVIDIA API key is available, call NVIDIA NIM API
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
          temperature: 0.7,
          top_p: 0.9,
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
        console.warn("NVIDIA NIM API error status:", response.status);
      }
    } catch (error) {
      console.error("NVIDIA NIM API call failed, falling back to local generator:", error);
    }
  }

  // Fallback to local high-speed procedural generator
  const fallbackText = generateFallbackReview({
    selectedItems,
    companions,
    experienceRating,
    writingTone,
    language,
    userApprovedExamples
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
    .replace(/^["']|["']$/g, "") // Remove wrapping quotes
    .replace(/["'"]/g, "")
    .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "") // Emojis
    .replace(/#\w+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Local fallback review generator with companion and dish awareness.
 */
function generateFallbackReview({
  selectedItems = [],
  companions = "",
  language = "English"
}) {
  const selectRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const isHinglish = language === "Hinglish";

  const nameOptions = isHinglish 
    ? ["Chapter One Cafe", "ye cafe", "ye place", "Baghpat mein ye spot"]
    : ["Chapter One Cafe", "this cafe", "this place", "one of the best cafes in Baghpat"];
  const name = Math.random() < 0.35 ? nameOptions[0] : selectRandom(nameOptions.slice(1));

  // Companion openers
  const companionStarters = {
    "Friends": isHinglish
      ? [`Friends ke sath ${name} gaye the.`, `Doston ke sath aane ke liye sahi jagah hai.`, `Friends outing ke liye badhiya spot.`]
      : [`Visited ${name} with friends.`, `Great place to hang out with friends in Baghpat.`, `Had a fun time with friends here.` ],
    "Family": isHinglish
      ? [`Family ke sath dinner ke liye gaye the.`, `Family ke sath aane ke liye clean aur calm jagah hai.`, `Baghpat mein family ke liye best cafe.`]
      : [`Visited with family for a meal.`, `Best family cafe in Baghpat with peaceful vibe.`, `Great food place to visit with family.` ],
    "Solo": isHinglish
      ? [`Quick coffee break ke liye ${name} sahi laga.`, `Quiet aur relaxing place hai.`, `Solo visit ke liye perfect spot.`]
      : [`Perfect quiet spot for a quick bite.`, `Really enjoyed my coffee and quick service here.`, `Relaxing place to sit and enjoy food.` ],
    "Partner / Date": isHinglish
      ? [`Cozy ambience aur comfortable seating hai.`, `Vibe kafi romantic aur pleasant hai.`, `Shaam ko aane ke liye best spot.`]
      : [`Cozy ambiance and comfortable seating.`, `Lovely atmosphere and delicious food.`, `One of the best cozy spots in Baghpat.` ]
  };

  const defaultStarters = isHinglish
    ? [`${name} kafi sahi laga.`, `Baghpat mein badhiya food place hai.`, `Food quality aur service dono achhi thi.`, `Garam khana aur fast service mili.`]
    : [`Great food and quick service at ${name}.`, `One of the best food places in Baghpat.`, `Really liked the food quality here.`, `Clean cafe and great service.`];

  // Dish-specific sentences
  const dishPhrases = {
    "Pizza": isHinglish 
      ? ["Pizza super cheesy tha aur toppings mast thi.", "Garam pizza kafi tasty laga.", "Pizza expected se badhiya nikla."]
      : ["Pizza was hot, cheesy, and loaded with toppings.", "Best pizza in Baghpat, portion size is great.", "Loved the fresh crust and cheese on the pizza."],
    "Cold Coffee": isHinglish
      ? ["Cold coffee chilled aur refreshing thi.", "Coffee ki sweetness ekdum balanced thi.", "Maza aa gaya cold coffee pee kar."]
      : ["Cold coffee was chilled, sweet, and refreshing.", "Refreshing cold coffee, perfect taste.", "Loved the cold coffee, highly recommended."],
    "Burger": isHinglish
      ? ["Burger kafi fresh aur filling tha.", "Burger ka bun soft aur tasty tha."]
      : ["Burger was fresh, juicy, and very filling.", "Really liked the burger portion and taste."],
    "Momos": isHinglish
      ? ["Garam garam momos kafi delicious the.", "Wheat momos ka taste bahut sahi tha."]
      : ["Momos were served hot with delicious stuffing.", "Wheat momos tasted fresh and healthy."],
    "Pasta": isHinglish
      ? ["Creamy pasta kafi flavorful tha.", "Pasta ka portion aur taste dono badhiya the."]
      : ["Pasta was creamy, hot, and full of flavor.", "Delicious pasta with great seasoning."],
    "Sandwich": isHinglish
      ? ["Grilled sandwich fresh aur crispy tha.", "Sandwich filling kafi tasty thi."]
      : ["Sandwich was crispy, fresh, and filling.", "Loved the fresh ingredients in the sandwich."],
    "French Fries": isHinglish
      ? ["French fries ekdum crispy aur hot the.", "Crispy fries ke sath cold coffee best combo hai."]
      : ["French fries were perfectly salted and crispy.", "Crispy hot fries served promptly."],
    "Staff": isHinglish
      ? ["Staff polite tha aur service fast mili.", "Service kafi quick aur smooth thi."]
      : ["Staff was polite and service was very prompt.", "Quick serving time and helpful staff."],
    "Ambience": isHinglish
      ? ["Seating comfortable thi aur vibe relaxed tha.", "Interior aur seating arrangement kafi achha hai."]
      : ["Comfortable seating and relaxing background music.", "Cozy atmosphere and neat setup."],
    "Cleanliness": isHinglish
      ? ["Cafe ekdum clean aur hygienic setup tha.", "Tables neat aur well maintained the."]
      : ["Cafe is spotless and well maintained.", "Very hygienic and tidy dining environment."]
  };

  const starter = companions && companionStarters[companions]
    ? selectRandom(companionStarters[companions])
    : selectRandom(defaultStarters);

  let dishLines = [];
  if (selectedItems && selectedItems.length > 0) {
    selectedItems.forEach(item => {
      if (dishPhrases[item]) {
        dishLines.push(selectRandom(dishPhrases[item]));
      }
    });
  }

  let finalSentences = [starter];
  if (dishLines.length > 0) {
    finalSentences.push(dishLines[0]);
    if (dishLines[1] && Math.random() > 0.5) {
      finalSentences.push(dishLines[1]);
    }
  } else {
    const genericEnding = isHinglish
      ? ["Dobara zaroor aayenge.", "Overall maza aa gaya.", "Worth visiting place hai."]
      : ["Will definitely visit again.", "Overall a great experience.", "Worth trying out."];
    finalSentences.push(selectRandom(genericEnding));
  }

  let review = finalSentences.join(" ").replace(/\s+/g, " ").trim();
  if (!review.endsWith(".") && !review.endsWith("!")) {
    review += ".";
  }
  return cleanGeneratedText(review);
}
