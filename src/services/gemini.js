import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generates three review drafts (Quick, Normal, Detailed) in a single call using Gemini JSON mode or a local fallback.
 */
export async function generateReviewDraft({
  selectedItems,
  experienceRating,
  writingTone,
  language = "English",
  userApprovedExamples = []
}) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const itemsList = selectedItems && selectedItems.length > 0 
    ? selectedItems.join(", ") 
    : "overall experience";

  // Inject user approved examples for few-shot learning
  let learningBlock = "";
  if (userApprovedExamples && userApprovedExamples.length > 0) {
    learningBlock = `\nLEARN FROM USER PREFERENCES (Few-shot learning):
Here are examples of previous reviews edited and approved by users at this cafe. Study their tone, style, and structure, and draft new ones reflecting this preferred style:
${userApprovedExamples.slice(-3).map((ex, idx) => `Preference Example ${idx + 1}: ${ex}`).join("\n")}
`;
  }

  // Construct personalities list and select one randomly
  const personalities = [
    "College student", "Family visitor", "Food lover", "Working professional",
    "First-time customer", "Regular customer", "Friends group visitor",
    "Quick coffee visitor", "Evening diner", "Weekend visitor"
  ];
  const chosenPersonality = personalities[Math.floor(Math.random() * personalities.length)];

  // Construct the JSON prompt
  const prompt = `You are an expert review-writing assistant helping real restaurant customers turn their experience into natural Google review drafts.

Your task is to generate THREE realistic customer review drafts of different lengths: "quick", "normal", and "detailed".
You must return the result ONLY as a JSON object matching this schema:
{
  "quick": "A very short review (10 to 20 words, typically 1 sentence)",
  "normal": "A normal review (20 to 40 words, typically 1 to 2 sentences)",
  "detailed": "A more detailed review (40 to 60 words, typically 2 to 3 sentences)"
}

IMPORTANT GOAL:
Each review draft must feel like it was written by a genuine customer, not by AI.
It must sound like a real person writing a quick review on Google Maps, not a professional blogger or marketing agent.

ABSOLUTE RULES:
* Every review must be unique.
* Never reuse sentence structures repeatedly.
* Never use templates.
* Never sound like an advertisement or promotional/marketing copy.
* Never sound corporate or professional.
* Never use emojis.
* Never use hashtags.
* Never use bullet points.
* Never use quotation marks.
* Never mention that AI generated the review.
* Never mention discounts, rewards, gifts, offers, coupons, or incentives.
* Never force positivity.
* Match the customer's actual ratings and experience.

CRITICAL REALISM & NATURAL LANGUAGE RULES:
* DO NOT use fancy vocabulary or elaborate adjectives (like "delightful", "impeccable", "epitome", "ambassador", "savored", "mouthwatering", "nestled", "establishment", "culinary", "experience was enhanced", "highly recommend", "must-visit").
* Do NOT start reviews with: "Just dropped by", "Stopped by", "Quick stopover", "On a recent visit", "While visiting", "Decided to try", "Food enthusiast", "Visited this cafe", "Had the pleasure of visiting".
* Do NOT sound like a food blogger, travel reviewer, or marketing content.
* Avoid these forbidden words/phrases: "moreover", "furthermore", "additionally", "aesthetic details", "luxury theme", "exceptional", "outstanding", "remarkable", "highly recommended".
* Most reviews must be written in simple everyday language.
* Study these examples of natural, simple customer review styles and write in a similar tone:
  - Good food and nice ambience.
  - Pizza was really good.
  - One of the best cafes in Baghpat.
  - Cold coffee was refreshing.
  - Staff was polite and service was quick.
  - Nice place to spend time with friends.
  - The 17 inch pizza is worth trying.
  - Portion size was good.
  - Food quality was nice.
  - Clean and well maintained cafe.
  - Good family atmosphere.
  - Seating arrangement is comfortable.
  - Pizza was loaded with toppings.
  - Burger was fresh and filling.
  - Wheat momos tasted good.
  - Service was fast.
  - Nice location near bypass road.
  - Good cafe for evening snacks.
  - Prices are reasonable.
  - Good place for small parties.
  - Friends enjoyed the food.
  - Will visit again with family.
  - Worth visiting once.
  - One of the better food places in Baghpat.
  - Pizza size was impressive.
  - Food was served hot and fresh.
  - Nice experience overall.

WRITING PERSONALITIES & TONE:
- Write in this tone: ${writingTone}
- Assume this customer personality: ${chosenPersonality}

FOOD MENTION RULES:
Only mention dishes selected by the customer.
When mentioning dishes, describe them simply, like a normal person:
- Pizza: Mention size, cheese, toppings, sharing.
- 17 Inch Pizza: Mention large size, suitable for groups, loaded toppings.
- Burger: Mention freshness, soft buns, taste.
- Cold Coffee: Mention refreshing taste, balanced sweetness, chilled serving.
- Momos: Mention hot serving, stuffing, flavor.
- Wheat Momos: Mention healthy option.
- Wheat Burger: Mention healthy option.
- Pasta: Mention creamy texture, flavor.
- French Fries: Mention crispiness.
- Sandwich: Mention freshness.
- Wrap: Mention taste.

STAFF RULES:
When staff is selected:
Mention politely that service was quick, staff was helpful/friendly, or service was fast. Keep it simple.

AMBIENCE RULES:
When ambience is selected:
Mention cozy atmosphere, good seating, nice place to sit, or good vibes. Avoid flowery language.

CLEANLINESS RULES:
When cleanliness is selected:
Mention cafe was clean or tables were neat.

REALISM RULES:
Make reviews feel imperfectly human.
Not every review should be extremely enthusiastic.
Some reviews should be simple.
Some reviews should be detailed.
Some reviews should mention only one thing they liked.
Some reviews should mention two or three things.
Do not mention every selected item in every review.

ANTI-REPETITION RULES:
Avoid overusing: "Highly recommended", "Amazing experience", "Best place ever", "Must visit", "Outstanding service", "Fantastic food". Use varied alternatives naturally.

LANGUAGE RULES:
- If language is English: Use natural Indian English.
- If language is Hinglish: Use conversational Hinglish written in English letters.
Examples of natural Hinglish:
* Maza aa gaya.
* Taste kaafi accha tha.
* Pizza expected se bhi better nikla.
* Friends ke saath aane ke liye acchi jagah hai.
* Cold coffee kaafi refreshing thi.
* Service bhi kaafi smooth thi.
Do not overdo Hinglish slang.

LOCAL KEYWORDS TO RANDOMLY USE (Do not force them, keep it natural):
Baghpat, Baghpat cafe, Best cafe in Baghpat, One of the best cafes in Baghpat, Bypass road, Near bypass road, Good food in Baghpat, Pizza in Baghpat, Cafe near bypass, Family cafe, Friends hangout spot, Evening hangout, Good ambience, Clean cafe, Good service, Fresh food, Loaded pizza, Big pizza, 17 inch pizza, Cold coffee, Quick service, Friendly staff, Nice seating, Reasonable prices, Good atmosphere, Comfortable place, Quality food, Good taste, Family visit, Weekend outing, Good location.
* IMPORTANT KEYWORD CONSTRAINT: Only around 20-30% of reviews should mention Baghpat directly. Do not force keywords into every review. The review must always sound natural and customer-written.

CAFE DETAILS & BRAND NAME RULES:
- Cafe Name: Chapter One Cafe
- BRAND NAME RULE: DO NOT always mention the brand name "Chapter One Cafe" or "Chapter One Cafe Baghpat". Only mention the brand name explicitly in about 30% of reviews. In the other 70%, refer to it naturally as "this place", "this cafe", "this spot", etc.
- NO ADDRESSES RULE: Do NOT include specific address or landmark descriptions like "near Bajaj showroom", "opposite Maya Hotel", "near bypass road", or " बजाज बाईपास रोड". Keep the focus on simple customer sentiment.

CUSTOMER VISIT DATA:
- Rating: ${experienceRating}/5 stars
- Items selected: ${itemsList}
- Selected Language: ${language}
${learningBlock}

Return ONLY a valid JSON object matching the requested schema. No markdown formatting outside of JSON.`;

  // If API key is available, attempt Gemini generation
  if (apiKey && apiKey.trim() !== "" && apiKey !== "YOUR_GEMINI_API_KEY") {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      const parsed = JSON.parse(text);
      if (parsed.quick && parsed.normal && parsed.detailed) {
        return {
          quick: cleanGeneratedText(parsed.quick),
          normal: cleanGeneratedText(parsed.normal),
          detailed: cleanGeneratedText(parsed.detailed),
          source: "gemini"
        };
      }
    } catch (error) {
      console.error("Gemini API generation or JSON parsing failed, running fallback generator:", error);
    }
  }

  // Local fallback generator if API fails or is not configured
  const fallbackOptions = generateFallbackReviews({
    selectedItems,
    experienceRating,
    writingTone,
    language,
    userApprovedExamples
  });

  return {
    ...fallbackOptions,
    source: "fallback"
  };
}

