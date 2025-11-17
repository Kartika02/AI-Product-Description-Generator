
import React, { useRef, useEffect, useCallback } from 'react';
import { CameraIcon, XIcon } from './Icons';

interface CameraModalProps {
  onClose: () => void;
  onCapture: (file: File) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      onClose();
    }
  }, [onClose]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        canvas.toBlob(blob => {
          if (blob) {
            const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
            onCapture(file);
          }
          stopCamera();
          onClose();
        }, 'image/jpeg');
      }
    }
  };

  const handleClose = () => {
      stopCamera();
      onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-4 max-w-3xl w-full relative shadow-2xl">
        <video ref={videoRef} autoPlay playsInline className="w-full rounded-md aspect-video object-cover"></video>
        <canvas ref={canvasRef} className="hidden"></canvas>
        <div className="flex justify-center mt-4 space-x-4">
          <button 
            onClick={handleCapture}
            className="p-4 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
            aria-label="Take Photo"
          >
            <CameraIcon className="w-8 h-8"/>
          </button>
        </div>
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 bg-gray-700 rounded-full text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
          aria-label="Close camera"
        >
          <XIcon className="w-6 h-6"/>
        </button>
      </div>
    </div>
  );
};
