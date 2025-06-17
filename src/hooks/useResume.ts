// src/hooks/useResume.ts
import { useReducer, useCallback, useEffect } from 'react';
import { resumeService } from '../services/resumeService';
import { 
  Resume,
  ResumeState,
  ResumeAction,
  UseResumeReturn,
  ResumeUpdateRequest,
  HTTP_STATUS
} from '../types/resume';

// Initial state
const initialState: ResumeState = {
  resumes: [],
  currentResume: null,
  latestResume: null,
  resumeText: null,
  isLoading: false,
  isUploading: false,
  isDeleting: false,
  error: null,
  uploadProgress: 0,
};

// Reducer function
function resumeReducer(state: ResumeState, action: ResumeAction): ResumeState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_UPLOADING':
      return { ...state, isUploading: action.payload };
    
    case 'SET_DELETING':
      return { ...state, isDeleting: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_UPLOAD_PROGRESS':
      return { ...state, uploadProgress: action.payload };
    
    case 'SET_RESUMES':
      return { ...state, resumes: action.payload };
    
    case 'SET_CURRENT_RESUME':
      return { ...state, currentResume: action.payload };
    
    case 'SET_LATEST_RESUME':
      return { ...state, latestResume: action.payload };
    
    case 'SET_RESUME_TEXT':
      return { ...state, resumeText: action.payload };
    
    case 'ADD_RESUME':
      return { 
        ...state, 
        resumes: [action.payload, ...state.resumes],
        latestResume: action.payload 
      };
    
    case 'UPDATE_RESUME':
      return {
        ...state,
        resumes: state.resumes.map(resume =>
          resume.id === action.payload.id ? action.payload : resume
        ),
        currentResume: state.currentResume?.id === action.payload.id 
          ? action.payload 
          : state.currentResume,
        latestResume: state.latestResume?.id === action.payload.id 
          ? action.payload 
          : state.latestResume,
      };
    
    case 'REMOVE_RESUME':
      return {
        ...state,
        resumes: state.resumes.filter(resume => resume.id !== action.payload),
        currentResume: state.currentResume?.id === action.payload 
          ? null 
          : state.currentResume,
        latestResume: state.latestResume?.id === action.payload 
          ? null 
          : state.latestResume,
      };
    
    default:
      return state;
  }
}

export const useResume = (): UseResumeReturn => {
  const [state, dispatch] = useReducer(resumeReducer, initialState);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Clear resume text
  const clearResumeText = useCallback(() => {
    dispatch({ type: 'SET_RESUME_TEXT', payload: null });
  }, []);

  // Upload resume
  const uploadResume = useCallback(async (
    file: File, 
    description?: string
  ): Promise<Resume | null> => {
    dispatch({ type: 'SET_UPLOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: 0 });

    try {
      const response = await resumeService.uploadResume(
        file,
        description,
        (progress) => {
          dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: progress });
        }
      );

      if (response.error) {
        dispatch({ type: 'SET_ERROR', payload: response.error });
        return null;
      }

      if (response.data) {
        dispatch({ type: 'ADD_RESUME', payload: response.data.resume });
        dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: 100 });
        return response.data.resume;
      }

      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return null;
    } finally {
      dispatch({ type: 'SET_UPLOADING', payload: false });
    }
  }, []);

  // Get all resumes
  const getResumes = useCallback(async (includeInactive: boolean = false): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await resumeService.getResumes(includeInactive);

      if (response.error) {
        dispatch({ type: 'SET_ERROR', payload: response.error });
        return;
      }

      if (response.data) {
        dispatch({ type: 'SET_RESUMES', payload: response.data.resumes });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch resumes';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Get specific resume
  const getResume = useCallback(async (resumeId: number): Promise<Resume | null> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await resumeService.getResume(resumeId);

      if (response.error) {
        dispatch({ type: 'SET_ERROR', payload: response.error });
        return null;
      }

      if (response.data) {
        dispatch({ type: 'SET_CURRENT_RESUME', payload: response.data });
        return response.data;
      }

      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch resume';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Get latest resume
  const getLatestResume = useCallback(async (): Promise<Resume | null> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await resumeService.getLatestResume();

      if (response.error) {
        dispatch({ type: 'SET_ERROR', payload: response.error });
        return null;
      }

      if (response.data) {
        dispatch({ type: 'SET_LATEST_RESUME', payload: response.data });
        return response.data;
      }

      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch latest resume';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Get resume content
  const getResumeContent = useCallback(async (
    resumeId: number, 
    forceRefresh: boolean = false
  ): Promise<string | null> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await resumeService.getResumeContent(resumeId, forceRefresh);

      if (response.error) {
        dispatch({ type: 'SET_ERROR', payload: response.error });
        return null;
      }

      if (response.data) {
        dispatch({ type: 'SET_RESUME_TEXT', payload: response.data.text_content });
        return response.data.text_content;
      }

      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch resume content';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Update resume
  const updateResume = useCallback(async (
    resumeId: number, 
    data: ResumeUpdateRequest
  ): Promise<Resume | null> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await resumeService.updateResume(resumeId, data);

      if (response.error) {
        dispatch({ type: 'SET_ERROR', payload: response.error });
        return null;
      }

      if (response.data) {
        dispatch({ type: 'UPDATE_RESUME', payload: response.data });
        return response.data;
      }

      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update resume';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Delete resume
  const deleteResume = useCallback(async (
    resumeId: number, 
    permanent: boolean = false
  ): Promise<boolean> => {
    dispatch({ type: 'SET_DELETING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await resumeService.deleteResume(resumeId, { permanent });

      if (response.error) {
        dispatch({ type: 'SET_ERROR', payload: response.error });
        return false;
      }

      if (response.status === HTTP_STATUS.OK) {
        dispatch({ type: 'REMOVE_RESUME', payload: resumeId });
        return true;
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete resume';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    } finally {
      dispatch({ type: 'SET_DELETING', payload: false });
    }
  }, []);

  // Refresh resume text
  const refreshResumeText = useCallback(async (resumeId: number): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await resumeService.refreshResumeText(resumeId);

      if (response.error) {
        dispatch({ type: 'SET_ERROR', payload: response.error });
        return false;
      }

      // After refreshing, get the updated content
      if (response.status === HTTP_STATUS.OK) {
        await getResumeContent(resumeId, true);
        return true;
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh resume text';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [getResumeContent]);

  // Auto-load latest resume on mount
  useEffect(() => {
    getLatestResume();
  }, [getLatestResume]);

  return {
    // State
    resumes: state.resumes,
    currentResume: state.currentResume,
    latestResume: state.latestResume,
    resumeText: state.resumeText,
    isLoading: state.isLoading,
    isUploading: state.isUploading,
    isDeleting: state.isDeleting,
    error: state.error,
    uploadProgress: state.uploadProgress,

    // Actions
    uploadResume,
    getResumes,
    getResume,
    getLatestResume,
    getResumeContent,
    updateResume,
    deleteResume,
    refreshResumeText,
    clearError,
    clearResumeText,
  };
};