/**
 * Removes emojis, hashtags, quotation marks, and leading/trailing whitespace.
 */
function cleanGeneratedText(text) {
  if (!text) return "";
  return text
    .replace(/["'"]/g, "") // Remove quotation marks
    .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "") // Remove emojis
    .replace(/#\w+/g, "") // Remove hashtags
    .trim();
}

/**
 * Local fallback review generator with English & Hinglish support and simple customer phrasing.
 */
function generateFallbackReviews({
  selectedItems,
  experienceRating,
  writingTone,
  language,
  userApprovedExamples
}) {
  const selectRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const isHinglish = language === "Hinglish";

  // Randomize cafe name mentions (Explicit vs. Generic) - NO Landmarks or Address strings
  const nameOptions = isHinglish 
    ? ["Chapter One Cafe", "ye place", "ye cafe", "ye spot"]
    : ["Chapter One Cafe", "this place", "this cafe", "this spot"];
  
  const name = Math.random() < 0.3 ? nameOptions[0] : selectRandom(nameOptions.slice(1));

  // Simple customer starters
  const englishStarters = [
    `Good place.`,
    `Nice experience at ${name}.`,
    `Really nice spot to hangout.`,
    `Tried this cafe today.`,
    `Great food and vibes.`
  ];

  const englishItemPhrases = {
    "Pizza": [
      "Pizza was really cheesy and tasty.",
      "The pizza was hot and cheesy, loved it.",
      "Good pizza size and toppings."
    ],
    "Cold Coffee": [
      "Cold coffee was refreshing and had good sweetness.",
      "Nice cold coffee, perfect taste and chilled.",
      "Cold coffee was very refreshing."
    ],
    "Burger": ["Burger was fresh and tasted nice.", "Loved the fresh burger bun and filling portion."],
    "Momos": ["Momos were hot, fresh, and tasty.", "Wheat momos tasted really good and fresh."],
    "Staff": ["Staff was polite and service was quick.", "Service was quick and staff was friendly."],
    "Ambience": ["Seating arrangement is comfortable and lighting is nice.", "Nice seating and comfortable vibe."],
    "Cleanliness": ["Cafe is clean.", "Tables were clean and the environment was tidy."]
  };

  const englishGeneralPositive = [
    "Overall experience was good.",
    "Will visit again.",
    "Nice experience overall."
  ];

  const hinglishStarters = [
    `${name} kafi badhiya spot hai.`,
    `${name} mein badhiya time spend kiya.`,
    `Baghpat mein ye cafe kafi sahi hai.`,
    `Friends ke saath hang out karne ke liye achha spot hai.`
  ];

  const hinglishItemPhrases = {
    "Pizza": [
      "Pizza ka taste expected se better tha aur size bhi bada tha.",
      "Pizza super cheesy tha aur taste next level tha.",
      "Garam pizza aur badhiya toppings, maza aa gaya."
    ],
    "Cold Coffee": [
      "Cold coffee kafi refreshing thi aur sweetness balanced thi.",
      "Cold coffee thandi aur sweet thi, perfect taste.",
      "Maza aa gaya cold coffee pee kar."
    ],
    "Burger": ["Burger kafi fresh tha, taste badhiya tha.", "Burger tasty tha."],
    "Momos": ["Momos ekdum garam aur tasty the.", "Wheat momos kafi soft aur delicious the."],
    "Staff": ["Staff polite tha aur service bhi kafi fast thi.", "Service kafi quick thi."],
    "Ambience": ["Seating comfortable thi aur vibe relaxed tha.", "Cozy vibe tha aur seating badhiya thi."],
    "Cleanliness": ["Cafe ekdum clean aur hygienic setup ke saath tha.", "Clean tables aur safai sahi thi."]
  };

  const hinglishGeneralPositive = [
    "Overall maza aa gaya.",
    "Dobara zaroor visit karenge.",
    "Nice experience tha yahan."
  ];

  const starterList = isHinglish ? hinglishStarters : englishStarters;
  const itemMap = isHinglish ? hinglishItemPhrases : englishItemPhrases;
  const generalList = isHinglish ? hinglishGeneralPositive : englishGeneralPositive;

  let start = selectRandom(starterList);
  let generalOpinion = selectRandom(generalList);

  let chosenItemPhrases = [];
  selectedItems.forEach(item => {
    if (itemMap[item]) {
      chosenItemPhrases.push(selectRandom(itemMap[item]));
    }
  });

  // Adaptive Learning: Check if we have user-approved previous sentences
  let preferredSentences = [];
  if (userApprovedExamples && userApprovedExamples.length > 0) {
    userApprovedExamples.forEach(ex => {
      const parts = ex.split(/[.!?]/).map(s => s.trim()).filter(s => s.length > 10);
      if (parts.length > 0) {
        preferredSentences.push(selectRandom(parts));
      }
    });
  }
  if (preferredSentences.length > 0 && Math.random() > 0.4) {
    chosenItemPhrases.push(selectRandom(preferredSentences));
  }

  // Simple connectors only
  const connectors = isHinglish 
    ? ["Aur", "Waise", "Saath mein"] 
    : ["Also", "Plus", "And"];

  // Generate all three lengths
  
  // 1. Quick
  let quickSentences = [start];
  if (chosenItemPhrases.length > 0) {
    quickSentences.push(chosenItemPhrases[0]);
  }
  let quick = quickSentences.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  if (!quick.endsWith(".") && !quick.endsWith("!")) quick += ".";

  // 2. Normal
  let normalSentences = [start];
  if (chosenItemPhrases.length > 0) {
    normalSentences.push(chosenItemPhrases[0]);
    if (chosenItemPhrases[1]) {
      normalSentences.push(`${selectRandom(connectors)} ${chosenItemPhrases[1].toLowerCase()}`);
    }
  } else {
    normalSentences.push(generalOpinion);
  }
  let normal = normalSentences.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  if (!normal.endsWith(".") && !normal.endsWith("!")) normal += ".";

  // 3. Detailed
  let detailedSentences = [start];
  if (chosenItemPhrases.length > 0) {
    detailedSentences.push(chosenItemPhrases[0]);
    if (chosenItemPhrases[1]) {
      detailedSentences.push(chosenItemPhrases[1]);
    }
  }
  detailedSentences.push(generalOpinion);
  let detailed = detailedSentences.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  if (!detailed.endsWith(".") && !detailed.endsWith("!")) detailed += ".";

  return {
    quick,
    normal,
    detailed
  };
}
