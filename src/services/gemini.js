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

CAFE DETAILS & BRAND NAME RULES:
- Cafe Name: Chapter One Cafe
- Location Details: Baghpat (opposite Maya Hotel, near Bajaj showroom, near bypass road)
- BRAND NAME RULE: DO NOT always mention the brand name "Chapter One Cafe" or "Chapter One Cafe Baghpat". Only mention the brand name explicitly in about 30% of reviews. In the other 70%, refer to it naturally as "this place", "this cafe", "this spot", "the cafe near bypass road", etc.
- LANDMARK RULE: NATURALLY include at least one or two of these local descriptors: "near Bajaj showroom", "opposite Maya Hotel", "near bypass road".

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
 * Local fallback review generator with English & Hinglish support and extreme sentence randomization.
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

  // Landmark selection
  const landmarks = [
    "opposite Maya Hotel",
    "near the Bajaj showroom in Baghpat",
    "located near the bypass road",
    "situated in Baghpat opposite Maya Hotel"
  ];
  const chosenLandmark = selectRandom(landmarks);
  const ratingPositive = experienceRating >= 4;

  // Adaptive Learning: Check if we have user-approved previous sentences
  let preferredSentences = [];
  if (userApprovedExamples && userApprovedExamples.length > 0) {
    userApprovedExamples.forEach(ex => {
      const parts = ex.split(/[.!?]/).map(s => s.trim()).filter(s => s.length > 15);
      if (parts.length > 0) {
        preferredSentences.push(selectRandom(parts));
      }
    });
  }

  // Randomize cafe name mentions (Explicit vs. Generic)
  const isHinglish = language === "Hinglish";
  const nameOptions = isHinglish 
    ? ["Chapter One Cafe Baghpat", "ye place", "ye cafe", "ye spot", "ye cafe Baghpat mein"]
    : ["Chapter One Cafe Baghpat", "this place", "this cafe", "this spot", "this cafe in Baghpat"];
  
  // 30% chance to explicitly name the cafe, 70% to use a generic reference
  const name = Math.random() < 0.3 ? nameOptions[0] : selectRandom(nameOptions.slice(1));

  // ENGLISH phrase matrices
  const englishStarters = [
    `Had a quick stopover at ${name}, which is ${chosenLandmark}.`,
    `Just dropped by ${name} ${chosenLandmark} for a quick bite.`,
    `Casual hangout at ${name} today, right ${chosenLandmark}.`,
    `Always on the hunt for great taste and ${name} ${chosenLandmark} is a solid find.`,
    `Visited ${name} ${chosenLandmark} with family for dinner and had a lovely time.`,
    `Excellent spot for a quick coffee meeting at ${name} near bypass road.`
  ];

  const englishItemPhrases = {
    "Pizza": [
      "The pizza was huge in size, loaded with cheese, and perfect for sharing.",
      "The pizza had an amazing crust, lots of cheese, and is great for sharing with friends.",
      "Loved the sharing-size pizza, very cheesy and delicious."
    ],
    "Cold Coffee": [
      "The cold coffee was incredibly refreshing with a very balanced sweetness.",
      "Highly recommend their cold coffee, extremely refreshing and not overly sweet.",
      "The cold coffee was top-class, perfect sweetness and very refreshing."
    ],
    "Burger": ["The burger was juicy, fresh, and tasted excellent.", "Loved the burger, very filling and tasty."],
    "Momos": ["Momos were steam-hot, fresh, and had a tasty filling.", "Wheat momos were steam-hot, fresh, and had a tasty filling."],
    "Staff": ["The staff was super polite and their service was very prompt.", "Staff service was extremely efficient and polite."],
    "Ambience": ["The ambience is beautiful with great aesthetic details and good music.", "Vibe is amazing here, perfect lighting and cozy seating arrangement."],
    "Cleanliness": ["The cafe is spotlessly clean and very well-maintained.", "Appreciated the high standards of cleanliness and hygiene here."]
  };

  const englishGeneralPositive = [
    "Overall experience was excellent and everything was spot-on.",
    "Had a wonderful time dining here, highly recommended.",
    "Very satisfied with our visit, definitely coming back again."
  ];

  // HINGLISH phrase matrices
  const hinglishStarters = [
    `Aaj ${name} gye the jo ki ${chosenLandmark} hai.`,
    `${name} ${chosenLandmark} mein hangout kiya, maza aa gaya!`,
    `Bypass road ke paas jo ${name} hai, wahan casual bite ke liye gye the.`,
    `Baghpat mein achha cafe dhoond rahe the aur ${name} ${chosenLandmark} mil gya.`,
    `Family ke saath ${name} gye the dinner ke liye, bohot badhiya spot hai.`
  ];

  const hinglishItemPhrases = {
    "Pizza": [
      "Pizza ka size bohot bada tha, full cheesy aur taste next level tha.",
      "Yahan ka pizza super cheesy hai, sharing ke liye bilkul perfect.",
      "Cheesy pizza tha, friends ke saath share karne ke liye bohot badhiya tha."
    ],
    "Cold Coffee": [
      "Cold coffee bohot refreshing thi, sweetness ekdum balanced thi.",
      "Highly recommend karenge cold coffee, bilkul heavy nahi hai aur taste sweet hai.",
      "Cold coffee next level thi, dhoop mein maza aa gaya pee ke."
    ],
    "Burger": ["Burger kafi juicy aur fresh tha, taste kafi sahi tha.", "Burger bohot tasty aur heavy tha."],
    "Momos": ["Momos ekdum garam aur fresh filling ke saath serve kiye.", "Wheat momos kafi soft aur delicious the."],
    "Staff": ["Staff members bohot polite hain aur service kafi fast hai.", "Service ekdum prompt aur helpful thi."],
    "Ambience": ["Ambience bohot cozy aur premium hai, photography ke liye mast lighting hai.", "Vibe kafi chill hai aur music bhi kafi badhiya chal raha tha."],
    "Cleanliness": ["Cafe ekdum neat and clean hai, hygiene ka kafi dhayan rakha hai.", "Clean tables aur hygienic environment tha."]
  };

  const hinglishGeneralPositive = [
    "Overall bohot badhiya experience tha, maza aa gaya.",
    "Service aur food dono top-notch hain, zaroor wapas aayenge.",
    "Worth the price hai, Baghpat ka best cafe hai."
  ];

  // Select language specific blocks
  const starterList = isHinglish ? hinglishStarters : englishStarters;
  const itemMap = isHinglish ? hinglishItemPhrases : englishItemPhrases;
  const generalList = isHinglish ? hinglishGeneralPositive : englishGeneralPositive;

  let start = selectRandom(starterList);
  let generalOpinion = ratingPositive ? selectRandom(generalList) : (isHinglish ? "Theek experience tha, improve ho sakta hai." : "Decent visit, could be improved.");

  // Compile selected items
  let chosenItemPhrases = [];
  selectedItems.forEach(item => {
    if (itemMap[item]) {
      chosenItemPhrases.push(selectRandom(itemMap[item]));
    }
  });

  // Inject a preferred learned sentence if it exists (Adaptive Learning)
  if (preferredSentences.length > 0 && Math.random() > 0.4) {
    chosenItemPhrases.push(selectRandom(preferredSentences));
  }

  // Dynamic sentence connector variables to maximize difference (uniqueness)
  const connectors = isHinglish 
    ? ["Aur haan,", "Khas baat ye thi ki", "Sach bataun toh", "Waise", "Saath mein"] 
    : ["Specifically,", "Honestly,", "Moreover,", "What's more,", "On top of that,"];

  let sentences = [];
  
  if (reviewMode === "Quick") {
    sentences.push(start);
    if (chosenItemPhrases.length > 0) {
      sentences.push(chosenItemPhrases[0]);
    } else {
      sentences.push(generalOpinion);
    }
  } else if (reviewMode === "Normal") {
    sentences.push(start);
    if (chosenItemPhrases.length > 0) {
      sentences.push(chosenItemPhrases[0]);
      if (chosenItemPhrases[1]) {
        sentences.push(`${selectRandom(connectors)} ${chosenItemPhrases[1].toLowerCase()}`);
      }
    }
    sentences.push(generalOpinion);
  } else {
    sentences.push(start);
    if (chosenItemPhrases.length > 0) {
      sentences.push(chosenItemPhrases.slice(0, 2).join(" "));
      if (chosenItemPhrases[2]) {
        sentences.push(`${selectRandom(connectors)} ${chosenItemPhrases[2].toLowerCase()}`);
      }
    }
    sentences.push(generalOpinion);
    
    const detailedAdditions = isHinglish
      ? ["Baghpat bypass road ke paas travel karte hue yahan rukna bohot sahi option hai.", "Pricing bhi kafi sahi hai vibe ke hisab se.", "Wapas zaroor aayenge kuch aur try karne."]
      : ["Definitely one of the best spots in Baghpat to stop by near the bypass road.", "Pricing is reasonable considering the luxury theme.", "Highly recommended spot!"];
    
    sentences.push(selectRandom(detailedAdditions));
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
