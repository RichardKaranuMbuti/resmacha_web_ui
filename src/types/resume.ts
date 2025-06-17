// src/types/resume.ts

export interface Resume {
  id: number;
  user_id: number;
  original_filename: string;
  stored_filename: string;
  file_size: number;
  file_size_mb: number;
  content_type: string;
  blob_url: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  has_extracted_text: boolean;
}

export interface ResumeUploadRequest {
  pdf_file: File;
  description?: string;
}

export interface ResumeUploadResponse {
  message: string;
  resume: Resume;
  extracted_text_length: number | null;
}

export interface ResumeListResponse {
  resumes: Resume[];
  total_count: number;
  user_id: number;
}

export interface ResumeTextResponse {
  resume_id: number;
  text_content: string;
  content_length: number;
}

export interface ResumeUpdateRequest {
  description?: string;
}

export interface ResumeDeleteOptions {
  permanent?: boolean;
}

// Hook states and actions
export interface ResumeState {
  resumes: Resume[];
  currentResume: Resume | null;
  latestResume: Resume | null;
  resumeText: string | null;
  isLoading: boolean;
  isUploading: boolean;
  isDeleting: boolean;
  error: string | null;
  uploadProgress: number;
}

export interface UseResumeReturn {
  // State
  resumes: Resume[];
  currentResume: Resume | null;
  latestResume: Resume | null;
  resumeText: string | null;
  isLoading: boolean;
  isUploading: boolean;
  isDeleting: boolean;
  error: string | null;
  uploadProgress: number;

  // Actions
  uploadResume: (file: File, description?: string) => Promise<Resume | null>;
  getResumes: (includeInactive?: boolean) => Promise<void>;
  getResume: (resumeId: number) => Promise<Resume | null>;
  getLatestResume: () => Promise<Resume | null>;
  getResumeContent: (resumeId: number, forceRefresh?: boolean) => Promise<string | null>;
  updateResume: (resumeId: number, data: ResumeUpdateRequest) => Promise<Resume | null>;
  deleteResume: (resumeId: number, permanent?: boolean) => Promise<boolean>;
  refreshResumeText: (resumeId: number) => Promise<boolean>;
  clearError: () => void;
  clearResumeText: () => void;
}

// File validation
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FileValidationOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
}

// Service response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface UploadProgressCallback {
  (progress: number): void;
}

// Constants
export const RESUME_CONSTANTS = {
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_MIME_TYPES: ['application/pdf'],
  ALLOWED_EXTENSIONS: ['.pdf'],
  UPLOAD_TIMEOUT: 30000, // 30 seconds
} as const;

export type ResumeAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_UPLOADING'; payload: boolean }
  | { type: 'SET_DELETING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_UPLOAD_PROGRESS'; payload: number }
  | { type: 'SET_RESUMES'; payload: Resume[] }
  | { type: 'SET_CURRENT_RESUME'; payload: Resume | null }
  | { type: 'SET_LATEST_RESUME'; payload: Resume | null }
  | { type: 'SET_RESUME_TEXT'; payload: string | null }
  | { type: 'ADD_RESUME'; payload: Resume }
  | { type: 'UPDATE_RESUME'; payload: Resume }
  | { type: 'REMOVE_RESUME'; payload: number };

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
} ;