// src/components/resumes/ResumeUpload.tsx
import React, { useState, useCallback } from 'react';
import {  CheckCircle, AlertCircle, X } from 'lucide-react';
import { FileDropZone } from '@src/components/ui/FileDropZone';
import { ProgressBar } from '@src/components/ui/ProgressBar';
import { FileIcon } from '@src/components/ui/FileIcon';
import { useResume } from '@src/hooks/useResume';
import { formatFileSize } from '@src/utils/fileUtils';
import type { Resume } from '@src/types/resume';

interface ResumeUploadProps {
  onUploadSuccess?: (resume: Resume) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  showDescription?: boolean;
  maxDescriptionLength?: number;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  className = '',
  showDescription = true,
  maxDescriptionLength = 200
}) => {
  const {
    uploadResume,
    isUploading,
    uploadProgress,
    error,
    clearError
  } = useResume();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadedResume, setUploadedResume] = useState<Resume | null>(null);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setUploadComplete(false);
    setUploadedResume(null);
    clearError();
  }, [clearError]);

  // Handle upload
  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      const resume = await uploadResume(
        selectedFile,
        description.trim() || undefined
      );

      if (resume) {
        setUploadComplete(true);
        setUploadedResume(resume);
        onUploadSuccess?.(resume);
      } else if (error) {
        onUploadError?.(error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      onUploadError?.(errorMessage);
    }
  }, [selectedFile, description, uploadResume, error, onUploadSuccess, onUploadError]);

  // Reset form
  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setDescription('');
    setUploadComplete(false);
    setUploadedResume(null);
    clearError();
  }, [clearError]);

  // Remove selected file
  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    clearError();
  }, [clearError]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Complete State */}
      {uploadComplete && uploadedResume && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">
                Resume uploaded successfully!
              </h3>
              <div className="mt-2 flex items-center space-x-2">
                <FileIcon
                  fileName={uploadedResume.original_filename}
                  contentType="application/pdf"
                  variant="success"
                  size="sm"
                />
                <span className="text-sm text-green-700">
                  {uploadedResume.original_filename}
                </span>
              </div>
              {uploadedResume.description && (
                <p className="mt-1 text-sm text-green-600">
                  {uploadedResume.description}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleReset}
            className="mt-4 text-sm text-green-600 hover:text-green-800 font-medium"
          >
            Upload another resume
          </button>
        </div>
      )}

      {/* Upload Form */}
      {!uploadComplete && (
        <>
          {/* File Drop Zone */}
          {!selectedFile && (
            <FileDropZone
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
              disabled={isUploading}
            />
          )}

          {/* Selected File Display */}
          {selectedFile && !isUploading && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileIcon
                    fileName={selectedFile.name}
                    contentType={selectedFile.type}
                    size="md"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  title="Remove file"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
          )}

          {/* Description Input */}
          {selectedFile && showDescription && !isUploading && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={maxDescriptionLength}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                        focus:ring-blue-500 focus:border-blue-500 resize-none
                        placeholder-gray-500 text-gray-900 bg-white
                        focus:bg-white focus:outline-none caret-blue-500"
                placeholder="Add a brief description for this resume version..."
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>Help identify different versions of your resume</span>
                <span className="font-medium">{description.length}/{maxDescriptionLength}</span>
              </div>
            </div>
          )}
          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-4">
              {selectedFile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <FileIcon
                      fileName={selectedFile.name}
                      contentType={selectedFile.type}
                      size="md"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-blue-600">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <ProgressBar
                progress={uploadProgress}
                label="Uploading resume..."
                variant="default"
                animated
                showIcon
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    Upload failed
                  </h3>
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                </div>
                <button
                  onClick={clearError}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                >
                  <X size={14} className="text-red-500" />
                </button>
              </div>
            </div>
          )}

          {/* Upload Button */}
          {selectedFile && !isUploading && (
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white 
                         border border-gray-300 rounded-md hover:bg-gray-50 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 
                         focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 
                         border border-transparent rounded-md hover:bg-blue-700 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 
                         focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                Upload Resume
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};