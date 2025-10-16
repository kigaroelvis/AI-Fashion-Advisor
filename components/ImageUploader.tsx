
import React, { useRef, useState, useCallback } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  disabled: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDragEvent = useCallback((e: React.DragEvent<HTMLDivElement>, isDraggingOver: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
        setIsDragging(isDraggingOver);
    }
  }, [disabled]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvent(e, false);
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files[0]) {
        onImageSelect(e.dataTransfer.files[0]);
    }
  }, [disabled, onImageSelect, handleDragEvent]);

  const dragOverClass = isDragging ? 'border-purple-400 bg-gray-800' : 'border-gray-600';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-purple-500';

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full max-w-lg p-8 mx-auto border-2 border-dashed rounded-xl transition-all duration-300 ${dragOverClass} ${disabledClass}`}
      onClick={handleButtonClick}
      onDragEnter={(e) => handleDragEvent(e, true)}
      onDragLeave={(e) => handleDragEvent(e, false)}
      onDragOver={(e) => handleDragEvent(e, true)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        disabled={disabled}
      />
      <div className="text-center">
        <UploadIcon className="w-12 h-12 mx-auto text-gray-500" />
        <p className="mt-4 text-lg font-semibold text-gray-300">
          <span className="text-purple-400">Click to upload</span> or drag and drop
        </p>
        <p className="mt-1 text-sm text-gray-500">PNG, JPG, or WEBP</p>
      </div>
    </div>
  );
};

export default ImageUploader;
