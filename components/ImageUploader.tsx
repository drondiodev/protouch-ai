import React, { useState, useCallback } from 'react';
import { PortraitIcon, AlertTriangleIcon } from './icons/Icons';
import { useTranslation } from '../context/i18n';
import { validateImageFile, MAX_FILE_SIZE_MB } from '../utils/imageUtils';


interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="mt-4 w-full bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center justify-center gap-3">
    <AlertTriangleIcon className="w-5 h-5" />
    <span>{message}</span>
  </div>
);

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        let errorMessage = t(validation.errorKey!);
        if (validation.errorParams?.maxSize) {
          errorMessage = errorMessage.replace('{maxSize}', validation.errorParams.maxSize.toString());
        }
        setError(errorMessage);
        return;
      }
      setError(null);
      onImageUpload(file);
  }, [onImageUpload, t]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [processFile]
  );

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };


  return (
    <div className="w-full max-w-2xl mx-auto">
        <label
            htmlFor="file-upload"
            className={`
              flex flex-col items-center justify-center w-full h-80 sm:h-96 px-4 transition-all duration-300 
              bg-slate-100/50 border-2 border-dashed rounded-xl cursor-pointer
              ${isDragging ? 'border-slate-400 bg-slate-200' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-100'}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
        >
            <div className="flex flex-col items-center justify-center space-y-4 text-slate-500">
                <div className={`p-4 border-8 rounded-full transition-all ${isDragging ? 'border-slate-300 bg-slate-200' : 'border-slate-200/60 bg-slate-100/0'}`}>
                  <PortraitIcon className={`transition-colors ${isDragging ? 'text-slate-600' : 'text-slate-400'}`}/>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-700 text-lg">
                      {t('uploader.title')}
                  </p>
                  <p className="text-sm mt-1">{t('uploader.subtitle')}</p>
                </div>
                <p className="text-xs text-slate-400 pt-4">{t('uploader.privacy')}</p>
            </div>
            <input id="file-upload" name="file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
        </label>
         {error && <ErrorMessage message={error} />}
    </div>
  );
};

export default ImageUploader;