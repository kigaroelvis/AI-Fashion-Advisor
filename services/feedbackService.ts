interface FeedbackRecord {
  suggestionId: string; // This will store the styleName
  feedback: 'like' | 'dislike';
}

const FEEDBACK_STORAGE_KEY = 'fashionAdvisorFeedback';
const SAVED_SUGGESTION_KEY = 'fashionAdvisorSavedSuggestion';
const LIKED_SUGGESTION_KEY = 'fashionAdvisorLikedSuggestion';

export const loadFeedback = (): FeedbackRecord[] => {
  try {
    const storedData = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData) as FeedbackRecord[];
    }
  } catch (error) {
    console.error("Failed to load feedback from localStorage", error);
  }
  return [];
};

export const saveFeedback = (records: FeedbackRecord[]): void => {
  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(records));
  } catch (error)
    {
    console.error("Failed to save feedback to localStorage", error);
  }
};

export const loadLikedSuggestions = (): string[] => {
  try {
    const storedData = localStorage.getItem(LIKED_SUGGESTION_KEY);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string')) {
        return parsedData;
      }
    }
  } catch (error) {
    console.error("Failed to load liked suggestions from localStorage", error);
  }
  return [];
};

export const saveLikedSuggestion = (styleName: string): void => {
  try {
    const currentLiked = loadLikedSuggestions();
    const isLiked = currentLiked.includes(styleName);
    let newLiked: string[];

    if (isLiked) {
      newLiked = currentLiked.filter(name => name !== styleName);
    } else {
      newLiked = [...currentLiked, styleName];
    }

    localStorage.setItem(LIKED_SUGGESTION_KEY, JSON.stringify(newLiked));
  } catch (error) {
    console.error("Failed to save liked suggestion to localStorage", error);
  }
};

export const loadSavedSuggestion = (): string | null => {
  try {
    return localStorage.getItem(SAVED_SUGGESTION_KEY);
  } catch (error) {
    console.error("Failed to load saved suggestion from localStorage", error);
    return null;
  }
};

export const saveSavedSuggestion = (styleName: string | null): void => {
  try {
    if (styleName) {
      localStorage.setItem(SAVED_SUGGESTION_KEY, styleName);
    } else {
      localStorage.removeItem(SAVED_SUGGESTION_KEY);
    }
  } catch (error) {
    console.error("Failed to save suggestion to localStorage", error);
  }
};