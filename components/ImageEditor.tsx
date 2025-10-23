import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, PanInfo } from 'framer-motion';
import SliderControl from './SliderControl';
import Button from './Button';
import { useTranslation } from '../context/i18n';
import { UndoIcon, RedoIcon, AlertTriangleIcon, SparklesIcon, ResetIcon } from './icons/Icons';
import Loader from './Loader';


// --- FaceDetector API typings for browsers that support it ---
declare global {
  interface Window {
    FaceDetector: typeof FaceDetector;
  }
  interface FaceDetectorOptions {
    maxDetectedFaces?: number;
    fastMode?: boolean;
  }
  interface DetectedFace {
    boundingBox: DOMRectReadOnly;
  }
  class FaceDetector {
    constructor(options?: FaceDetectorOptions);
    detect(image: ImageBitmapSource): Promise<DetectedFace[]>;
  }
}
// --- End FaceDetector API typings ---


// --- useHistory Hook ---
// Placed here to avoid creating new files as per constraints.
function useHistory<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const state = history[currentIndex];
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const pushState = useCallback((newState: T) => {
    const newHistory = history.slice(0, currentIndex + 1);
    
    if (JSON.stringify(newHistory[newHistory.length - 1]) === JSON.stringify(newState)) {
      return;
    }

    newHistory.push(newState);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [history, currentIndex]);
  
  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex(i => i - 1);
    }
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex(i => i + 1);
    }
  }, [canRedo]);
  
  const reset = useCallback((newState: T) => {
    setHistory([newState]);
    setCurrentIndex(0);
  }, []);

  return { state, pushState, undo, redo, canUndo, canRedo, reset };
}
// --- End useHistory Hook ---


interface ImageEditorProps {
  imageFile: File;
  onConfirm: (editedImageFile: File, newAspectRatio: string) => void;
  onCancel: () => void;
  aspectRatio: string;
}

type Area = { x: number; y: number; width: number; height: number };

// Helper functions
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputWidth: number,
  outputHeight: number,
  filters?: string,
): Promise<Blob> {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get canvas context.");
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    if (filters) {
        ctx.filter = filters;
    }

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputWidth,
      outputHeight,
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas to Blob conversion failed."));
        }
      }, "image/png", 1);
    });
  } catch (error) {
    console.error("Error in getCroppedImg:", error);
    throw new Error("Could not process the image. Please try another one.");
  }
}

const parseAspectRatio = (ratio: string): number => {
    const [w, h] = ratio.split(':').map(Number);
    if (h > 0 && w > 0) return w / h;
    return 1;
};

const CROP_CONTAINER_SIZE = 320;
const MIN_SCALE = 0.1;
const MAX_SCALE = 5;
const ENHANCE_FILTERS = 'brightness(1.05) contrast(1.05) saturate(1.1)';

const aspectRatios = [
    { label: '1:1', value: '1:1' },
    { label: '4:3', value: '4:3' },
    { label: '16:9', value: '16:9' },
    { label: '3:4', value: '3:4' },
    { label: '9:16', value: '9:16' },
];

