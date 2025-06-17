// src/services/resumeService.ts
import { AxiosResponse, AxiosError } from 'axios';
import { matchingAxios} from '../config/axiosConfig';
import { API_ENDPOINTS, HTTP_STATUS } from '../constants/api';
import {
  Resume,
  ResumeUploadResponse,
  ResumeListResponse,
  ResumeTextResponse,
  ResumeUpdateRequest,
  ResumeDeleteOptions,
  ApiResponse,
  UploadProgressCallback,
  RESUME_CONSTANTS
} from '../types/resume';

// Type for legacy API responses
interface LegacyApiResponse {
  [key: string]: unknown;
}

// Type for API error responses
interface ApiErrorResponse {
  message?: string;
  detail?: string;
  [key: string]: unknown;
}

class ResumeService {
  /**
   * Upload a new resume PDF
   */
  async uploadResume(
    file: File, 
    description?: string,
    onProgress?: UploadProgressCallback
  ): Promise<ApiResponse<ResumeUploadResponse>> {
    try {
      const formData = new FormData();
      formData.append('pdf_file', file);
      if (description) {
        formData.append('description', description);
      }

      const response: AxiosResponse<ResumeUploadResponse> = await matchingAxios.post(
        API_ENDPOINTS.RESUME.UPLOAD,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: RESUME_CONSTANTS.UPLOAD_TIMEOUT,
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(progress);
            }
          },
        }
      );

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Get all resumes for the authenticated user
   */
  async getResumes(includeInactive: boolean = false): Promise<ApiResponse<ResumeListResponse>> {
    try {
      const response: AxiosResponse<ResumeListResponse> = await matchingAxios.get(
        API_ENDPOINTS.RESUME.LIST,
        {
          params: { include_inactive: includeInactive }
        }
      );

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Get the latest resume for the authenticated user
   */
  async getLatestResume(): Promise<ApiResponse<Resume>> {
    try {
      const response: AxiosResponse<Resume> = await matchingAxios.get(
        API_ENDPOINTS.RESUME.LATEST
      );

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Get a specific resume by ID
   */
  async getResume(resumeId: number): Promise<ApiResponse<Resume>> {
    try {
      const response: AxiosResponse<Resume> = await matchingAxios.get(
        `${API_ENDPOINTS.RESUME.GET_BY_ID}/${resumeId}`
      );

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Update resume metadata
   */
  async updateResume(
    resumeId: number, 
    data: ResumeUpdateRequest
  ): Promise<ApiResponse<Resume>> {
    try {
      const formData = new FormData();
      if (data.description !== undefined) {
        formData.append('description', data.description || '');
      }

      const response: AxiosResponse<Resume> = await matchingAxios.put(
        `${API_ENDPOINTS.RESUME.UPDATE}/${resumeId}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Delete a resume (soft delete by default)
   */
  async deleteResume(
    resumeId: number, 
    options: ResumeDeleteOptions = {}
  ): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<void> = await matchingAxios.delete(
        `${API_ENDPOINTS.RESUME.DELETE}/${resumeId}`,
        {
          params: { permanent: options.permanent || false }
        }
      );

      return {
        status: response.status,
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Get the text content of a resume
   */
  async getResumeContent(
    resumeId: number, 
    forceRefresh: boolean = false
  ): Promise<ApiResponse<ResumeTextResponse>> {
    try {
      const response: AxiosResponse<ResumeTextResponse> = await matchingAxios.get(
        `${API_ENDPOINTS.RESUME.GET_CONTENT}/${resumeId}/content`,
        {
          params: { force_refresh: forceRefresh }
        }
      );

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Re-extract and update text content from a resume PDF
   */
  async refreshResumeText(resumeId: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<void> = await matchingAxios.post(
        `${API_ENDPOINTS.RESUME.REFRESH_TEXT}/${resumeId}/refresh-text`
      );

      return {
        status: response.status,
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Legacy endpoint - get user resume path (deprecated)
   */
  async getUserResumePath(userId: string): Promise<ApiResponse<LegacyApiResponse>> {
    try {
      const response: AxiosResponse<LegacyApiResponse> = await matchingAxios.get(
        `${API_ENDPOINTS.RESUME.LEGACY_PATH}/${userId}/path`
      );

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Legacy endpoint - get user resume content (deprecated)
   */
  async getUserResumeContentLegacy(userId: string): Promise<ApiResponse<LegacyApiResponse>> {
    try {
      const response: AxiosResponse<LegacyApiResponse> = await matchingAxios.get(
        `${API_ENDPOINTS.RESUME.LEGACY_CONTENT}/${userId}/content`
      );

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Handle API errors consistently
   */
  private handleError(error: AxiosError): ApiResponse<never> {
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data as ApiErrorResponse;
      const message = errorData?.message || 
                     errorData?.detail || 
                     `Request failed with status ${error.response.status}`;
      
      return {
        error: message,
        status: error.response.status,
      };
    } else if (error.request) {
      // Request made but no response received
      return {
        error: 'Network error - please check your connection',
        status: 0,
      };
    } else {
      // Error in request setup
      return {
        error: error.message || 'An unexpected error occurred',
        status: 0,
      };
    }
  }

  /**
   * Check if a resume exists and is accessible
   */
  async checkResumeExists(resumeId: number): Promise<boolean> {
    try {
      const response = await this.getResume(resumeId);
      return response.status === HTTP_STATUS.OK && !!response.data;
    } catch {
      return false;
    }
  }

  /**
   * Download resume file (if blob_url is accessible)
   */
  async downloadResume(resume: Resume): Promise<void> {
    try {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = resume.blob_url;
      link.download = resume.original_filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (downloadError) {
      throw new Error(`Failed to download resume: ${downloadError instanceof Error ? downloadError.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const resumeService = new ResumeService();
export default resumeService;