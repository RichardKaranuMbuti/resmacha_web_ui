// src/app/resumes/layout.tsx
import React from 'react';
import { FileText, Upload, Eye, Edit, Trash2 } from 'lucide-react';

interface ResumeLayoutProps {
  children: React.ReactNode;
}

export default function ResumeLayout({ children }: ResumeLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Resume Manager
                </h1>
                <p className="text-sm text-gray-500">
                  Upload, organize, and manage your resumes
                </p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 rounded-full">
                <Upload className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600">Upload</span>
              </div>
              <div className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 rounded-full">
                <Eye className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600">View</span>
              </div>
              <div className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 rounded-full">
                <Edit className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600">Edit</span>
              </div>
              <div className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 rounded-full">
                <Trash2 className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600">Delete</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <FileText className="w-4 h-4" />
              <span>Resume Manager</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Manage your professional documents</span>
            </div>
            <div className="mt-4 sm:mt-0 text-xs text-gray-400">
              Supported formats: PDF (max 10MB)
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}