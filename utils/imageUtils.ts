

export const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // result is in format "data:image/jpeg;base64,..."
      const mimeType = result.split(';')[0].split(':')[1];
      const base64 = result.split(',')[1];
      resolve({ base64, mimeType });
    };
    reader.onerror = (error) => reject(error);
  });
};

export const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export const validateImageFile = (file: File): { isValid: boolean; errorKey?: string; errorParams?: Record<string, any> } => {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { isValid: false, errorKey: 'validation.unsupported_type' };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { isValid: false, errorKey: 'validation.file_too_large', errorParams: { maxSize: MAX_FILE_SIZE_MB } };
  }
  return { isValid: true };
};
