import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Extracts JSON object from a model's raw string response (handles markdown blocks, raw json, etc.)
 */
function extractJSON(text) {
  if (!text) return null;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    // Try matching ```json ... ``` block
    const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (innerErr) {
        // Continue to regex object match
      }
    }
    // Try matching the first {...} block
    const braceMatch = trimmed.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try {
        return JSON.parse(braceMatch[0]);
      } catch (braceErr) {
        // Fall through
      }
    }
    return null;
  }
}

/**
 * Generates three review drafts (Quick, Normal, Detailed) using NVIDIA NIM (Llama 3.2 90B Vision Instruct),
 * with fallback to Gemini API and local offline generators.
 */
export async function generateReviewDraft({
  selectedItems,
  experienceRating,
  writingTone,
  language = "English",
  userApprovedExamples = []
}) {
  const nvidiaKey = import.meta.env.VITE_NVIDIA_API_KEY || "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";
  const nvidiaModel = import.meta.env.VITE_AI_MODEL || "meta/llama-3.2-90b-vision-instruct";
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

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

CRITICAL ANTI-REPETITION & VOCABULARY RULES:
* DO NOT keep using the same few keywords and phrases (such as "nice spot", "hangout", "bhot accha", "bahut achha", "kafi badhiya", "good place"). Vary the wording continuously.
* For English: Use varied words like "tasty food", "really liked it", "clean tables", "quick service", "polite staff", "fresh burger", "cozy layout", "hot serving".
* For Hinglish: Use diverse expressions like "swad mast tha", "maza aa gaya", "expected se better", "sahi jagah", "fast service mili", "safai acchi thi", "friend circle ke sath gye", "mahaul chilled hai", "sahi seating arrangement".
* DO NOT use fancy vocabulary or elaborate adjectives (like "delightful", "impeccable", "epitome", "ambassador", "savored", "mouthwatering", "nestled", "establishment", "culinary", "experience was enhanced", "highly recommend", "must-visit").
* Do NOT start reviews with: "Just dropped by", "Stopped by", "Quick stopover", "On a recent visit", "While visiting", "Decided to try", "Food enthusiast", "Visited this cafe", "Had the pleasure of visiting".
* Do NOT sound like a food blogger, travel reviewer, or marketing content.
* Avoid these forbidden words/phrases: "moreover", "furthermore", "additionally", "aesthetic details", "luxury theme", "exceptional", "outstanding", "remarkable", "highly recommended".
* Most reviews must be written in simple everyday language.

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
* Sahi laga taste.
* Pizza expected se badhiya tha.
* Service kafi fast mili hume.
* Friends ke sath shaam ko aaye the.
* Cold coffee kafi chilled aur refresh kar dene wali thi.
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

  // 1. Attempt generation using NVIDIA NIM API (Llama 3.2 90B Vision Instruct)
  if (nvidiaKey && nvidiaKey.trim() !== "") {
    try {
      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${nvidiaKey.trim()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: nvidiaModel,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.8,
          max_tokens: 512
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content || "";
        const parsed = extractJSON(content);

        if (parsed && parsed.quick && parsed.normal && parsed.detailed) {
          return {
            quick: cleanGeneratedText(parsed.quick),
            normal: cleanGeneratedText(parsed.normal),
            detailed: cleanGeneratedText(parsed.detailed),
            source: "nvidia-llama"
          };
        }
      } else {
        console.warn(`NVIDIA API response status: ${response.status}`);
      }
    } catch (nvidiaErr) {
      console.warn("NVIDIA NIM API call failed, attempting fallback:", nvidiaErr);
    }
  }

  // 2. Secondary fallback: Gemini API (if available)
  if (geminiKey && geminiKey.trim() !== "" && geminiKey !== "YOUR_GEMINI_API_KEY") {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const parsed = extractJSON(text);
      if (parsed && parsed.quick && parsed.normal && parsed.detailed) {
        return {
          quick: cleanGeneratedText(parsed.quick),
          normal: cleanGeneratedText(parsed.normal),
          detailed: cleanGeneratedText(parsed.detailed),
          source: "gemini"
        };
      }
    } catch (geminiErr) {
      console.warn("Gemini API fallback failed, running local procedural generator:", geminiErr);
    }
  }

  // 3. Tertiary fallback: Local procedural generator
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

  // Expanded and highly varied starter list to prevent repetition
  const englishStarters = [
    `Tried this cafe today.`,
    `Good food and quick service.`,
    `Perfect spot for a quick bite.`,
    `Visited this place with family.`,
    `Really liked the vibes here.`,
    `Clean cafe and great service.`,
    `Quality of food was really good.`,
    `Nice ambiance and seating.`,
    `Decent prices and hot food.`,
    `Very cozy and neat environment.`,
    `Great experience overall at ${name}.`,
    `We had a nice time at this spot.`,
    `Food taste was quite good here.`
  ];

  const englishItemPhrases = {
    "Pizza": [
      "Pizza was hot and cheesy.",
      "The pizza was loaded with toppings.",
      "Good pizza size and taste.",
      "Cheesy pizza was really fresh.",
      "Loved the pizza toppings."
    ],
    "Cold Coffee": [
      "Cold coffee was sweet and chilled.",
      "Refreshing cold coffee, perfect taste.",
      "Chilled cold coffee tasted great.",
      "Loved the sweetness of the cold coffee.",
      "Cold coffee was super refreshing."
    ],
    "Burger": [
      "Burger bun was fresh and tasty.",
      "Loved the filling burger portion.",
      "Burger was loaded and fresh.",
      "Taste of the burger was very nice."
    ],
    "Momos": [
      "Momos were served hot and fresh.",
      "Wheat momos tasted really good.",
      "Momos stuffing was delicious.",
      "Really liked the fresh momos."
    ],
    "Staff": [
      "Service was fast and staff was polite.",
      "Helpful staff and quick serving time.",
      "Quick service, friendly interactions.",
      "Attentive staff made it smooth."
    ],
    "Ambience": [
      "Seating is comfortable and lighting is nice.",
      "Relaxing atmosphere and comfortable vibe.",
      "Good music and nice seating space.",
      "Cozy setup, suitable for groups."
    ],
    "Cleanliness": [
      "The place is clean and neat.",
      "Hygienic tables and tidy setup.",
      "Cleanliness is well maintained.",
      "Hygienic environment overall."
    ]
  };

  const englishGeneralPositive = [
    "Overall experience was good.",
    "Will visit again soon.",
    "Decent food quality.",
    "Worth trying once.",
    "Highly satisfied with the visit."
  ];

  const hinglishStarters = [
    `Sahi jagah hai.`,
    `Food taste kafi sahi tha.`,
    `Garam khana aur fast service mili.`,
    `Vibe kafi chilled out hai.`,
    `Family ke sath gye the yahan.`,
    `Safai ekdum mast thi.`,
    `Kuchh different try kiya aaj.`,
    `Garam garam momos aur pizza kha kar maza aa gaya.`,
    `Baghpat mein kafi sahi cafe hai.`,
    `Sahi seating aur calm mahaul tha.`,
    `Doston ke sath aane ki badhiya jagah hai.`,
    `Khana garam aur fresh serve kiya.`
  ];

  const hinglishItemPhrases = {
    "Pizza": [
      "Pizza expected se better tha aur size bhi sahi tha.",
      "Pizza cheesy tha aur toppings badhiya thi.",
      "Garam pizza tha, maza aa gaya.",
      "Pizza ka base aur taste ekdum perfect tha.",
      "Cheesy pizza kafi tasty laga."
    ],
    "Cold Coffee": [
      "Cold coffee thandi aur refreshing thi.",
      "Chilled cold coffee ka taste ekdum mast tha.",
      "Coffee mein sweetness bilkul sahi thi.",
      "Maza aa gaya cold coffee pee kar.",
      "Refreshing thandi coffee thi."
    ],
    "Burger": [
      "Burger kafi heavy aur fresh tha.",
      "Burger taste mein kafi accha tha.",
      "Fresh buns aur tasty filling thi burger mein.",
      "Burger badhiya aur filling laga."
    ],
    "Momos": [
      "Momos ekdum garam aur delicious the.",
      "Wheat momos kafi soft aur healthy option hai.",
      "Momos stuffing sahi thi aur chatni mast thi.",
      "Garam garam momos kafi tasty the."
    ],
    "Staff": [
      "Staff polite tha aur service quick thi.",
      "Service kafi fast aur smooth mili hume.",
      "Attentive staff aur badiya behaviour tha.",
      "Bina delay ke jaldi order serve kiya."
    ],
    "Ambience": [
      "Seating comfortable thi aur vibe relaxed tha.",
      "Cozy atmosphere aur comfortable seating space hai.",
      "Mahaul kafi relaxed aur positive laga.",
      "Interior aur seating arrangement accha hai."
    ],
    "Cleanliness": [
      "Cafe ekdum clean aur tables clean the.",
      "Safai aur hygiene kafi sahi thi yahan.",
      "Space neat and clean maintained tha.",
      "Safai par kafi dhyan diya gaya hai."
    ]
  };

  const hinglishGeneralPositive = [
    "Overall maza aa gaya.",
    "Dobara zaroor visit karenge.",
    "Nice experience tha yahan.",
    "Worth visiting place hai.",
    "Khana aur service dono sahi the."
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
