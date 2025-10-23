import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { generateAiProfilePicture } from './services/geminiService';
import { fileToBase64, validateImageFile, MAX_FILE_SIZE_MB } from './utils/imageUtils';
import ImageUploader from './components/ImageUploader';
import ImageEditor from './components/ImageEditor';
import ImageCanvas from './components/ImageCanvas';
import Button from './components/Button';
import Loader, { PulsingLoader } from './components/Loader';
import ControlsPanel from './components/ControlsPanel';
import Stepper from './components/Stepper';
import { SparklesIcon, DownloadIcon, UndoIcon, RedoIcon, HelpIcon, PortraitIcon, SlidersIcon, CheckIcon, CopyIcon, AlertTriangleIcon } from './components/icons/Icons';
import { PROMPTS } from './prompts';
import { useTranslation } from './context/i18n';

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
      setCurrentIndex(i => i - 1);
    }
  }, [canRedo]);
  
  const reset = useCallback((newState: T) => {
    setHistory([newState]);
    setCurrentIndex(0);
  }, []);

  return { state, pushState, undo, redo, canUndo, canRedo, reset };
}
// --- End useHistory Hook ---

// --- Tooltip Component ---
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="relative" 
            onMouseEnter={() => setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md shadow-lg z-20"
                    >
                        {text}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
// --- End Tooltip Component ---


// --- WelcomeModal Component ---
// Placed here to avoid creating new files.
const WelcomeModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTranslation();

  const welcomeSteps = [
    {
      icon: <PortraitIcon className="w-8 h-8 text-slate-500" />,
      title: t('welcome.step1_title'),
      desc: t('welcome.step1_desc'),
    },
    {
      icon: <SparklesIcon />,
      title: t('welcome.step2_title'),
      desc: t('welcome.step2_desc'),
    },
    {
      icon: <SlidersIcon className="w-8 h-8 text-slate-500" />,
      title: t('welcome.step3_title'),
      desc: t('welcome.step3_desc'),
    },
    {
      icon: <DownloadIcon />,
      title: t('welcome.step4_title'),
      desc: t('welcome.step4_desc'),
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-slate-900">{t('welcome.title')}</h2>
        <p className="mt-2 text-slate-600 max-w-md mx-auto">{t('welcome.intro')}</p>

        <div className="mt-8 space-y-4 text-left">
          {welcomeSteps.map((step, index) => (
             <div key={index} className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg">
                <div className="flex-shrink-0 w-12 h-12 bg-slate-200/70 rounded-full flex items-center justify-center">
                    {step.icon}
                </div>
                <div>
                    <h3 className="font-semibold text-slate-800">{step.title}</h3>
                    <p className="text-sm text-slate-500">{step.desc}</p>
                </div>
            </div>
          ))}
        </div>
        
        <Button onClick={onClose} variant="primary" size="large" className="mt-8 w-full sm:w-auto">
            {t('welcome.button')}
        </Button>
      </motion.div>
    </motion.div>
  );
};
// --- End WelcomeModal Component ---

// --- ShareModal Component ---
const ShareModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => {
    const { t } = useTranslation();
    const [copyText, setCopyText] = useState(t('share.copy_link'));

    const socialLinks = [
        { name: 'LinkedIn', url: 'https://www.linkedin.com/feed/', iconUrl: 'https://img.icons8.com/3d-fluency/94/linkedin--v2.png' },
        { name: 'X', url: 'https://x.com/', iconUrl: 'https://img.icons8.com/3d-fluency/94/x.png' },
        { name: 'GitHub', url: 'https://github.com/', iconUrl: 'https://img.icons8.com/3d-fluency/94/github.png' },
        { name: 'Instagram', url: 'https://instagram.com/', iconUrl: 'https://img.icons8.com/3d-fluency/94/instagram-new.png' },
        { name: 'Discord', url: 'https://discord.com/', iconUrl: 'https://img.icons8.com/3d-fluency/94/discord-logo.png' },
    ];

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopyText(t('share.copied'));
            setTimeout(() => setCopyText(t('share.copy_link')), 2000);
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <img src={imageUrl} alt={t('share.alt')} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-slate-200 shadow-lg" />
                <h2 className="text-2xl font-bold text-slate-900">{t('share.title')}</h2>
                <p className="mt-2 text-slate-600">{t('share.intro')}</p>

                <div className="mt-6 flex justify-center gap-4">
                    {socialLinks.map(link => (
                        <a href={link.url} key={link.name} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                            <img src={link.iconUrl} alt={link.name} className="w-12 h-12" />
                        </a>
                    ))}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <Button onClick={handleCopyLink} variant="secondary" size="large" className="w-full">
                        {copyText === t('share.copied') ? <CheckIcon className="w-5 h-5 text-green-600" /> : <CopyIcon className="w-5 h-5" />}
                        {copyText}
                    </Button>
                    <Button onClick={onClose} variant="primary" size="large" className="w-full">
                        {t('share.button')}
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
};
// --- End ShareModal Component ---

type ImageCanvasHandle = {
  downloadImage: () => void;
};

const socialIcons = [
    { name: 'LinkedIn', url: 'https://img.icons8.com/3d-fluency/94/linkedin--v2.png' },
    { name: 'X', url: 'https://img.icons8.com/3d-fluency/94/x.png' },
    { name: 'GitHub', url: 'https://img.icons8.com/3d-fluency/94/github.png' },
    { name: 'Instagram', url: 'https://img.icons8.com/3d-fluency/94/instagram-new.png' },
    { name: 'Discord', url: 'https://img.icons8.com/3d-fluency/94/discord-logo.png' },
];

const initialCustomizationState = {
  showBadge: false,
  scale: 1,
  offset: { x: 0, y: 0 },
  frameThickness: 60,
  frameStartPosition: 16,
  frameEndPosition: 56,
  badgeText: '#OPENTOWORK',
  badgeColor: '#000000',
  badgeTextColor: '#FFFFFF',
  fontSize: 44,
  letterSpacing: 0,
  textPlacement: 130,
  backgroundColor: '#FFFFFF',
};

type CustomizationState = typeof initialCustomizationState;

export default function App() {
  const { t, setLanguage, language } = useTranslation();
  
  const steps = [
    { title: t('stepper.upload'), description: t('stepper.upload_desc') },
    { title: t('stepper.style'), description: t('stepper.style_desc') },
    { title: t('stepper.badge'), description: t('stepper.badge_desc') },
    { title: t('stepper.download'), description: t('stepper.download_desc') }
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [rawImage, setRawImage] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState<string>(PROMPTS[0].id);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  
  const canvasRef = useRef<ImageCanvasHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hasVisited = localStorage.getItem('protouchai_has_visited');
    if (!hasVisited) {
      setShowWelcomeModal(true);
      localStorage.setItem('protouchai_has_visited', 'true');
    }
  }, []);

  // --- History State Management for Customization ---
  const { 
    state: historyState, 
    pushState, 
    undo, 
    redo, 
    canUndo, 
    canRedo,
    reset: resetHistory
  } = useHistory(initialCustomizationState);
  
  const [customizationState, setCustomizationState] = useState(initialCustomizationState);

  useEffect(() => {
      setCustomizationState(historyState);
  }, [historyState]);
  
  const handleCommit = useCallback(() => {
    pushState(customizationState);
  }, [customizationState, pushState]);

  const handleCustomizationChange = <K extends keyof CustomizationState>(key: K, value: CustomizationState[K]) => {
      setCustomizationState(prev => ({ ...prev, [key]: value }));
  };

  const handleInstantCustomizationChange = <K extends keyof CustomizationState>(key: K, value: CustomizationState[K]) => {
      const newState = { ...customizationState, [key]: value };
      setCustomizationState(newState);
      pushState(newState);
  };
  // --- End History State Management ---

  const resetTransformationState = useCallback(() => {
      resetHistory(initialCustomizationState);
  }, [resetHistory]);

  const handleImageUpload = (file: File) => {
    setRawImage(file);
  };

  const handleEditConfirm = (editedFile: File, newAspectRatio: string) => {
    setOriginalImage(editedFile);
    setAspectRatio(newAspectRatio);
    setRawImage(null); // Close editor
    setGeneratedImageUrl(null);
    setError(null);
    setIsLoading(false);
    resetTransformationState();
    setCurrentStep(2);
  }
  
  const handleEditCancel = () => {
      setRawImage(null);
  }

  const handleStartGeneration = useCallback(async () => {
    if (!originalImage) return;

    setIsLoading(true);
    setError(null);

    try {
      const selectedPrompt = PROMPTS.find(p => p.id === selectedPromptId);
      if (!selectedPrompt) {
        throw new Error("Invalid prompt selected.");
      }
      const { base64, mimeType } = await fileToBase64(originalImage);
      const aiGeneratedImage = await generateAiProfilePicture(base64, mimeType, selectedPrompt.prompt);
      setGeneratedImageUrl(aiGeneratedImage);
      resetTransformationState();
      setCurrentStep(3); // Go to next step only on success
    } catch (err) {
      console.error(err);
      setError(t('step2.error'));
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, selectedPromptId, t, resetTransformationState]);
  
  const handleReplaceClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        let errorMessage = t(validation.errorKey!);
        if (validation.errorParams?.maxSize) {
          errorMessage = errorMessage.replace('{maxSize}', validation.errorParams.maxSize.toString());
        }
        setError(errorMessage);
        e.target.value = ''; // Reset file input
        return;
      }
      setError(null); // Clear previous errors on valid upload
      setRawImage(file);
    }
    e.target.value = '';
  };

  const handleDownloadClick = () => {
    canvasRef.current?.downloadImage();
    setShowShareModal(true);
  };
  
  const handleResetApp = () => {
    setRawImage(null);
    setOriginalImage(null);
    setGeneratedImageUrl(null);
    setError(null);
    setIsLoading(false);
    resetTransformationState();
    setAspectRatio('1:1');
    setCurrentStep(1);
  }

  const LanguageSwitcher = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const selectLanguage = (lang: 'en' | 'fr') => {
      setLanguage(lang);
      setIsOpen(false);
    };

    return (
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 h-9 bg-zinc-900 text-white rounded-full border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 focus:ring-slate-500"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <span className="font-medium">{language.toUpperCase()}</span>
           <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.1 }}
              className="absolute left-1/2 -translate-x-1/2 mt-2 origin-top bg-zinc-900 border border-zinc-700 rounded-md shadow-lg z-10"
            >
              <ul className="text-white py-1">
                <li>
                  <button
                    onClick={() => selectLanguage('en')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-zinc-800 font-medium ${language === 'en' ? 'text-slate-400' : ''}`}
                  >
                    EN
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => selectLanguage('fr')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-zinc-800 font-medium ${language === 'fr' ? 'text-slate-400' : ''}`}
                  >
                    FR
                  </button>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
  
  const HeaderControls = () => (
    <>
      <button
        onClick={() => setShowWelcomeModal(true)}
        className="h-9 w-9 flex items-center justify-center bg-white text-slate-600 rounded-full border border-slate-300 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 focus:ring-slate-500"
        aria-label={t('welcome.help_aria')}
      >
        <HelpIcon className="w-5 h-5" />
      </button>
      <LanguageSwitcher />
    </>
  );

  const PromptSelector = () => (
    <div className='w-full max-w-md'>
      <p className="text-sm text-slate-500 mb-4 font-semibold uppercase tracking-wider">{t('prompts.styleTitle')}</p>
      <div className="flex flex-col gap-4">
        {PROMPTS.map((prompt) => (
          <Tooltip key={prompt.id} text={t(prompt.tooltipKey)}>
            <button
              onClick={() => !prompt.disabled && !isLoading && setSelectedPromptId(prompt.id)}
              disabled={prompt.disabled || isLoading}
              className={`
                relative text-left w-full border rounded-lg p-4 transition-all duration-200
                bg-white shadow-sm
                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 focus-visible:ring-slate-500
                ${selectedPromptId === prompt.id 
                  ? 'border-slate-500 ring-2 ring-slate-500/30' 
                  : 'border-slate-200 hover:border-slate-400'
                }
                ${prompt.disabled || isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex gap-4 items-center">
                <img src={prompt.previewImage} alt={`${t(prompt.titleKey)} preview`} className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
                <div>
                    <h3 className={`font-semibold text-slate-800`}>{t(prompt.titleKey)}</h3>
                    <p className={`mt-1 text-sm text-slate-500`}>
                      {t(prompt.descriptionKey)}
                    </p>
                </div>
              </div>
              {prompt.disabled && (
                <div className="absolute top-2 right-2">
                  <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{t('prompts.comingSoon')}</span>
                </div>
              )}
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  );

  const motionProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: "easeInOut" as const }
  };

  const renderContent = () => {
    switch (currentStep) {
        case 1:
            return <motion.div key="step1" {...motionProps} className="w-full"><ImageUploader onImageUpload={handleImageUpload} /></motion.div>;
        case 2:
            const selectedPrompt = PROMPTS.find(p => p.id === selectedPromptId);
            return (
                 <motion.div key="step2" {...motionProps} className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr,max-content] lg:items-end gap-8 lg:gap-12">
                     <div className="lg:order-2 flex flex-col items-center">
                        <p className="text-sm text-slate-500 mb-4 font-semibold uppercase tracking-wider">{t('step2.stylePreview')}</p>
                        <div className="relative w-full max-w-lg aspect-square bg-slate-100 rounded-lg shadow-lg border border-slate-200 p-2 overflow-hidden">
                            {isLoading && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10 rounded-md">
                                    <PulsingLoader />
                                    <p className="text-slate-500 font-medium">{t('step2.generating')}</p>
                                </div>
                            )}
                            <motion.img 
                                src={originalImage ? URL.createObjectURL(originalImage) : (selectedPrompt ? selectedPrompt.exampleImage : '')}
                                alt={originalImage ? 'Your photo' : (selectedPrompt ? `${t(selectedPrompt.titleKey)} example` : '')}
                                className="rounded-md w-full h-full object-cover"
                                animate={{ scale: isLoading ? 1.05 : 1 }}
                                transition={{ duration: isLoading ? 1.5 : 0.3, ease: 'easeInOut', repeat: isLoading ? Infinity : 0, repeatType: 'reverse' }}
                            />
                        </div>
                         <div className="grid grid-cols-2 gap-4 mt-6 w-full max-w-lg">
                             <Button onClick={handleReplaceClick} variant="secondary" size="large" disabled={isLoading}>
                                {t('step2.changePhoto')}
                            </Button>
                            <Button onClick={handleStartGeneration} variant="primary" size="large" disabled={isLoading || !originalImage}>
                                {isLoading ? <><Loader small light /> {t('step2.generating')}</> : <><SparklesIcon /> {t('step2.generate')}</>}
                            </Button>
                        </div>
                         {error && (
                            <div className="mt-4 w-full max-w-lg text-sm text-red-700 bg-red-100 border border-red-200 p-3 rounded-md flex items-center justify-center gap-2">
                                <AlertTriangleIcon className="w-5 h-5" />
                                <span>{error}</span>
                            </div>
                        )}
                     </div>
                     <div className="lg:order-1">
                        <PromptSelector />
                     </div>
                </motion.div>
            )
        case 3:
             return (
                <motion.div key="step3" {...motionProps} className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
                    <div className="lg:col-span-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900">{t('step3.customize')}</h3>
                            <div className="flex items-center gap-2">
                                <Button onClick={undo} disabled={!canUndo} aria-label="Undo" variant="secondary" size="normal" className="!px-3">
                                    <UndoIcon className="w-5 h-5" />
                                </Button>
                                <Button onClick={redo} disabled={!canRedo} aria-label="Redo" variant="secondary" size="normal" className="!px-3">
                                    <RedoIcon className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                        <ControlsPanel 
                           settings={customizationState}
                           onSettingChange={handleCustomizationChange}
                           onInstantSettingChange={handleInstantCustomizationChange}
                           onCommit={handleCommit}
                        />
                    </div>
                    <div className="lg:col-span-8 flex flex-col items-center">
                        <div className="w-full max-w-[512px] bg-white rounded-lg border border-slate-200 shadow-lg p-2">
                          {generatedImageUrl ? (
                            <ImageCanvas 
                                ref={canvasRef} 
                                imageUrl={generatedImageUrl}
                                aspectRatio={aspectRatio}
                                offset={customizationState.offset}
                                onOffsetChange={(v) => handleCustomizationChange('offset', v)}
                                onCommit={handleCommit}
                                scale={customizationState.scale}
                                showBadge={customizationState.showBadge}
                                badgeProps={{
                                    frameThickness: customizationState.frameThickness,
                                    frameStartPosition: customizationState.frameStartPosition,
                                    frameEndPosition: customizationState.frameEndPosition,
                                    badgeText: customizationState.badgeText,
                                    badgeColor: customizationState.badgeColor,
                                    badgeTextColor: customizationState.badgeTextColor,
                                    fontSize: customizationState.fontSize,
                                    letterSpacing: customizationState.letterSpacing,
                                    textPlacement: customizationState.textPlacement,
                                    backgroundColor: customizationState.backgroundColor,
                                }}
                            />
                          ) : null}
                        </div>
                        <div className="flex items-center gap-4 mt-6">
                            <Button onClick={() => setCurrentStep(2)} variant="secondary">{t('step3.back')}</Button>
                            <Button onClick={() => setCurrentStep(4)} variant="primary" size="large" disabled={!generatedImageUrl}>{t('step3.continue')}</Button>
                        </div>
                    </div>
                </motion.div>
            );
        case 4:
            return (
                <motion.div key="step4" {...motionProps} className="flex flex-col items-center text-center">
                    <div className="w-full max-w-[512px] bg-white rounded-lg border border-slate-200 shadow-lg p-2">
                        <ImageCanvas 
                            ref={canvasRef} 
                            imageUrl={generatedImageUrl!}
                            aspectRatio={aspectRatio}
                            offset={customizationState.offset}
                            onOffsetChange={(v) => handleCustomizationChange('offset', v)}
                            scale={customizationState.scale}
                            showBadge={customizationState.showBadge}
                            badgeProps={{
                                frameThickness: customizationState.frameThickness,
                                frameStartPosition: customizationState.frameStartPosition,
                                frameEndPosition: customizationState.frameEndPosition,
                                badgeText: customizationState.badgeText,
                                badgeColor: customizationState.badgeColor,
                                badgeTextColor: customizationState.badgeTextColor,
                                fontSize: customizationState.fontSize,
                                letterSpacing: customizationState.letterSpacing,
                                textPlacement: customizationState.textPlacement,
                                backgroundColor: customizationState.backgroundColor,
                            }}
                        />
                    </div>
                    <p className="text-lg text-slate-500 mt-8 mb-4">{t('step4.ready')}</p>
                    <div className="flex items-center gap-4">
                        <Button onClick={() => setCurrentStep(3)} variant="secondary">{t('step4.backToEdit')}</Button>
                        <Button onClick={handleDownloadClick} variant="primary" size="large">
                            <DownloadIcon /> {t('step4.download')}
                        </Button>
                    </div>
                     <Button onClick={handleResetApp} variant="secondary" className="mt-8">
                        {t('step4.startOver')}
                    </Button>
                </motion.div>
            )
        default:
            return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center p-6 sm:p-12 font-sans">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
      />
      
      <AnimatePresence>
        {showWelcomeModal && <WelcomeModal onClose={() => setShowWelcomeModal(false)} />}
      </AnimatePresence>
      
      <AnimatePresence>
        {showShareModal && generatedImageUrl && (
          <ShareModal 
            imageUrl={generatedImageUrl} 
            onClose={() => setShowShareModal(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rawImage && (
          <ImageEditor
            imageFile={rawImage}
            aspectRatio={aspectRatio}
            onConfirm={handleEditConfirm}
            onCancel={handleEditCancel}
          />
        )}
      </AnimatePresence>
      
      <header className="w-full max-w-6xl text-center mb-12">
        <div className="relative sm:flex sm:justify-center sm:items-center">
            <div className="flex justify-center sm:absolute sm:right-0 items-center gap-2 mb-6 sm:mb-0">
                <HeaderControls />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {t('header.title')}
            </h1>
        </div>
         <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 text-lg font-medium text-slate-600">
            <span>{t('header.subtitle_prefix')}</span>
            <div className="flex items-center gap-2">
                {socialIcons.map(({ name, url }) => (
                    <img key={name} src={url} alt={name} className="w-7 h-7" />
                ))}
            </div>
        </div>
        <p className="mt-4 text-lg text-slate-500 max-w-3xl mx-auto">
          {t('header.description')}
        </p>
      </header>

      <div className="w-full max-w-6xl mb-12 bg-zinc-900 p-6 rounded-xl shadow-lg">
          <Stepper steps={steps} currentStep={currentStep} />
      </div>

      <main className="w-full max-w-7xl flex-grow flex items-center justify-center">
          <AnimatePresence mode="wait">
              {renderContent()}
          </AnimatePresence>
      </main>

      <footer className="w-full max-w-7xl mx-auto text-center py-8">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} Drondiodev. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}