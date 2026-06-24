import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generates a review draft using the Gemini API, with a robust local fallback generator.
 */
export async function generateReviewDraft({
  selectedItems,
  experienceRating,
  reviewMode,
  writingTone,
  language = "English",
  userApprovedExamples = []
}) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const itemsList = selectedItems && selectedItems.length > 0 
    ? selectedItems.join(", ") 
    : "overall experience";

  const lengthGuides = {
    "Quick": "20 to 40 words",
    "Normal": "50 to 80 words",
    "Detailed": "100 to 150 words"
  };

  const chosenLengthGuide = lengthGuides[reviewMode] || "50 to 80 words";

  // Smart prompt triggers based on dish/items selected
  let smartTriggers = "";
  if (selectedItems.includes("Pizza") || selectedItems.includes("17 Inch Pizza")) {
    smartTriggers += "- Mention that the Pizza was large in size, had perfect cheese, and is great for sharing with friends/family.\n";
  }
  if (selectedItems.includes("Cold Coffee")) {
    smartTriggers += "- Mention that the Cold Coffee was extremely refreshing with balanced sweetness.\n";
  }
  if (selectedItems.includes("Staff")) {
    smartTriggers += "- Highlight the staff's polite behaviour and quick service speed.\n";
  }
  if (selectedItems.includes("Ambience")) {
    smartTriggers += "- Mention the cozy and premium layout, perfect lighting, and good background music.\n";
  }
  if (selectedItems.includes("Cleanliness")) {
    smartTriggers += "- Note the hygienic environment and spotless tables.\n";
  }

  // Random prompt modifier to force extreme variation (satisfying "must look fully different not same")
  const randomModifiers = [
    "Start the review with a question about the food or experience.",
    "Start the review with a casual exclamation like 'What a find!' or 'Superb experience!'",
    "Describe the visit like a small story of dropping by during the day.",
    "Focus on details of the sensory experience (taste, comfort, sound).",
    "Focus heavily on the cafe's location details relative to the landmarks right at the beginning.",
    "Write in a direct, punchy style with short sentences.",
    "Structure it around how the selected items exceeded expectations."
  ];
  const chosenModifier = randomModifiers[Math.floor(Math.random() * randomModifiers.length)];

  // Inject user approved examples for few-shot learning
  let learningBlock = "";
  if (userApprovedExamples && userApprovedExamples.length > 0) {
    learningBlock = `\nLEARN FROM USER PREFERENCES (Few-shot learning):
Here are examples of previous reviews edited and approved by users at this cafe. Study their tone, style, and structure, and draft a new one reflecting this preferred style:
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

  // Construct the prompt
  const prompt = `You are an expert review-writing assistant helping real restaurant customers turn their experience into a natural Google review draft.

Your task is to generate ONE realistic customer review based on the information provided.

IMPORTANT GOAL:
The review must feel like it was written by a genuine customer, not by AI.

ABSOLUTE RULES:
* Every review must be unique.
* Never reuse sentence structures repeatedly.
* Never use templates.
* Never sound like an advertisement.
* Never sound promotional.
* Never sound corporate.
* Never use emojis.
* Never use hashtags.
* Never use bullet points.
* Never use quotation marks.
* Never mention that AI generated the review.
* Never mention discounts, rewards, gifts, offers, coupons, or incentives.
* Never force positivity.
* Match the customer's actual ratings and experience.

CRITICAL REALISM RULES:
* Do NOT start reviews with: "Just dropped by", "Stopped by", "Quick stopover", "On a recent visit", "While visiting", "Decided to try", "Food enthusiast", "Visited this cafe", "Had the pleasure of visiting".
* Do NOT sound like a food blogger, travel reviewer, or marketing content.
* Avoid these forbidden words/phrases: "moreover", "furthermore", "additionally", "aesthetic details", "luxury theme", "exceptional", "outstanding", "remarkable", "highly recommended".
* Most reviews must be written in simple everyday language.
* Reviews should contain 1 to 3 short sentences, basic vocabulary, and a casual tone.
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

VARIETY RULES:
Randomly vary:
* Opening sentence style
* Sentence length
* Vocabulary
* Review structure
* Writing personality
* Review focus

Do not always mention every aspect.
Some reviews should focus mostly on food.
Some reviews should focus mostly on ambience.
Some reviews should focus mostly on staff.
Some reviews should focus mostly on cleanliness.
Some reviews should focus mostly on overall experience.
Some reviews should mention multiple aspects.

TARGET LENGTH GUIDE:
- Target review length: ${chosenLengthGuide}

WRITING PERSONALITIES & TONE:
- Write in this tone: ${writingTone}
- Assume this customer personality: ${chosenPersonality}

FOOD MENTION RULES:
Only mention dishes selected by the customer.
When mentioning dishes:
- Pizza: Mention size, cheese, toppings, freshness, sharing with friends or family.
- 17 Inch Pizza: Mention large size, suitable for groups, loaded toppings, filling portions.
- Burger: Mention freshness, filling portions, soft buns, taste.
- Cold Coffee: Mention refreshing taste, balanced sweetness, chilled serving.
- Momos: Mention hot serving, texture, stuffing, flavor.
- Wheat Momos: Mention healthy option naturally.
- Wheat Burger: Mention healthy option naturally.
- Pasta: Mention creamy texture, flavor, portion size.
- French Fries: Mention crispiness.
- Sandwich: Mention freshness and filling.
- Wrap: Mention balanced ingredients and taste.

STAFF RULES:
When staff is selected:
Mention one or more: polite behavior, quick service, helpful staff, attentive service, friendly interaction. Do not repeat the same phrases often.

AMBIENCE RULES:
When ambience is selected:
Mention one or more: cozy atmosphere, comfortable seating, warm lighting, relaxing vibe, peaceful environment, good place to spend time, suitable for friends or family. Do not always use the same descriptions.

CLEANLINESS RULES:
When cleanliness is selected:
Mention one or more: clean tables, hygienic environment, neat setup, well-maintained space. Do not overemphasize hygiene every time.

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

FINAL OUTPUT RULES:
Return ONLY the review text.
No titles.
No explanations.
No labels.
No ratings.
No extra formatting.

Generate a natural review that feels genuinely written by a customer who actually visited the restaurant.`;

  // If API key is available, attempt Gemini generation
  if (apiKey && apiKey.trim() !== "" && apiKey !== "YOUR_GEMINI_API_KEY") {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean up response if the model accidentally included quotes or emojis
      text = cleanGeneratedText(text);
      
      if (text && text.trim().length > 10) {
        return {
          text: text.trim(),
          source: "gemini",
          toneUsed: writingTone,
          modeUsed: reviewMode
        };
      }
    } catch (error) {
      console.error("Gemini API generation failed, running fallback generator:", error);
    }
  }

  // Local fallback generator if API fails or is not configured
  const fallbackText = generateFallbackReview({
    selectedItems,
    experienceRating,
    reviewMode,
    writingTone,
    language,
    userApprovedExamples
  });

  return {
    text: fallbackText,
    source: "fallback",
    toneUsed: writingTone,
    modeUsed: reviewMode
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
function generateFallbackReview({
  selectedItems,
  experienceRating,
  reviewMode,
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

  // Simple customer starters that do not start with the banned phrases
  const englishStarters = [
    `Had a good experience at ${name}.`,
    `Nice time at ${name} today.`,
    `Always a nice hangout spot.`,
    `Food at ${name} is quite good.`,
    `Tried this spot with friends.`,
    `A nice little cafe in Baghpat.`
  ];

  const englishItemPhrases = {
    "Pizza": [
      "Pizza was loaded with cheese and tasted very good.",
      "The pizza was hot and cheesy, perfect for sharing.",
      "Loved the pizza size and toppings."
    ],
    "Cold Coffee": [
      "Cold coffee was refreshing and had good sweetness.",
      "Nice cold coffee, perfect sweetness and chilled.",
      "Cold coffee was top class and very refreshing."
    ],
    "Burger": ["Burger was fresh, filling, and tasted nice.", "Loved the fresh burger bun and filling portions."],
    "Momos": ["Momos were hot, fresh, and had good stuffing.", "Wheat momos tasted really good and fresh."],
    "Staff": ["Staff was polite and service was quick.", "Service was quick and staff was friendly."],
    "Ambience": ["Seating arrangement is comfortable and lighting is nice.", "Nice seating and comfortable atmosphere."],
    "Cleanliness": ["Cafe is clean and well maintained.", "Tables were clean and the environment was tidy."]
  };

  const englishGeneralPositive = [
    "Overall experience was good.",
    "Will visit again with family.",
    "Nice experience overall."
  ];

  const hinglishStarters = [
    `${name} kafi badhiya spot hai.`,
    `${name} mein badhiya time spend kiya.`,
    `Baghpat mein ye cafe kafi sahi hai.`,
    `Friends ke saath hang out karne ke liye achha spot hai.`,
    `Family ke saath dinner ke liye gye the.`
  ];

  const hinglishItemPhrases = {
    "Pizza": [
      "Pizza ka taste expected se better tha aur size bhi bada tha.",
      "Pizza super cheesy tha aur taste next level tha.",
      "Garam pizza aur badhiya toppings, maza aa gaya share karke."
    ],
    "Cold Coffee": [
      "Cold coffee kafi refreshing thi aur sweetness balanced thi.",
      "Cold coffee thandi aur sweet thi, bilkul perfect taste.",
      "Maza aa gaya cold coffee pee kar."
    ],
    "Burger": ["Burger kafi fresh aur heavy tha, taste badhiya tha.", "Burger filling aur tasty tha."],
    "Momos": ["Momos ekdum garam aur tasty filling ke saath serve kiye.", "Wheat momos kafi soft aur delicious the."],
    "Staff": ["Staff polite tha aur service bhi kafi fast thi.", "Service kafi smooth aur quick thi."],
    "Ambience": ["Seating comfort aur environment kafi relaxed tha.", "Cozy atmosphere tha aur seating badhiya thi."],
    "Cleanliness": ["Cafe ekdum clean aur hygienic setup ke saath tha.", "Clean tables aur hygiene sahi thi."]
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

  let sentences = [];
  
  if (reviewMode === "Quick") {
    sentences.push(start);
    if (chosenItemPhrases.length > 0) {
      sentences.push(chosenItemPhrases[0]);
    }
  } else if (reviewMode === "Normal") {
    sentences.push(start);
    if (chosenItemPhrases.length > 0) {
      sentences.push(chosenItemPhrases[0]);
      if (chosenItemPhrases[1]) {
        sentences.push(`${selectRandom(connectors)} ${chosenItemPhrases[1].toLowerCase()}`);
      }
    } else {
      sentences.push(generalOpinion);
    }
  } else {
    sentences.push(start);
    if (chosenItemPhrases.length > 0) {
      sentences.push(chosenItemPhrases[0]);
      if (chosenItemPhrases[1]) {
        sentences.push(chosenItemPhrases[1]);
      }
    }
    sentences.push(generalOpinion);
  }

  let finalReviewText = sentences
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!finalReviewText.endsWith(".") && !finalReviewText.endsWith("!")) {
    finalReviewText += ".";
  }

  return cleanGeneratedText(finalReviewText);
}
