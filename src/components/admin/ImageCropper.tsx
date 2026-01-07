// src/components/admin/ImageCropper.tsx
'use client';

import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ImageCropperProps {
  image: File;
  onCropComplete: (croppedImage: File) => void;
  onClose: () => void;
  aspect?: number;
}

export default function ImageCropper({ image, onCropComplete, onClose, aspect = 1 }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageUrl, setImageUrl] = useState('');

  // Create object URL for the image
  React.useEffect(() => {
    const url = URL.createObjectURL(image);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const cropSize = Math.min(width, height) * 0.8; // 80% of the smaller dimension
    const x = (width - cropSize) / 2;
    const y = (height - cropSize) / 2;
    
    setCrop({
      unit: 'px',
      x,
      y,
      width: cropSize,
      height: cropSize,
    });
  }

  async function handleCrop() {
    if (!imgRef.current || !completedCrop) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );
    
    // Convert canvas to blob and then to File
    return new Promise<void>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const croppedImage = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
        onCropComplete(croppedImage);
        resolve();
      }, 'image/jpeg', 0.9);
    });
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">Crop Image</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="relative max-h-[60vh] overflow-auto">
            {imageUrl && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                circularCrop={false}
                className="max-w-full max-h-[50vh]"
              >
                <img
                  ref={imgRef}
                  src={imageUrl}
                  onLoad={onImageLoad}
                  alt="Crop preview"
                  className="max-w-full max-h-[50vh]"
                />
              </ReactCrop>
            )}
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                await handleCrop();
                onClose();
              }}
              disabled={!completedCrop}
            >
              Crop & Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}