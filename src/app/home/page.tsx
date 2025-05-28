// src/app/home/page.tsx
'use client';

import Link from 'next/link';
import { Search, BarChart3, Zap, Target, TrendingUp, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-8">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Find Your Dream Job with AI
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Let our intelligent matching system analyze thousands of opportunities 
            and find the perfect jobs that match your skills and preferences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/home/apply"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold py-4 px-8 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-3"
            >
              <Search className="w-5 h-5" />
              <span>Start Job Search</span>
              <Zap className="w-5 h-5" />
            </Link>
            <Link
              href="/home/results"
              className="bg-white border-2 border-gray-300 text-gray-700 text-lg font-semibold py-4 px-8 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-3"
            >
              <BarChart3 className="w-5 h-5" />
              <span>View Results</span>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Job Discovery</h3>
            <p className="text-gray-600">
              Our AI scans thousands of job listings across multiple platforms to find 
              opportunities that match your profile and preferences.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Compatibility Scoring</h3>
            <p className="text-gray-600">
              Get detailed compatibility scores for each job, helping you prioritize 
              applications and focus on the best opportunities.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Personalized Insights</h3>
            <p className="text-gray-600">
              Receive tailored recommendations and improvement tips to enhance your 
              profile and increase your chances of success.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/home/apply"
              className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Find New Jobs</h3>
                <p className="text-sm text-gray-600">Search and apply to new opportunities</p>
              </div>
            </Link>

            <Link
              href="/home/results"
              className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all group"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-200">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">View Match Results</h3>
                <p className="text-sm text-gray-600">Check your AI-powered job matches</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}