const ImageEditor: React.FC<ImageEditorProps> = ({ imageFile, onConfirm, onCancel, aspectRatio }) => {
  const { t } = useTranslation();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(aspectRatio);
  const [faceDetectionStatus, setFaceDetectionStatus] = useState<'idle' | 'detecting' | 'detected' | 'not-detected' | 'error'>('idle');
  const [isEnhanced, setIsEnhanced] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const isNewImage = useRef(true);

  const { 
    state: transformState, 
    pushState, 
    undo, 
    redo, 
    canUndo, 
    canRedo,
    reset: resetHistory
  } = useHistory({ scale: 1, position: { x: 0, y: 0 }});

  const [liveTransformState, setLiveTransformState] = useState(transformState);
  
  const currentRatio = useMemo(() => parseAspectRatio(selectedAspectRatio), [selectedAspectRatio]);
  const cropAreaWidth = useMemo(() => currentRatio >= 1 ? CROP_CONTAINER_SIZE : CROP_CONTAINER_SIZE * currentRatio, [currentRatio]);
  const cropAreaHeight = useMemo(() => currentRatio <= 1 ? CROP_CONTAINER_SIZE : CROP_CONTAINER_SIZE / currentRatio, [currentRatio]);

  useEffect(() => {
      setLiveTransformState(transformState);
  }, [transformState]);
  
  const panStartPos = useRef({ x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStartDist = useRef(0);
  const pinchStartScale = useRef(1);

  const resetTransformToFit = useCallback((imgWidth: number, imgHeight: number, cropWidth: number, cropHeight: number) => {
      const widthRatio = cropWidth / imgWidth;
      const heightRatio = cropHeight / imgHeight;
      const initialScale = Math.max(widthRatio, heightRatio);
      const initialState = { scale: initialScale, position: {x: 0, y: 0} };
      resetHistory(initialState);
      setLiveTransformState(initialState);
  }, [resetHistory]);
  
  useEffect(() => {
    isNewImage.current = true;
    const url = URL.createObjectURL(imageFile);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = async () => {
      const { naturalWidth: imgWidth, naturalHeight: imgHeight } = img;
      setImageSize({ width: imgWidth, height: imgHeight });

      if (isNewImage.current) {
        isNewImage.current = false;
        
        if (!('FaceDetector' in window)) {
            console.warn('FaceDetector API not supported.');
            resetTransformToFit(imgWidth, imgHeight, cropAreaWidth, cropAreaHeight);
            setFaceDetectionStatus('not-detected');
            return;
        }
        
        setFaceDetectionStatus('detecting');
        try {
            const faceDetector = new window.FaceDetector();
            const faces = await faceDetector.detect(img);

            if (faces.length > 0) {
                const largestFace = faces.reduce((prev, current) => 
                    (prev.boundingBox.width * prev.boundingBox.height > current.boundingBox.width * current.boundingBox.height) ? prev : current
                );
                
                const { boundingBox } = largestFace;
                const PADDING_FACTOR = 1.8;

                const faceWidthWithPadding = boundingBox.width * PADDING_FACTOR;
                const faceHeightWithPadding = boundingBox.height * PADDING_FACTOR;
                const scaleX = cropAreaWidth / faceWidthWithPadding;
                const scaleY = cropAreaHeight / faceHeightWithPadding;
                
                const newScale = Math.min(scaleX, scaleY);
                const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

                const faceCenterX = boundingBox.x + boundingBox.width / 2;
                const faceCenterY = boundingBox.y + boundingBox.height / 2;
                const scaledFaceCenterX = (faceCenterX - imgWidth / 2) * clampedScale;
                const scaledFaceCenterY = (faceCenterY - imgHeight / 2) * clampedScale;
                
                let newPosition = { x: -scaledFaceCenterX, y: -scaledFaceCenterY };

                const newScaledWidth = imgWidth * clampedScale;
                const newScaledHeight = imgHeight * clampedScale;
                const newMaxPanX = Math.max(0, (newScaledWidth - cropAreaWidth) / 2);
                const newMaxPanY = Math.max(0, (newScaledHeight - cropAreaHeight) / 2);

                newPosition.x = Math.max(-newMaxPanX, Math.min(newMaxPanX, newPosition.x));
                newPosition.y = Math.max(-newMaxPanY, Math.min(newMaxPanY, newPosition.y));
                
                resetHistory({ scale: clampedScale, position: newPosition });
                setFaceDetectionStatus('detected');
            } else {
                resetTransformToFit(imgWidth, imgHeight, cropAreaWidth, cropAreaHeight);
                setFaceDetectionStatus('not-detected');
            }
        } catch (err) {
            console.error("Face detection failed:", err);
            resetTransformToFit(imgWidth, imgHeight, cropAreaWidth, cropAreaHeight);
            setFaceDetectionStatus('error');
        }
      } else {
        // Aspect ratio changed, just fit the image
        resetTransformToFit(imgWidth, imgHeight, cropAreaWidth, cropAreaHeight);
      }
    };
    
    editorRef.current?.focus();
  }, [imageUrl, selectedAspectRatio, resetHistory, resetTransformToFit]);

  useEffect(() => {
    const currentUrl = croppedImageUrl;
    return () => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [croppedImageUrl]);

  const handleAspectRatioChange = (newRatio: string) => {
    setSelectedAspectRatio(newRatio);
  };

  const { scale, position } = liveTransformState;
  const scaledWidth = imageSize.width * scale;
  const scaledHeight = imageSize.height * scale;
  const maxPanX = Math.max(0, (scaledWidth - cropAreaWidth) / 2);
  const maxPanY = Math.max(0, (scaledHeight - cropAreaHeight) / 2);
  
  const performCrop = useCallback(async (): Promise<Blob | null> => {
    if (!imageSize.width || !imageSize.height || !imageUrl) return null;

    const pixelCrop: Area = {
      x: (scaledWidth/2 - cropAreaWidth/2 - position.x) / scale,
      y: (scaledHeight/2 - cropAreaHeight/2 - position.y) / scale,
      width: cropAreaWidth / scale,
      height: cropAreaHeight / scale,
    };
    
    const OUTPUT_RESOLUTION = 1024;
    const ratio = parseAspectRatio(selectedAspectRatio);
    const outputWidth = ratio >= 1 ? OUTPUT_RESOLUTION : OUTPUT_RESOLUTION * ratio;
    const outputHeight = ratio <= 1 ? OUTPUT_RESOLUTION : OUTPUT_RESOLUTION / ratio;
    const filtersToApply = isEnhanced ? ENHANCE_FILTERS : undefined;

    return getCroppedImg(imageUrl, pixelCrop, Math.round(outputWidth), Math.round(outputHeight), filtersToApply);
  }, [imageUrl, scale, position.x, position.y, imageSize, scaledWidth, scaledHeight, selectedAspectRatio, cropAreaWidth, cropAreaHeight, isEnhanced]);


  const handleCropPreview = useCallback(async () => {
    setIsPreviewing(true);
    setError(null);
    try {
      const croppedBlob = await performCrop();
      if (croppedBlob) {
        if (croppedImageUrl) URL.revokeObjectURL(croppedImageUrl);
        setCroppedImageUrl(URL.createObjectURL(croppedBlob));
      }
    } catch (e) {
      setError(t('editor.crop_error'));
    } finally {
      setIsPreviewing(false);
    }
  }, [performCrop, croppedImageUrl, t]);


  const handleConfirm = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    try {
        const blobToConfirm = await performCrop();

        if (blobToConfirm) {
          const newFile = new File([blobToConfirm], imageFile.name, { type: 'image/png' });
          onConfirm(newFile, selectedAspectRatio);
        } else {
          throw new Error("Cropping failed, blob is null.");
        }
    } catch(e) {
        setError(t('editor.crop_error'));
        setIsProcessing(false);
    }
  }, [performCrop, imageFile.name, onConfirm, t, selectedAspectRatio]);

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (pointers.current.has(e.pointerId)) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (pointers.current.size === 2) {
      const ps = Array.from(pointers.current.values());
      const dist = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);

      if (pinchStartDist.current === 0) {
        pinchStartDist.current = dist;
        pinchStartScale.current = scale;
      } else {
        const newScale =
          pinchStartScale.current * (dist / pinchStartDist.current);
        const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
        setLiveTransformState(s => ({...s, scale: clampedScale }));
      }
    }
  };
  
  const handlePointerUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) {
      pinchStartDist.current = 0;
    }
    pushState(liveTransformState);
  };

  const commitTimerRef = useRef<number | null>(null);

  const debouncedPushState = useCallback((state: { scale: number, position: { x: number, y: number }}) => {
    if (commitTimerRef.current) {
      clearTimeout(commitTimerRef.current);
    }
    commitTimerRef.current = window.setTimeout(() => {
      pushState(state);
    }, 500); // Commit after 500ms of inactivity
  }, [pushState]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const panStep = 10;
    
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        return;
    }
    e.preventDefault();

    let newX = liveTransformState.position.x;
    let newY = liveTransformState.position.y;

    switch (e.key) {
        case 'ArrowUp': newY -= panStep; break;
        case 'ArrowDown': newY += panStep; break;
        case 'ArrowLeft': newX -= panStep; break;
        case 'ArrowRight': newX += panStep; break;
    }

    const clampedX = Math.max(-maxPanX, Math.min(maxPanX, newX));
    const clampedY = Math.max(-maxPanY, Math.min(maxPanY, newY));
    
    const newState = { ...liveTransformState, position: { x: clampedX, y: clampedY }};
    setLiveTransformState(newState);
    debouncedPushState(newState);
  }, [maxPanX, maxPanY, liveTransformState, debouncedPushState]);


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    >
      <motion.div 
        ref={editorRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-4xl p-6 focus:outline-none"
      >
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">{t('editor.title')}</h2>
        
        <div className="flex flex-col md:flex-row gap-8">
            <motion.div
              className="flex-1 flex items-center justify-center bg-slate-200/50 rounded-lg overflow-hidden relative cursor-grab active:cursor-grabbing touch-none"
              style={{ height: CROP_CONTAINER_SIZE, width: '100%' }}
            >
              <motion.div
                  className="relative"
                  style={{ width: cropAreaWidth, height: cropAreaHeight }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onPanStart={() => { panStartPos.current = position; }}
                  onPan={(_event, info: PanInfo) => {
                    const newX = panStartPos.current.x + info.offset.x;
                    const newY = panStartPos.current.y + info.offset.y;
                    const clampedX = Math.max(-maxPanX, Math.min(maxPanX, newX));
                    const clampedY = Math.max(-maxPanY, Math.min(maxPanY, newY));
                    setLiveTransformState(s => ({ ...s, position: { x: clampedX, y: clampedY } }));
                  }}
                  onPanEnd={() => pushState(liveTransformState)}
              >
                  {faceDetectionStatus === 'detecting' && (
                    <div className="absolute inset-0 bg-slate-800/50 flex flex-col items-center justify-center z-20 text-white">
                        <Loader small light />
                        <span className="mt-2 text-sm font-medium">{t('editor.detecting_face')}</span>
                    </div>
                  )}
                  {imageUrl && (
                    <motion.img
                      src={imageUrl}
                      alt="User upload"
                      className="absolute pointer-events-none"
                      style={{
                        maxWidth: 'none',
                        top: '50%',
                        left: '50%',
                        translateX: '-50%',
                        translateY: '-50%',
                      }}
                      width={imageSize.width}
                      height={imageSize.height}
                      animate={{
                        x: position.x,
                        y: position.y,
                        scale: scale,
                        filter: isEnhanced ? ENHANCE_FILTERS : 'none',
                      }}
                      transition={{ 
                        default: { type: 'spring', stiffness: 300, damping: 30 },
                        filter: { duration: 0.3, ease: 'easeInOut' }
                      }}
                    />
                  )}
                  <div className="absolute inset-0 pointer-events-none" style={{boxShadow: '0 0 0 9999px rgba(30, 41, 59, 0.7)', border: '2px solid white'}}></div>
              </motion.div>
            </motion.div>

            <div className="flex flex-col gap-4 md:w-48">
              <Button onClick={handleCropPreview} disabled={isProcessing || isPreviewing}>
                {isPreviewing ? <><Loader small /> {t('editor.processing')}</> : t('editor.crop_preview')}
              </Button>
              <div className="relative w-full shrink-0 overflow-hidden rounded-lg border bg-slate-100" style={{aspectRatio: currentRatio}}>
                {isPreviewing && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                        <Loader small />
                    </div>
                )}
                {croppedImageUrl ? (
                  <img
                    src={croppedImageUrl}
                    alt="Cropped result"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-slate-500">
                    {t('editor.image_preview')}
                  </div>
                )}
              </div>
            </div>
        </div>
        
        <div className="mt-6">
            <label className="block text-sm font-medium text-slate-600 text-center mb-3">{t('editor.aspect_ratio')}</label>
            <div className="flex justify-center flex-wrap gap-2">
                {aspectRatios.map(ratio => (
                    <button
                        key={ratio.value}
                        onClick={() => handleAspectRatioChange(ratio.value)}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                            selectedAspectRatio === ratio.value 
                            ? 'bg-slate-800 text-white shadow' 
                            : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        {ratio.label}
                    </button>
                ))}
            </div>
        </div>

        <div className="mt-6 max-w-md mx-auto">
            <SliderControl 
              label={t('editor.zoom')} 
              value={scale} 
              onChange={(newScale) => setLiveTransformState(s => ({...s, scale: newScale}))}
              onCommit={() => pushState(liveTransformState)}
              min={MIN_SCALE} 
              max={MAX_SCALE} 
              step={0.01} 
            />
        </div>

        <div className="flex justify-between items-center mt-8">
             <div className="flex items-center gap-2 flex-wrap">
                <Button onClick={undo} disabled={!canUndo || isProcessing} aria-label="Undo" variant="secondary" size="normal" className="!px-3">
                    <UndoIcon className="w-5 h-5" />
                </Button>
                <Button onClick={redo} disabled={!canRedo || isProcessing} aria-label="Redo" variant="secondary" size="normal" className="!px-3">
                    <RedoIcon className="w-5 h-5" />
                </Button>
                <Button 
                    onClick={() => {
                        if (imageSize.width > 0 && imageSize.height > 0) {
                            resetTransformToFit(imageSize.width, imageSize.height, cropAreaWidth, cropAreaHeight);
                        }
                    }} 
                    disabled={isProcessing} 
                    variant="secondary" 
                    size="normal"
                >
                    {t('editor.auto_fit')}
                </Button>
                <Button
                    onClick={() => setIsEnhanced(!isEnhanced)}
                    variant="secondary"
                    disabled={isProcessing}
                    size="normal"
                    className={isEnhanced ? 'bg-slate-200 border-slate-400' : ''}
                >
                    {isEnhanced ? (
                        <>
                            <ResetIcon />
                            {t('editor.reset_enhance')}
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5" />
                            {t('editor.auto_enhance')}
                        </>
                    )}
                </Button>
            </div>
            <div className="flex justify-end gap-4">
                <Button variant="secondary" onClick={onCancel} disabled={isProcessing}>{t('editor.cancel')}</Button>
                <Button variant="primary" onClick={handleConfirm} disabled={isProcessing || isPreviewing || !!error}>
                    {isProcessing ? <><Loader small light /> {t('editor.processing')}</> : t('editor.confirm')}
                </Button>
            </div>
        </div>

        {error && (
          <div className="mt-4 text-center text-sm text-red-700 bg-red-100 border border-red-200 p-3 rounded-md flex items-center justify-center gap-2">
            <AlertTriangleIcon className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ImageEditor;