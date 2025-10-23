# ProTouch AI: Project Features

ProTouch AI is a web application designed to transform standard photos into professional-grade profile pictures using the power of the Gemini API. It provides a seamless, step-by-step user experience from initial upload to final download.

## Core Features

- **AI-Powered Image Generation**: Utilizes Google's `gemini-2.5-flash-image` model to apply artistic styles to user photos.
- **Secure Backend Function**: API calls to Gemini are handled by a secure Netlify serverless function, ensuring the API key is never exposed on the client-side.
- **Multi-Step Guided Workflow**: A 4-step process (Upload, Style, Customize, Download) guides the user.
- **Advanced Pre-Generation Image Editor**: A powerful editor to crop, pan, and zoom the initial photo.
  - **Automatic Face Detection**: Intelligently frames the subject's face upon upload.
  - **Multiple Aspect Ratios**: Supports various crop ratios (1:1, 4:3, 16:9, etc.).
  - **Auto-Enhancement**: One-click color and contrast adjustments.
- **Extensive Post-Generation Customization**: A rich set of tools to personalize the AI-generated image.
  - **Customizable Profile Badge**: Add a circular text badge (e.g., "#OPENTOWORK").
  - **Fine-Grained Controls**: Adjust colors, text, sizing, spacing, and placement.
- **Undo/Redo History**: Full history management for all editing and customization actions.
- **Bilingual Support**: Fully localized in English and French (i18n).
- **Responsive & Modern UI**: Built with React, Tailwind CSS, and Framer Motion for a fluid experience on all devices.

---

## Detailed Workflow

### 1. Upload & Edit

- **Upload**: Users can either drag-and-drop an image or select one from their device. The uploader validates files for type (PNG, JPEG, WEBP) and size (max 10MB).
- **Image Editor**: Before applying an AI style, the user is presented with a powerful editing modal:
  - **Auto-Framing**: The system uses the browser's `FaceDetector` API to automatically detect the largest face and optimally centers and scales the image within the crop area.
  - **Manual Adjustments**: Users can manually pan, zoom (with mouse wheel, pinch gestures, or a slider), and reposition the image.
  - **Aspect Ratio**: Users can select the final aspect ratio for their image.
  - **Preview**: A live preview of the cropped result is available.

### 2. Style Selection

- **AI Styles**: The user chooses from a curated list of professional styles (e.g., "Classic Portrait", "Modern Look", "Cinematic Feel").
- **Previews**: Each style is presented with a preview image, a description, and a detailed tooltip explaining its aesthetic.
- **Generation**: Once a style is selected, the application sends the cropped user photo and the corresponding text prompt to a secure Netlify serverless function. This function then calls the Gemini API to generate the new image and returns it to the client. A loading animation provides feedback during this process.

### 3. Customization

- **Interactive Canvas**: The AI-generated image is displayed on an interactive canvas. Users can still pan and zoom the image within the final circular frame.
- **Controls Panel**: A dedicated panel offers extensive customization options:
  - **Badge Toggle**: Easily show or hide the professional badge.
  - **Frame Customization**: Control the badge's frame color, thickness, and arc length (start and end points).
  - **Text Customization**: Modify the badge's text content, color, font size, letter spacing, and its precise position along the frame's arc.
  - **Background**: Change the background color within the circular portrait area.
- **Undo/Redo**: All customization changes are tracked, allowing the user to easily step backward and forward through their edits.

### 4. Download & Share

- **Final Preview**: The user sees a final, non-interactive preview of their creation.
- **Download**: The image can be downloaded as a high-resolution PNG file.
- **Share**: After downloading, a modal appears with quick links to popular social media platforms, encouraging the user to share their new profile picture.

---

## Key Technical Components

- **Frontend Stack**:
  - **React 19**: For building the user interface.
  - **Tailwind CSS**: For rapid, utility-first styling.
  - **Framer Motion**: For all animations and transitions, creating a polished user experience.
  - **Esbuild**: For fast project bundling.
- **Backend & AI Integration**:
  - **Netlify Functions**: A serverless function acts as a secure proxy between the client and the Gemini API.
  - **@google/genai SDK**: The official SDK is used within the Netlify function for all interactions with the Gemini API.
  - **Model**: The application specifically leverages the `gemini-2.5-flash-image` model, which is optimized for image editing and generation tasks.
- **Image Processing**:
  - **HTML Canvas API**: Used for the final composition of the image, badge, and background. It also powers the download functionality by converting the canvas to a data URL.
  - **Browser APIs**: The `FileReader` API is used to handle image uploads, and the `FaceDetector` API is used for the auto-framing feature.
- **Internationalization (i18n)**:
  - A custom React Context (`LanguageProvider`) manages the current language (EN/FR) and provides a `t` function for retrieving translated strings from a JSON object.
