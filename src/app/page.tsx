// app/page.tsx
"use client";

import { LoginForm } from "@src/components/forms/LoginForm";
import { SignupForm } from "@src/components/forms/SignupForm";
import { Brain, FileText, Search, Settings, Target, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-[var(--border)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-[var(--lavender-500)] to-[var(--lavender-600)] p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[var(--lavender-500)] to-[var(--lavender-600)] bg-clip-text text-transparent">
                Resmacha
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#features" className="text-[var(--text-secondary)] hover:text-[var(--lavender-600)] transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-[var(--text-secondary)] hover:text-[var(--lavender-600)] transition-colors">
                How it Works
              </Link>
              <Link href="#about" className="text-[var(--text-secondary)] hover:text-[var(--lavender-600)] transition-colors">
                About
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Hero Content */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-6xl font-bold text-[var(--text-primary)] leading-tight">
                    Stop Wasting Time on{" "}
                    <span className="bg-gradient-to-r from-[var(--lavender-500)] to-[var(--lavender-600)] bg-clip-text text-transparent">
                      Wrong Jobs
                    </span>
                  </h1>
                  <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
                    Upload your resume, set your preferences, and let our AI agents find jobs where you're actually a great fit. 
                    No more endless scrolling through irrelevant listings.
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-[var(--border)]">
                    <Search className="h-8 w-8 text-[var(--lavender-600)]" />
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">AI Web Crawling</h3>
                      <p className="text-sm text-[var(--text-secondary)]">Agents scour hundreds of jobs</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-[var(--border)]">
                    <Brain className="h-8 w-8 text-[var(--lavender-600)]" />
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">Human-like Reasoning</h3>
                      <p className="text-sm text-[var(--text-secondary)]">No cosine similarity, real analysis</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-[var(--border)]">
                    <Target className="h-8 w-8 text-[var(--lavender-600)]" />
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">Smart Scoring</h3>
                      <p className="text-sm text-[var(--text-secondary)]">Get notified at your score threshold</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-[var(--border)]">
                    <Zap className="h-8 w-8 text-[var(--lavender-600)]" />
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">Save Time</h3>
                      <p className="text-sm text-[var(--text-secondary)]">Focus on jobs you can actually get</p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setActiveTab('signup')}
                    className="px-8 py-4 bg-[var(--plum)] hover:bg-[var(--plum-dark)] text-[var(--text-primary)] font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Start Finding Better Jobs
                  </button>
                  <button
                    onClick={() => setActiveTab('login')}
                    className="px-8 py-4 bg-white dark:bg-gray-800 text-[var(--text-primary)] font-semibold rounded-lg border-2 border-[var(--border)] hover:border-[var(--lavender-600)] hover:text-[var(--lavender-600)] transition-all duration-200"
                  >
                    Sign In
                  </button>
                </div>
              </div>

              {/* Right Column - Auth Forms */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-[var(--border)]">
                {/* Tab Headers */}
                <div className="flex bg-[var(--lavender-100)] dark:bg-gray-700 rounded-lg p-1 mb-8">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all duration-200 ${
                      activeTab === 'login'
                        ? 'bg-white dark:bg-gray-600 text-[var(--lavender-600)] shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setActiveTab('signup')}
                    className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all duration-200 ${
                      activeTab === 'signup'
                        ? 'bg-white dark:bg-gray-600 text-[var(--lavender-600)] shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Form Content */}
                <div className="space-y-6">
                  {activeTab === 'login' ? (
                    <>
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Welcome Back</h2>
                        <p className="text-[var(--text-secondary)] mt-2">Continue your smart job search</p>
                      </div>
                      <LoginForm />
                      <div className="text-center text-sm text-[var(--text-secondary)]">
                        Don't have an account?{" "}
                        <button
                          onClick={() => setActiveTab('signup')}
                          className="text-[var(--lavender-600)] hover:text-[var(--lavender-700)] font-semibold"
                        >
                          Sign up here
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Join Resmacha</h2>
                        <p className="text-[var(--text-secondary)] mt-2">Start your AI-powered job search</p>
                      </div>
                      <SignupForm />
                      <div className="text-center text-sm text-[var(--text-secondary)]">
                        Already have an account?{" "}
                        <button
                          onClick={() => setActiveTab('login')}
                          className="text-[var(--lavender-600)] hover:text-[var(--lavender-700)] font-semibold"
                        >
                          Sign in here
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-[var(--lavender-50)] dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
                How Resmacha Works
              </h2>
              <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
                Three simple steps to revolutionize your job search with AI agents that work like human recruiters
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-xl bg-white dark:bg-gray-800 border border-[var(--border)]">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--lavender-600)] rounded-full mb-6">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 bg-[var(--plum)] rounded-full mb-4 text-white font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Upload Your Resume</h3>
                <p className="text-[var(--text-secondary)]">
                  Simply upload your resume and set your desired job title and location. Our AI analyzes your skills, experience, and career background.
                </p>
              </div>
              
              <div className="text-center p-8 rounded-xl bg-white dark:bg-gray-800 border border-[var(--border)]">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--lavender-600)] rounded-full mb-6">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 bg-[var(--plum)] rounded-full mb-4 text-white font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">AI Agents Deploy</h3>
                <p className="text-[var(--text-secondary)]">
                  Our AI agents crawl the web, finding hundreds of relevant job postings and analyzing each one against your profile using human-like reasoning.
                </p>
              </div>
              
              <div className="text-center p-8 rounded-xl bg-white dark:bg-gray-800 border border-[var(--border)]">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--lavender-600)] rounded-full mb-6">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 bg-[var(--plum)] rounded-full mb-4 text-white font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Get Smart Matches</h3>
                <p className="text-[var(--text-secondary)]">
                  Receive scored job matches based on real fit analysis. Set your notification threshold and only get alerted for jobs where you're truly competitive.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
                Why Resmacha is Different
              </h2>
              <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
                We don't use traditional ML techniques like cosine similarity or basic RAG. Our AI agents reason like human recruiters, 
                scrutinizing job descriptions against your unique profile.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-xl bg-gradient-to-br from-[var(--lavender-50)] to-[var(--lavender-100)] dark:from-gray-800 dark:to-gray-700 border border-[var(--lavender-200)] dark:border-gray-600">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--lavender-600)] rounded-full mb-6">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Human-Like AI Reasoning</h3>
                <p className="text-[var(--text-secondary)]">
                  Our AI doesn't just match keywords. It understands context, analyzes requirements, and evaluates your actual fit for each role.
                </p>
              </div>
              
              <div className="text-center p-8 rounded-xl bg-white dark:bg-gray-800 border border-[var(--border)]">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--plum)] rounded-full mb-6">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Customizable Scoring</h3>
                <p className="text-[var(--text-secondary)]">
                  Set your own score threshold for notifications. Only get alerted when jobs meet your standards for fit and opportunity.
                </p>
              </div>
              
              <div className="text-center p-8 rounded-xl bg-white dark:bg-gray-800 border border-[var(--border)]">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--lavender-600)] rounded-full mb-6">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Massive Scale</h3>
                <p className="text-[var(--text-secondary)]">
                  Our agents analyze hundreds and hundreds of jobs continuously, so you never miss opportunities that are perfect for your profile.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-[var(--lavender-500)] to-[var(--lavender-600)] p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Resmacha</span>
            </div>
            <p className="text-gray-300 mb-6">
              AI-powered job matching that actually works
            </p>
            <div className="text-sm text-gray-400">
              © 2025 Resmacha. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}