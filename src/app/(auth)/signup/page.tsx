'use client';
// app/signup/page.tsx
import { SignupForm } from "@src/components/forms/SignupForm";
import { ArrowLeft, Bot, Brain, CheckCircle, Clock, Target, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background dark:bg-background">
      <div className="max-w-4xl w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Benefits */}
          <div className="hidden lg:block space-y-8">
            <div className="text-center lg:text-left">
              <Link href="/" className="inline-flex items-center space-x-2 text-lavender-600 hover:text-lavender-700 mb-8 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-text-primary dark:text-text-light">Back to Home</span>
              </Link>
              
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <div className="bg-gradient-to-r from-lavender-500 to-lavender-600 p-3 rounded-xl shadow-lg">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-lavender-600 to-lavender-700 bg-clip-text text-transparent">
                  Resmacha
                </span>
              </div>
              
              <h1 className="text-4xl font-bold text-text-primary dark:text-text-light mb-4">
                Stop Wasting Time on Wrong Jobs
              </h1>
              <p className="text-xl text-text-secondary dark:text-text-secondary mb-8">
                Let AI agents find the perfect job matches for you. Upload your resume, set your preferences, and get only the jobs where you&apos;re a great fit.
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-lavender-100 dark:bg-lavender-900/30 p-2 rounded-lg">
                  <Brain className="h-6 w-6 text-lavender-600 flex-shrink-0" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary dark:text-text-light">AI-Powered Job Reasoning</h3>
                  <p className="text-text-secondary dark:text-text-secondary">Our AI doesn&apos;t just match keywords - it reasons like a human recruiter, analyzing job requirements against your actual skills and experience</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-lavender-100 dark:bg-lavender-900/30 p-2 rounded-lg">
                  <Target className="h-6 w-6 text-lavender-600 flex-shrink-0" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary dark:text-text-light">Smart Scoring System</h3>
                  <p className="text-text-secondary dark:text-text-secondary">Each job gets a fit score based on deep analysis of requirements vs. your profile. Set your threshold and only get notified about real opportunities</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-lavender-100 dark:bg-lavender-900/30 p-2 rounded-lg">
                  <Clock className="h-6 w-6 text-lavender-600 flex-shrink-0" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary dark:text-text-light">Automated Job Discovery</h3>
                  <p className="text-text-secondary dark:text-text-secondary">AI agents continuously crawl the web for new opportunities, so you never miss a perfect match while you focus on applications that matter</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-lavender-100 dark:bg-lavender-900/30 p-2 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-lavender-600 flex-shrink-0" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary dark:text-text-light">Quality Over Quantity</h3>
                  <p className="text-text-secondary dark:text-text-secondary">Instead of hundreds of irrelevant jobs, get a curated list of positions where you have a real chance of success</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-lavender-100 dark:bg-lavender-900/30 p-2 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-lavender-600 flex-shrink-0" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary dark:text-text-light">Location & Preference Filtering</h3>
                  <p className="text-text-secondary dark:text-text-secondary">Set your desired job title, location, and other preferences. Our AI respects your criteria while finding the best matches</p>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-gradient-to-r from-lavender-50 to-lavender-100 dark:from-lavender-900/20 dark:to-lavender-800/20 p-6 rounded-xl border border-lavender-200 dark:border-lavender-700/50">
              <p className="text-text-primary dark:text-text-light italic mb-4">
                &quot;Finally, a job search tool that actually understands what I&apos;m looking for. Instead of applying to 100 jobs and hearing nothing, I applied to 8 high-fit positions and got 3 interviews!&quot;
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-lavender-500 to-lavender-600 rounded-full flex items-center justify-center text-white font-semibold">
                  M
                </div>
                <div>
                  <p className="font-semibold text-text-primary dark:text-text-light">Maria Rodriguez</p>
                  <p className="text-sm text-text-secondary dark:text-text-secondary">Data Scientist at CloudTech</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Signup Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="lg:hidden text-center mb-8">
              <Link href="/" className="inline-flex items-center space-x-2 text-lavender-600 hover:text-lavender-700 mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-text-primary dark:text-text-light">Back to Home</span>
              </Link>
              
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-lavender-500 to-lavender-600 p-3 rounded-xl shadow-lg">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-lavender-600 to-lavender-700 bg-clip-text text-transparent">
                  Resmacha
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl p-8 border border-border dark:border-gray-700 backdrop-blur-sm">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-text-primary dark:text-text-light mb-2">
                  Join Resmacha
                </h2>
                <p className="text-text-secondary dark:text-text-secondary">
                  Let AI find your perfect job matches
                </p>
              </div>

              <SignupForm />
              
              <div className="mt-6 text-center">
                <p className="text-sm text-text-secondary dark:text-text-secondary">
                  Already have an account?{" "}
                  <Link 
                    href="/login" 
                    className="text-lavender-600 hover:text-lavender-700 dark:text-lavender-400 dark:hover:text-lavender-300 font-semibold transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>

            {/* Terms */}
            <div className="mt-6 text-center text-xs text-text-tertiary dark:text-text-secondary">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-lavender-600 hover:text-lavender-700 dark:text-lavender-400 dark:hover:text-lavender-300 transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-lavender-600 hover:text-lavender-700 dark:text-lavender-400 dark:hover:text-lavender-300 transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}