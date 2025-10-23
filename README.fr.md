# ProTouch AI : Fonctionnalités du Projet

ProTouch AI est une application web conçue pour transformer des photos standards en photos de profil professionnelles grâce à la puissance de l'API Gemini. Elle offre une expérience utilisateur fluide et étape par étape, du téléchargement initial au téléchargement final.

## Fonctionnalités Essentielles

- **Génération d'Images par IA**: Utilise le modèle `gemini-2.5-flash-image` de Google pour appliquer des styles artistiques aux photos des utilisateurs.
- **Fonction Backend Sécurisée**: Les appels à l'API Gemini sont gérés par une fonction serverless sécurisée de Netlify, garantissant que la clé API n'est jamais exposée côté client.
- **Processus Guidé en Plusieurs Étapes**: Un processus en 4 étapes (Télécharger, Style, Personnaliser, Télécharger) guide l'utilisateur.
- **Éditeur d'Image Avancé (Pré-génération)**: Un éditeur puissant pour recadrer, déplacer et zoomer sur la photo initiale.
  - **Détection Automatique des Visages**: Cadre intelligemment le visage du sujet lors du téléchargement.
  - **Formats Multiples**: Prend en charge divers formats de recadrage (1:1, 4:3, 16:9, etc.).
  - **Amélioration Automatique**: Ajustements de couleur et de contraste en un clic.
- **Personnalisation Poussée (Post-génération)**: Un ensemble riche d'outils pour personnaliser l'image générée par l'IA.
  - **Badge de Profil Personnalisable**: Ajoutez un badge textuel circulaire (ex: "#OPENTOWORK").
  - **Contrôles Fins**: Ajustez les couleurs, le texte, la taille, l'espacement et le positionnement.
- **Historique Annuler/Rétablir**: Gestion complète de l'historique pour toutes les actions d'édition et de personnalisation.
- **Support Bilingue**: Entièrement localisé en anglais et en français (i18n).
- **Interface Moderne et Responsive**: Construite avec React, Tailwind CSS et Framer Motion pour une expérience fluide sur tous les appareils.

---

## Déroulement Détaillé

### 1. Télécharger & Modifier

- **Téléchargement**: Les utilisateurs peuvent soit glisser-déposer une image, soit en sélectionner une depuis leur appareil. L'application valide le type de fichier (PNG, JPEG, WEBP) et la taille (max 10 Mo).
- **Éditeur d'Image**: Avant d'appliquer un style IA, une fenêtre d'édition puissante s'affiche :
  - **Cadrage Automatique**: Le système utilise l'API `FaceDetector` du navigateur pour détecter automatiquement le plus grand visage et centrer et mettre à l'échelle l'image de manière optimale dans la zone de recadrage.
  - **Ajustements Manuels**: Les utilisateurs peuvent manuellement déplacer, zoomer (avec la molette de la souris, les gestes de pincement ou un curseur) et repositionner l'image.
  - **Format de l'Image**: Les utilisateurs peuvent sélectionner le format final de leur image.
  - **Aperçu**: Un aperçu en direct du résultat recadré est disponible.

### 2. Sélection du Style

- **Styles IA**: L'utilisateur choisit parmi une liste de styles professionnels (par ex. "Portrait Classique", "Look Moderne", "Ambiance Cinéma").
- **Aperçus**: Chaque style est présenté avec une image d'aperçu, une description et une info-bulle détaillée expliquant son esthétique.
- **Génération**: Une fois un style sélectionné, l'application envoie la photo recadrée de l'utilisateur et le prompt textuel correspondant à une fonction serverless sécurisée de Netlify. Cette fonction appelle ensuite l'API Gemini pour générer la nouvelle image et la renvoie au client. Une animation de chargement fournit un retour visuel pendant ce processus.

### 3. Personnalisation

- **Canevas Interactif**: L'image générée par l'IA est affichée sur un canevas interactif. Les utilisateurs peuvent toujours déplacer et zoomer sur l'image à l'intérieur du cadre circulaire final.
- **Panneau de Contrôles**: Un panneau dédié offre des options de personnalisation étendues :
  - **Affichage du Badge**: Affichez ou masquez facilement le badge professionnel.
  - **Personnalisation du Cadre**: Contrôlez la couleur du cadre du badge, son épaisseur et la longueur de l'arc (points de début et de fin).
  - **Personnalisation du Texte**: Modifiez le contenu textuel du badge, sa couleur, la taille de la police, l'espacement des lettres et sa position précise le long de l'arc du cadre.
  - **Arrière-plan**: Changez la couleur de fond à l'intérieur de la zone circulaire du portrait.
- **Annuler/Rétablir**: Toutes les modifications de personnalisation sont suivies, permettant à l'utilisateur de revenir facilement en arrière ou en avant dans ses modifications.

### 4. Télécharger & Partager

- **Aperçu Final**: L'utilisateur voit un aperçu final non interactif de sa création.
- **Téléchargement**: L'image peut être téléchargée sous forme de fichier PNG haute résolution.
- **Partage**: Après le téléchargement, une fenêtre modale apparaît avec des liens rapides vers les plateformes de médias sociaux populaires, encourageant l'utilisateur à partager sa nouvelle photo de profil.

---

## Composants Techniques Clés

- **Stack Frontend**:
  - **React 19**: Pour la construction de l'interface utilisateur.
  - **Tailwind CSS**: Pour un style rapide basé sur des utilitaires.
  - **Framer Motion**: Pour toutes les animations et transitions, créant une expérience utilisateur soignée.
  - **Esbuild**: Pour un build rapide du projet.
- **Backend & Intégration IA**:
  - **Netlify Functions**: Une fonction serverless sert de proxy sécurisé entre le client et l'API Gemini.
  - **SDK @google/genai**: Le SDK officiel est utilisé au sein de la fonction Netlify pour toutes les interactions avec l'API Gemini.
  - **Modèle**: L'application utilise spécifiquement le modèle `gemini-2.5-flash-image`, optimisé pour les tâches d'édition et de génération d'images.
- **Traitement d'Image**:
  - **API HTML Canvas**: Utilisée pour la composition finale de l'image, du badge et de l'arrière-plan. Elle gère également la fonctionnalité de téléchargement en convertissant le canevas en une URL de données.
  - **API du Navigateur**: L'API `FileReader` est utilisée pour gérer le téléchargement d'images, et l'API `FaceDetector` est utilisée pour la fonctionnalité de cadrage automatique.
- **Internationalisation (i18n)**:
  - Un Contexte React personnalisé (`LanguageProvider`) gère la langue actuelle (EN/FR) et fournit une fonction `t` pour récupérer les chaînes de caractères traduites à partir d'un objet JSON.
