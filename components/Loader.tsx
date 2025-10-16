
import React from 'react';
import { SparklesIcon } from './icons';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <SparklesIcon className="w-12 h-12 text-purple-400 animate-pulse" />
      <p className="mt-4 text-lg font-semibold text-gray-300">Finding your perfect style...</p>
      <p className="text-sm text-gray-500">This may take a moment.</p>
    </div>
  );
};

export default Loader;
