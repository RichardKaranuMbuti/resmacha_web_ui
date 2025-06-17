// src/utils/fileUtils.ts

/**
 * File utility functions for handling file operations, validation, and formatting
 */

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  PDF: 'application/pdf',
} as const;

// File size limits
export const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  MAX_FILE_SIZE_MB: 10,
} as const;

// File validation errors
export const FILE_VALIDATION_ERRORS = {
  INVALID_TYPE: 'Invalid file type. Only PDF files are allowed.',
  FILE_TOO_LARGE: `File size exceeds the maximum limit of ${FILE_SIZE_LIMITS.MAX_FILE_SIZE_MB}MB.`,
  NO_FILE: 'No file selected.',
  INVALID_FILE: 'Invalid file.',
} as const;

/**
 * Validates if a file is a valid PDF
 */
export const isValidPDF = (file: File): boolean => {
  return file.type === SUPPORTED_FILE_TYPES.PDF || file.name.toLowerCase().endsWith('.pdf');
};

/**
 * Validates file size
 */
export const isValidFileSize = (file: File): boolean => {
  return file.size <= FILE_SIZE_LIMITS.MAX_FILE_SIZE_BYTES;
};

/**
 * Comprehensive file validation for resume uploads
 */
export const validateResumeFile = (file: File | null): { isValid: boolean; error?: string } => {
  if (!file) {
    return { isValid: false, error: FILE_VALIDATION_ERRORS.NO_FILE };
  }

  if (!isValidPDF(file)) {
    return { isValid: false, error: FILE_VALIDATION_ERRORS.INVALID_TYPE };
  }

  if (!isValidFileSize(file)) {
    return { isValid: false, error: FILE_VALIDATION_ERRORS.FILE_TOO_LARGE };
  }

  return { isValid: true };
};

/**
 * Formats file size in bytes to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Converts bytes to megabytes with precision
 */
export const bytesToMB = (bytes: number): number => {
  return Number((bytes / (1024 * 1024)).toFixed(2));
};

/**
 * Converts megabytes to bytes
 */
export const mbToBytes = (mb: number): number => {
  return mb * 1024 * 1024;
};

/**
 * Extracts file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

/**
 * Generates a safe filename by removing/replacing unsafe characters
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace unsafe chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
};

/**
 * Creates a unique filename with timestamp
 */
export const createUniqueFilename = (originalFilename: string): string => {
  const timestamp = Date.now();
  const extension = getFileExtension(originalFilename);
  const nameWithoutExt = originalFilename.replace(`.${extension}`, '');
  const sanitizedName = sanitizeFilename(nameWithoutExt);
  
  return `${sanitizedName}_${timestamp}.${extension}`;
};

/**
 * Reads file as ArrayBuffer
 */
export const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Reads file as Data URL (base64)
 */
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Creates FormData for file upload
 */
export const createResumeFormData = (file: File, description?: string): FormData => {
  const formData = new FormData();
  formData.append('pdf_file', file);
  
  if (description) {
    formData.append('description', description);
  }
  
  return formData;
};

/**
 * Validates and prepares file for upload
 */
export const prepareFileForUpload = (
  file: File, 
  description?: string
): { isValid: boolean; error?: string; formData?: FormData } => {
  const validation = validateResumeFile(file);
  
  if (!validation.isValid) {
    return { isValid: false, error: validation.error };
  }

  const formData = createResumeFormData(file, description);
  
  return { isValid: true, formData };
};

/**
 * File drop handler utility
 */
export const handleFileDrop = (event: DragEvent): File | null => {
  event.preventDefault();
  event.stopPropagation();

  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) {
    return null;
  }

  return files[0];
};

/**
 * Drag over handler utility
 */
export const handleDragOver = (event: DragEvent): void => {
  event.preventDefault();
  event.stopPropagation();
};

/**
 * File input change handler utility
 */
export const handleFileInputChange = (event: Event): File | null => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  
  if (!files || files.length === 0) {
    return null;
  }
  
  return files[0];
};

/**
 * Download file from blob URL
 */
export const downloadFile = (blobUrl: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Check if file is recent (uploaded within specified hours)
 */
export const isFileRecent = (uploadDate: string, hoursThreshold: number = 24): boolean => {
  const uploadTime = new Date(uploadDate).getTime();
  const now = Date.now();
  const threshold = hoursThreshold * 60 * 60 * 1000; // Convert hours to milliseconds
  
  return (now - uploadTime) < threshold;
};

/**
 * Format upload date for display
 */
export const formatUploadDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return 'Today';
  } else if (diffDays === 2) {
    return 'Yesterday';
  } else if (diffDays <= 7) {
    return `${diffDays - 1} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

/**
 * Get file type icon/emoji
 */
export const getFileTypeIcon = (contentType: string): string => {
  switch (contentType) {
    case SUPPORTED_FILE_TYPES.PDF:
      return '📄';
    default:
      return '📁';
  }
};

/**
 * Truncate filename for display
 */
export const truncateFilename = (filename: string, maxLength: number = 30): string => {
  if (filename.length <= maxLength) {
    return filename;
  }

  const extension = getFileExtension(filename);
  const nameWithoutExt = filename.replace(`.${extension}`, '');
  const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 4) + '...';
  
  return `${truncatedName}.${extension}`;
};