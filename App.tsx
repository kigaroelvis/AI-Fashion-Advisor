import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import Loader from './components/Loader';
import SuggestionCard from './components/SuggestionCard';
import ImagePreviewModal from './components/ImagePreviewModal';
import { SearchIcon, SparklesIcon } from './components/icons';
import { getFashionSuggestions, generateFashionImage } from './services/geminiService';
import { loadFeedback, saveFeedback, loadSavedSuggestion, saveSavedSuggestion, loadLikedSuggestions, saveLikedSuggestion } from './services/feedbackService';
import type { FashionSuggestion } from './types';

export const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<FashionSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [isGeneratingMore, setIsGeneratingMore] = useState<boolean>(false);
  const [savedSuggestion, setSavedSuggestion] = useState<string | null>(null);
  const [likedSuggestions, setLikedSuggestions] = useState<string[]>([]);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadSavedSuggestion();
    if (saved) {
      setSavedSuggestion(saved);
    }
    setLikedSuggestions(loadLikedSuggestions());
  }, []);

  const handleImageSelect = useCallback((file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setSuggestions([]);
    setError(null);
    setFilterQuery('');
  }, []);
  
  const generateImagesForSuggestions = (suggestionsToProcess: FashionSuggestion[], baseImage: File) => {
    suggestionsToProcess.forEach((suggestion) => {
      generateFashionImage(suggestion, baseImage)
        .then(imageUrl => {
          setSuggestions(prev => prev.map(s => s.styleName === suggestion.styleName ? { ...s, imageUrl } : s));
        })
        .catch(err => {
          console.error(`Failed to generate image for "${suggestion.styleName}":`, err);
          setSuggestions(prev => prev.map(s => s.styleName === suggestion.styleName ? { ...s, imageUrl: 'error' } : s));
        });
    });
  };

  const handleGetSuggestions = async () => {
    if (!imageFile) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    setFilterQuery('');

    try {
      const textSuggestions = await getFashionSuggestions(imageFile);
      const storedFeedback = loadFeedback();

      const suggestionsWithData = textSuggestions.map(s => {
        const feedbackRecord = storedFeedback.find(f => f.suggestionId === s.styleName);
        return {
          ...s,
          imageUrl: 'loading',
          feedback: feedbackRecord?.feedback,
        };
      });
      setSuggestions(suggestionsWithData);

      generateImagesForSuggestions(suggestionsWithData, imageFile);
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateMore = async () => {
    if (!imageFile) return;

    setIsGeneratingMore(true);
    setError(null);

    try {
      const existingStyles = suggestions.map(s => s.styleName);
      const newTextSuggestions = await getFashionSuggestions(imageFile, existingStyles);
      
      const storedFeedback = loadFeedback();
      const newSuggestionsWithData = newTextSuggestions.map(s => {
          const feedbackRecord = storedFeedback.find(f => f.suggestionId === s.styleName);
          return { ...s, imageUrl: 'loading', feedback: feedbackRecord?.feedback };
      }).filter(newS => !existingStyles.includes(newS.styleName)); // Ensure no duplicates

      if (newSuggestionsWithData.length > 0) {
        setSuggestions(prev => [...prev, ...newSuggestionsWithData]);
        generateImagesForSuggestions(newSuggestionsWithData, imageFile);
      }

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsGeneratingMore(false);
    }
  };

  const handleFeedback = (styleName: string, newFeedback: 'like' | 'dislike') => {
    let finalFeedback: 'like' | 'dislike' | undefined = newFeedback;

    setSuggestions(prev => {
        const suggestionToUpdate = prev.find(s => s.styleName === styleName);
        if (suggestionToUpdate?.feedback === newFeedback) {
            finalFeedback = undefined;
        }
        return prev.map(s => s.styleName === styleName ? { ...s, feedback: finalFeedback } : s);
    });

    const storedFeedback = loadFeedback();
    const otherFeedback = storedFeedback.filter(f => f.suggestionId !== styleName);
    
    if (finalFeedback) {
        saveFeedback([...otherFeedback, { suggestionId: styleName, feedback: finalFeedback }]);
    } else {
        saveFeedback(otherFeedback);
    }
  };

  const handleLike = (styleName: string) => {
    saveLikedSuggestion(styleName);
    setLikedSuggestions(loadLikedSuggestions());
  };

  const handleSaveSuggestion = (styleName: string) => {
    const newSavedSuggestion = savedSuggestion === styleName ? null : styleName;
    setSavedSuggestion(newSavedSuggestion);
    saveSavedSuggestion(newSavedSuggestion);
  };
  
  const handlePreviewImage = (url: string) => {
    setPreviewImageUrl(url);
  };
  
  const handleClosePreview = () => {
    setPreviewImageUrl(null);
  };

  const handleReset = () => {
    setImageFile(null);
    setImageUrl(null);
    setSuggestions([]);
    setError(null);
    setIsLoading(false);
    setFilterQuery('');
    setSavedSuggestion(null);
    saveSavedSuggestion(null);
  };

  const filteredSuggestions = suggestions.filter(suggestion => {
    if (!filterQuery) return true;
    const query = filterQuery.toLowerCase();
    const searchableText = [
      suggestion.styleName,
      suggestion.description,
      suggestion.clothingItems.top,
      suggestion.clothingItems.bottom,
      suggestion.clothingItems.footwear,
      suggestion.clothingItems.accessories,
    ].join(' ').toLowerCase();
    return searchableText.includes(query);
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white selection:bg-purple-500/30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/40 -z-10"></div>
      <main className="container mx-auto px-4 py-8">
        <Header />
        
        <div className="mt-10">
          {!imageUrl ? (
            <ImageUploader onImageSelect={handleImageSelect} disabled={isLoading} />
          ) : (
            <div className="flex flex-col items-center gap-8">
              <div className="w-full max-w-sm bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-700">
                <img src={imageUrl} alt="User upload" className="rounded-lg w-full h-auto object-cover" />
              </div>
              <div className="flex items-center gap-4">
                 <button 
                   onClick={handleGetSuggestions} 
                   disabled={isLoading}
                   className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                 >
                   Get Suggestions
                 </button>
                 <button
                    onClick={handleReset}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Clear Image
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12">
          {isLoading && suggestions.length === 0 && <Loader />}
          {error && <div className="text-center p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg max-w-2xl mx-auto">{error}</div>}
          
          {suggestions.length > 0 && (
             <div className="max-w-7xl mx-auto">
                <div className="relative mb-8 max-w-lg mx-auto">
                    <input
                        type="text"
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        placeholder="Filter by style or clothing..."
                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors duration-300"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>
                {filteredSuggestions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredSuggestions.map((suggestion) => (
                            <SuggestionCard 
                                key={suggestion.styleName} 
                                suggestion={suggestion} 
                                onFeedback={handleFeedback}
                                isSaved={savedSuggestion === suggestion.styleName}
                                onSave={handleSaveSuggestion}
                                onLike={handleLike}
                                isLiked={likedSuggestions.includes(suggestion.styleName)}
                                onPreview={handlePreviewImage}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 bg-gray-800/50 rounded-lg">
                        <p className="text-lg text-gray-400">No suggestions match your filter.</p>
                    </div>
                )}
                
                {!isLoading && (
                  <div className="mt-12 text-center">
                    <button
                      onClick={handleGenerateMore}
                      disabled={isGeneratingMore}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingMore ? (
                        <>
                          <SparklesIcon className="w-5 h-5 animate-pulse" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-5 h-5" />
                          <span>Generate More Suggestions</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
            </div>
          )}
        </div>
      </main>
      {previewImageUrl && (
        <ImagePreviewModal imageUrl={previewImageUrl} onClose={handleClosePreview} />
      )}
    </div>
  );
};
