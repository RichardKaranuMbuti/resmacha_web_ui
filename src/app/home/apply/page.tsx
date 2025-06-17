'use client';

import { apiAxios } from '@src/config/axiosConfig';
import { API_BASE_URLS, API_ENDPOINTS } from '@src/constants/api';
import { AlertCircle, ArrowRight, Bot, Search, Sparkles, Target, X, Zap } from 'lucide-react';
import { useState } from 'react';

interface ApiResponse {
  status: string;
  message: string;
  scraping_job_id: string;
  user_id: number;
}

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
}

const ErrorModal = ({ isOpen, onClose, error }: ErrorModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-6 h-6 mr-2" />
            <h3 className="text-lg font-semibold">Oops! Something went wrong</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={onClose}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

const LoadingAnimation = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
      <div className="relative mb-6">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
          <Bot className="w-8 h-8 text-white animate-bounce" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-ping">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-gray-800">AI Agents Deployed! 🚀</h3>
        <div className="space-y-2 text-sm">
          <p className="text-gray-600 animate-pulse">Our AI agents are scouring the web...</p>
          <p className="text-gray-600 animate-pulse delay-500">Finding the perfect jobs for you...</p>
          <p className="text-gray-600 animate-pulse delay-1000">This won&#39;t take long! ⚡</p>
        </div>
      </div>
      
      <div className="mt-6 flex justify-center space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
      </div>
    </div>
  </div>
);

export default function ApplyPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobTitle.trim() || !location.trim()) {
      setError('Both job title and location are required');
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URLS.SCRAPING}${API_ENDPOINTS.SCRAPING.LINKEDIN_JOB}?job_title=${encodeURIComponent(jobTitle)}&location=${encodeURIComponent(location)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiAxios.defaults.headers.common['Authorization']?.toString().replace('Bearer ', '')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      // Simulate some processing time to show the loading animation
      setTimeout(() => {
        setIsLoading(false);
        // You might want to redirect to results page or show success message
        console.log('Job scraping initiated:', data);
      }, 3000);

    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setShowErrorModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect Job
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Let our AI agents do the heavy lifting. Just tell us what you&#39;re looking for, 
            and we&#39;ll find opportunities that match your skills perfectly.
          </p>
        </div>

        {/* Main Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Job Title Input */}
              <div className="space-y-3">
                <label htmlFor="jobTitle" className="block text-lg font-semibold text-gray-800">
                  What role are you looking for?
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="jobTitle"
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Software Developer, Product Manager, Data Scientist"
                    className="w-full pl-12 pr-4 py-4 text-lg text-gray-900 placeholder-gray-500 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Location Input */}
              <div className="space-y-3">
                <label htmlFor="location" className="block text-lg font-semibold text-gray-800">
                  Where would you like to work?
                </label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., San Francisco, Remote, New York"
                    className="w-full pl-12 pr-4 py-4 text-lg text-gray-900 placeholder-gray-500 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold py-4 px-8 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deploying AI Agents...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Deploy AI Job Hunters</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Features */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">AI-Powered</h3>
                <p className="text-sm text-gray-600">Smart agents that understand your skills</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Lightning Fast</h3>
                <p className="text-sm text-gray-600">Results in minutes, not hours</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Perfect Matches</h3>
                <p className="text-sm text-gray-600">Only jobs that fit your profile</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Animation */}
      {isLoading && <LoadingAnimation />}

      {/* Error Modal */}
      <ErrorModal 
        isOpen={showErrorModal} 
        onClose={() => setShowErrorModal(false)} 
        error={error} 
      />
    </div>
  );
}