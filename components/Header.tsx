
import React from 'react';
import { SparklesIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="py-6 text-center">
      <div className="inline-flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
        <SparklesIcon className="w-10 h-10" />
        <h1 className="text-4xl md:text-5xl font-bold">
          AI Fashion Advisor
        </h1>
      </div>
      <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
        Discover your perfect style. Upload a photo and let our AI provide personalized fashion recommendations just for you.
      </p>
    </header>
  );
};

export default Header;
