import React from 'react';
import type { FashionSuggestion } from '../types';
import { SparklesIcon, LikeIcon, DislikeIcon, StarIcon, DownloadIcon, EyeIcon } from './icons';

interface SuggestionCardProps {
  suggestion: FashionSuggestion;
  onFeedback: (styleName: string, feedback: 'like' | 'dislike') => void;
  isSaved: boolean;
  onSave: (styleName: string) => void;
  onLike: (styleName: string) => void;
  isLiked: boolean;
  onPreview: (imageUrl: string) => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onFeedback, isSaved, onSave, onLike, isLiked, onPreview }) => {
  const renderImageContent = () => {
    switch (suggestion.imageUrl) {
      case 'loading':
      case undefined:
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-700/50 rounded-lg">
            <SparklesIcon className="w-10 h-10 text-purple-400 animate-pulse" />
          </div>
        );
      case 'error':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-700/50 text-red-400 rounded-lg">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm mt-2">Image failed to load</p>
          </div>
        );
      default:
        return <img src={suggestion.imageUrl} alt={`Example of ${suggestion.styleName} style`} className="w-full h-full object-cover" />;
    }
  };

  const savedClass = isSaved 
    ? 'border-purple-500 shadow-purple-500/20 ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900' 
    : 'border-gray-700 hover:border-purple-500 hover:shadow-purple-500/10';
    
  const isImageReady = suggestion.imageUrl && suggestion.imageUrl !== 'loading' && suggestion.imageUrl !== 'error';

  const handleDownload = () => {
    if (!isImageReady) return;
    const link = document.createElement('a');
    link.href = suggestion.imageUrl!;
    link.download = `${suggestion.styleName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-lg px-6 py-7 flex flex-col transition-all duration-300 ${savedClass}`}>
      <div className="aspect-square w-full rounded-lg mb-4 overflow-hidden border border-gray-700">
        {renderImageContent()}
      </div>
      <div className="flex justify-between items-center gap-3 mb-3">
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
          {suggestion.styleName}
        </h3>
        <div className="flex items-center -mr-2">
           <button
             onClick={() => isImageReady && onPreview(suggestion.imageUrl!)}
             disabled={!isImageReady}
             aria-label="Preview image"
             className="p-2 rounded-full text-gray-500 transition-all duration-200 enabled:hover:text-purple-400 enabled:hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
           >
             <EyeIcon className="w-6 h-6" />
           </button>
           <button
             onClick={handleDownload}
             disabled={!isImageReady}
             aria-label="Download image"
             className="p-2 rounded-full text-gray-500 transition-all duration-200 enabled:hover:text-purple-400 enabled:hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
           >
             <DownloadIcon className="w-6 h-6" />
           </button>
           <button
             onClick={() => onSave(suggestion.styleName)}
             aria-label={isSaved ? "Unsave this suggestion" : "Save this suggestion"}
             className={`p-2 rounded-full transition-all duration-200 transform hover:scale-110 ${isSaved ? 'text-purple-400' : 'text-gray-500 hover:text-purple-400'}`}
           >
             <StarIcon className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
           </button>
        </div>
      </div>

      <div className="space-y-5 flex-grow">
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
          <p className="text-gray-300 text-sm leading-relaxed">{suggestion.description}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Why it Works</h4>
          <p className="text-gray-300 text-sm leading-relaxed">{suggestion.reasoning}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Outfit Details</h4>
          <ul className="list-none space-y-1.5 text-gray-300 text-sm">
            <li className="flex items-start"><span className="font-medium text-gray-200 w-24 shrink-0">Top:</span><span>{suggestion.clothingItems.top}</span></li>
            <li className="flex items-start"><span className="font-medium text-gray-200 w-24 shrink-0">Bottom:</span><span>{suggestion.clothingItems.bottom}</span></li>
            <li className="flex items-start"><span className="font-medium text-gray-200 w-24 shrink-0">Footwear:</span><span>{suggestion.clothingItems.footwear}</span></li>
            <li className="flex items-start"><span className="font-medium text-gray-200 w-24 shrink-0">Accessories:</span><span>{suggestion.clothingItems.accessories}</span></li>
          </ul>
        </div>
      </div>
      <div className="mt-6 pt-5 border-t border-purple-900/60 flex justify-end items-center gap-3">
        <span className="text-sm text-gray-400 mr-auto">Was this suggestion helpful?</span>
        <button 
          onClick={() => onLike(suggestion.styleName)}
          aria-label="Like this suggestion"
          className={`p-2 rounded-full transition-all duration-200 transform hover:scale-110 ${isLiked ? 'bg-purple-500/20 text-purple-400' : 'text-gray-500 hover:bg-gray-700 hover:text-purple-400'}`}
        >
          <LikeIcon className="w-5 h-5" />
        </button>
        <button 
          onClick={() => onFeedback(suggestion.styleName, 'dislike')}
          aria-label="Dislike this suggestion"
          className={`p-2 rounded-full transition-all duration-200 transform hover:scale-110 ${suggestion.feedback === 'dislike' ? 'bg-red-500/20 text-red-400' : 'text-gray-500 hover:bg-gray-700 hover:text-red-400'}`}
        >
          <DislikeIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SuggestionCard;