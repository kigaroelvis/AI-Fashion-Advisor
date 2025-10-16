import React, { useEffect } from 'react';
import { XIcon } from './icons';

interface ImagePreviewModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-gray-900 rounded-lg shadow-2xl p-2 max-w-4xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt="Fashion suggestion preview"
          className="w-full h-full object-contain max-h-[calc(90vh-1rem)] rounded"
        />
        <button
          onClick={onClose}
          aria-label="Close image preview"
          className="absolute top-2 right-2 p-2 bg-gray-800/60 rounded-full text-white hover:bg-gray-700 transition-colors"
        >
          <XIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
