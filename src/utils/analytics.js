const ANALYTICS_KEY = "chapter_one_cafe_analytics";

const defaultStats = {
  qrScans: 0,
  reviewsGenerated: 0,
  copyClicks: 0,
  googleClicks: 0,
  dishes: {
    "17 Inch Pizza": 0,
    "Farmhouse Pizza": 0,
    "Paneer Pizza": 0,
    "Margherita Pizza": 0,
    "Wheat Burger": 0,
    "Wheat Momos": 0,
    "Wheat Noodles": 0,
    "Cold Coffee": 0,
    "Pasta": 0,
    "Garlic Bread": 0,
    "French Fries": 0,
    "Sandwich": 0,
    "Wrap": 0,
    "Sub": 0,
    "Staff": 0,
    "Ambience": 0,
    "Cleanliness": 0
  }
};

function getRawStats() {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    if (!raw) {
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(defaultStats));
      return defaultStats;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading stats from localStorage", e);
    return defaultStats;
  }
}

function saveStats(stats) {
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error("Error saving stats to localStorage", e);
  }
}

export const analytics = {
  incrementScan() {
    const stats = getRawStats();
    stats.qrScans += 1;
    saveStats(stats);
  },

  incrementReviewGenerated(dishes = []) {
    const stats = getRawStats();
    stats.reviewsGenerated += 1;
    
    dishes.forEach(dish => {
      // Map standard checklist tags if needed
      if (stats.dishes[dish] !== undefined) {
        stats.dishes[dish] += 1;
      } else {
        stats.dishes[dish] = 1;
      }
    });

    saveStats(stats);
  },

  incrementCopyClick() {
    const stats = getRawStats();
    stats.copyClicks += 1;
    saveStats(stats);
  },

  incrementGoogleClick() {
    const stats = getRawStats();
    stats.googleClicks += 1;
    saveStats(stats);
  },

  getStats() {
    const stats = getRawStats();
    
    // Sort dishes by frequency
    const dishesList = Object.entries(stats.dishes)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      qrScans: stats.qrScans,
      reviewsGenerated: stats.reviewsGenerated,
      copyClicks: stats.copyClicks,
      googleClicks: stats.googleClicks,
      dishesRanking: dishesList
    };
  },

  // Reset helper
  clearStats() {
    saveStats(defaultStats);
  }
};
