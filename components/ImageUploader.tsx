import React, { useRef, useState } from 'react';
import { UploadIcon, CameraIcon } from './Icons';
import { CameraModal } from './CameraModal';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  imagePreviewUrl: string | null;
  texts: {
    uploadPlaceholderTitle: string;
    uploadPlaceholderSubtitle: string;
    orSeparator: string;
    useCameraButton: string;
    changeImageButton: string;
    retakeWithCameraButton: string;
  };
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imagePreviewUrl, texts }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCameraOpen(true);
  };
  
  const handleCapture = (file: File) => {
    onImageUpload(file);
    setIsCameraOpen(false);
  };

  return (
    <>
      <div className="w-full h-full bg-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
        />
        {imagePreviewUrl ? (
          <div className="relative w-full h-full group">
            <img src={imagePreviewUrl} alt="Product preview" className="w-full h-full object-contain rounded-lg" />
            <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
              <button onClick={handleFileClick} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg">
                {texts.changeImageButton}
              </button>
              <button onClick={handleCameraClick} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center">
                <CameraIcon className="w-5 h-5 mr-2" /> {texts.retakeWithCameraButton}
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="w-full h-full border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 p-6"
          >
            <div onClick={handleFileClick} className="w-full flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700/50 rounded-t-lg transition-colors">
                 <UploadIcon className="w-16 h-16 mb-4" />
                 <p className="text-xl font-semibold">{texts.uploadPlaceholderTitle}</p>
                 <p className="text-sm">{texts.uploadPlaceholderSubtitle}</p>
            </div>
            <div className="w-full flex items-center justify-center my-4">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">{texts.orSeparator}</span>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>
             <button 
                onClick={handleCameraClick}
                className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-b-lg transition-colors text-white"
            >
                <CameraIcon className="w-5 h-5 mr-2" />
                {texts.useCameraButton}
            </button>
          </div>
        )}
      </div>
      {isCameraOpen && <CameraModal onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />}
    </>
  );
};
