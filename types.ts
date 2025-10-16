export interface FashionSuggestion {
  styleName: string;
  description: string;
  reasoning: string;
  clothingItems: {
    top: string;
    bottom: string;
    footwear: string;
    accessories: string;
  };
  imageUrl?: 'loading' | 'error' | string;
  feedback?: 'like' | 'dislike';
}
