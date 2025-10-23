import React, { createContext, useState, useContext, ReactNode } from 'react';

type Translations = {
  [key: string]: string | Translations;
};

const translations: { [key: string]: Translations } = {
  en: {
    header: {
      title: 'ProTouch AI',
      subtitle_prefix: 'Perfect your photo. Post with confidence — on',
      description: 'Give your photo the polish of a high-end photoshoot — no studio, no photographer, just a few clicks.',
    },
    welcome: {
      title: 'Welcome to ProTouch AI!',
      intro: 'Create a stunning, professional profile picture in just a few simple steps.',
      step1_title: 'Upload Photo',
      step1_desc: 'Start with a clear, well-lit photo of yourself.',
      step2_title: 'Choose Style',
      step2_desc: 'Apply one of our AI-powered styles to transform your image.',
      step3_title: 'Customize',
      step3_desc: 'Add a professional badge and fine-tune the details to your liking.',
      step4_title: 'Download',
      step4_desc: 'Save your new portrait and share it with your network!',
      button: 'Get Started',
      help_aria: 'Show help guide',
    },
    share: {
      title: 'Share Your New Look!',
      intro: "Your new portrait is ready to be seen. Update your profile on your favorite platforms.",
      alt: 'Generated profile picture',
      copy_link: 'Copy Link',
      copied: 'Copied!',
      button: 'Done'
    },
    stepper: {
      upload: 'Upload Photo',
      upload_desc: 'Select your image',
      style: 'Choose Style',
      style_desc: 'Apply an AI look',
      badge: 'Customize',
      badge_desc: 'Add your personal touch',
      download: 'Download',
      download_desc: 'Save your portrait',
    },
    uploader: {
      title: 'Upload Your Photo',
      subtitle: 'Drag and drop or click to select a file',
      privacy: "We'll never store or share your photo. Your privacy is safe.",
    },
    editor: {
      title: 'Edit Your Photo',
      zoom: 'Zoom',
      cancel: 'Cancel',
      confirm: 'Confirm',
      processing: 'Processing...',
      crop_preview: 'Crop preview',
      image_preview: 'Image preview',
      crop_error: 'Could not process image for cropping. Please try again or use a different photo.',
      aspect_ratio: 'Aspect Ratio',
      auto_fit: 'Auto-Fit',
      detecting_face: 'Detecting face...',
      auto_enhance: 'Auto-Enhance',
      reset_enhance: 'Reset Enhance',
    },
    prompts: {
      styleTitle: 'Style',
      classic_title: 'Classic Portrait',
      classic_description: 'A timeless black and white portrait for a sharp, confident look.',
      classic_tooltip: "Evokes the elegance of studio photography. This style creates a high-contrast, black and white image with soft lighting, perfect for a look of quiet authority. Ideal for authors, academics, or anyone seeking a sophisticated feel.",
      modern_title: 'Modern Look',
      modern_description: 'A clean, simple aesthetic for a contemporary feel.',
      modern_tooltip: "Clean, crisp, and contemporary. This style uses bright, soft lighting against a neutral background to create a sharp portrait. It's perfect for tech professionals, entrepreneurs, and modern creatives who want to convey focus and clarity.",
      realistic_title: 'Studio Finish',
      realistic_description: 'A high-contrast, hyper-realistic look for a bold and impactful photo.',
      realistic_tooltip: "Bold, dramatic, and unforgettable. This simulates a high-end magazine cover shoot with cinematic lighting that sculpts your features. The striking contrast and flawless finish make it ideal for a powerful online presence.",
      cinematic_title: 'Cinematic Feel',
      cinematic_description: 'A moody, film-like portrait for a storytelling and impactful presence.',
      cinematic_tooltip: "Tell a story with a single image. This style uses moody lighting and rich color grading to create a portrait with the dramatic depth of a film still. Perfect for artists or anyone wanting to convey an enigmatic and thoughtful persona.",
      vintage_title: 'Retro Film',
      vintage_description: 'A warm, film-grain style that evokes timeless elegance and nostalgia.',
      vintage_tooltip: "Capture the warm nostalgia of classic film photography. This style applies a delicate grain and warm tones for a timeless, elegant look. It's ideal for a relaxed yet sophisticated profile that feels both authentic and artistically curated.",
      comingSoon: 'Soon',
    },
    step2: {
        yourPhoto: 'Your Photo',
        stylePreview: 'Style Preview',
        changePhoto: 'Change Photo',
        generate: 'Generate',
        generating: 'Generating...',
        error: 'Failed to generate AI portrait. Please try again or select a different photo.',
    },
    step3: {
        customize: 'Customize',
        back: 'Back',
        continue: 'Continue',
    },
    step4: {
        ready: 'Your AI portrait is ready!',
        backToEdit: 'Back to Edit',
        download: 'Download',
        startOver: 'Start Over',
    },
    controls: {
        showBadge: 'Show Badge',
        image: 'Image',
        scale: 'Scale',
        background: 'Background',
        frame: 'Frame',
        color: 'Color',
        thickness: 'Thickness',
        start: 'Start',
        end: 'End',
        text: 'Text',
        content: 'Content',
        fontSize: 'Font Size',
        spacing: 'Spacing',
        placement: 'Placement',
        tooltip_scale: 'Adjust the zoom level of your photo.',
        tooltip_thickness: 'Controls the width of the circular frame.',
        tooltip_start: 'Sets the starting point of the frame arc.',
        tooltip_end: 'Sets the ending point of the frame arc.',
        tooltip_fontSize: 'Changes the size of the text on the badge.',
        tooltip_spacing: 'Adjusts the space between letters in the text.',
        tooltip_placement: 'Moves the text along the circular frame.',
    },
    loader: {
      generating: 'Generating your portrait...',
    },
    validation: {
      unsupported_type: 'Unsupported file type. Please use PNG, JPEG, or WEBP.',
      file_too_large: 'File is too large. Maximum size is {maxSize}MB.',
    },
  },
  fr: {
    header: {
      title: 'ProTouch AI',
      subtitle_prefix: 'Perfectionnez votre photo. Publiez avec confiance — sur',
      description: "Donnez à votre photo l'élégance d'un portrait professionnel — sans studio, sans photographe, en quelques clics.",
    },
    welcome: {
      title: 'Bienvenue sur ProTouch AI !',
      intro: 'Créez une photo de profil professionnelle et époustouflante en quelques étapes simples.',
      step1_title: 'Télécharger une Photo',
      step1_desc: 'Commencez avec une photo claire et bien éclairée de vous.',
      step2_title: 'Choisir le Style',
      step2_desc: "Appliquez l'un de nos styles IA pour transformer votre image.",
      step3_title: 'Personnaliser',
      step3_desc: 'Ajoutez un badge professionnel et ajustez les détails à votre goût.',
      step4_title: 'Télécharger',
      step4_desc: 'Enregistrez votre nouveau portrait et partagez-le avec votre réseau !',
      button: 'Commencer',
      help_aria: "Afficher le guide d'aide",
    },
    share: {
      title: 'Partagez Votre Nouveau Look !',
      intro: "Votre nouveau portrait est prêt à être vu. Mettez à jour votre profil sur vos plateformes préférées.",
      alt: 'Photo de profil générée',
      copy_link: 'Copier le Lien',
      copied: 'Copié !',
      button: 'Terminé'
    },
    stepper: {
      upload: 'Télécharger',
      upload_desc: 'Sélectionnez votre image',
      style: 'Choisir le Style',
      style_desc: 'Appliquez un style IA',
      badge: 'Personnaliser',
      badge_desc: 'Ajoutez votre touche',
      download: 'Télécharger',
      download_desc: 'Sauvegardez le portrait',
    },
    uploader: {
      title: 'Téléchargez Votre Photo',
      subtitle: 'Glissez-déposez ou cliquez pour sélectionner un fichier',
      privacy: "Nous ne conserverons ni ne partagerons jamais votre photo. Votre vie privée est en sécurité.",
    },
    editor: {
      title: 'Modifier Votre Photo',
      zoom: 'Zoom',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      processing: 'Traitement...',
      crop_preview: 'Aperçu du recadrage',
      image_preview: "Aperçu de l'image",
      crop_error: "Impossible de traiter l'image pour le recadrage. Veuillez réessayer ou utiliser une autre photo.",
      aspect_ratio: 'Format',
      auto_fit: 'Ajuster',
      detecting_face: 'Détection du visage...',
      auto_enhance: 'Amélioration auto',
      reset_enhance: 'Réinitialiser',
    },
    prompts: {
      styleTitle: 'Style',
      classic_title: 'Portrait Classique',
      classic_description: 'Un portrait intemporel en noir et blanc pour un look net et confiant.',
      classic_tooltip: "Évoque l'élégance de la photographie de studio. Ce style crée une image en noir et blanc très contrastée avec un éclairage doux, parfait pour un look d'autorité tranquille. Idéal pour les auteurs, universitaires ou toute personne recherchant une touche sophistiquée.",
      modern_title: 'Look Moderne',
      modern_description: 'Une esthétique épurée et simple pour une ambiance contemporaine.',
      modern_tooltip: "Propre, net et contemporain. Ce style utilise un éclairage vif et doux sur un fond neutre pour créer un portrait précis. Il est parfait pour les professionnels de la tech, les entrepreneurs et les créatifs modernes qui veulent transmettre la concentration et la clarté.",
      realistic_title: 'Finition Studio',
      realistic_description: 'Un look hyper-réaliste à fort contraste pour une photo audacieuse et percutante.',
      realistic_tooltip: "Audacieux, dramatique et inoubliable. Simule une séance photo de couverture de magazine haut de gamme avec un éclairage cinématique qui sculpte vos traits. Le contraste saisissant et la finition impeccable le rendent idéal pour une présence en ligne puissante.",
      cinematic_title: 'Ambiance Cinéma',
      cinematic_description: "Un portrait d'ambiance, de type film, pour une présence narrative et percutante.",
      cinematic_tooltip: "Racontez une histoire en une seule image. Ce style utilise un éclairage d'ambiance et un étalonnage colorimétrique riche pour créer un portrait avec la profondeur dramatique d'un film. Parfait pour les artistes ou toute personne souhaitant transmettre une personnalité énigmatique et réfléchie.",
      vintage_title: 'Pellicule Rétro',
      vintage_description: "Un style chaleureux avec un grain de film qui évoque une élégance intemporelle et de la nostalgie.",
      vintage_tooltip: "Capturez la nostalgie chaleureuse de la photographie argentique classique. Ce style applique un grain délicat et des tons chauds pour un look intemporel et élégant. Idéal pour un profil détendu mais sophistiqué qui semble à la fois authentique et artistiquement soigné.",
      comingSoon: 'Bientôt',
    },
    step2: {
        yourPhoto: 'Votre Photo',
        stylePreview: 'Aperçu du Style',
        changePhoto: 'Changer la Photo',
        generate: 'Générer',
        generating: 'Génération...',
        error: "Échec de la génération du portrait IA. Veuillez réessayer ou sélectionner une autre photo.",
    },
    step3: {
        customize: 'Personnaliser',
        back: 'Retour',
        continue: 'Continuer',
    },
    step4: {
        ready: 'Votre portrait IA est prêt !',
        backToEdit: "Retour à l'édition",
        download: 'Télécharger',
        startOver: 'Recommencer',
    },
    controls: {
        showBadge: 'Afficher le Badge',
        image: 'Image',
        scale: 'Échelle',
        background: 'Arrière-plan',
        frame: 'Cadre',
        color: 'Couleur',
        thickness: 'Épaisseur',
        start: 'Début',
        end: 'Fin',
        text: 'Texte',
        content: 'Contenu',
        fontSize: 'Taille de police',
        spacing: 'Espacement',
        placement: 'Position',
        tooltip_scale: 'Ajustez le niveau de zoom de votre photo.',
        tooltip_thickness: 'Contrôle la largeur du cadre circulaire.',
        tooltip_start: "Définit le point de départ de l'arc du cadre.",
        tooltip_end: "Définit le point de fin de l'arc du cadre.",
        tooltip_fontSize: 'Modifie la taille du texte sur le badge.',
        tooltip_spacing: "Ajuste l'espace entre les lettres du texte.",
        tooltip_placement: 'Déplace le texte le long du cadre circulaire.',
    },
    loader: {
      generating: 'Génération de votre portrait...',
    },
    validation: {
      unsupported_type: 'Type de fichier non supporté. Veuillez utiliser PNG, JPEG ou WEBP.',
      file_too_large: 'Le fichier est trop volumineux. La taille maximale est de {maxSize} Mo.',
    },
  },
};

const get = (obj: any, path: string): string => {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    result = result?.[key];
    if (result === undefined) return path;
  }
  return result;
};


type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key: string) => {
    return get(translations[language], key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};