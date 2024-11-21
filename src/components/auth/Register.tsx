import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Loader2, Mail, AlertCircle } from 'lucide-react';

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Manufacturing',
  'Retail',
  'Other'
];

const INTEREST_AREAS = [
  'Customer Feedback',
  'Employee Surveys',
  'Market Research',
  'Event Registration',
  'Lead Generation',
  'Education/Training',
  'Other'
];

interface SignupData {
  email: string;
  password: string;
  companyName: string;
  fullName: string;
  industry: string;
  interests: string[];
  additionalInfo: string;
}

export const Register = () => {
  const [step, setStep] = useState(1);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    companyName: '',
    fullName: '',
    industry: '',
    interests: [],
    additionalInfo: ''
  });
  const { signUp, loading, error, resendVerificationEmail } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { email, password, ...userData } = formData;
      await signUp(email, password, userData);
      setRegistrationComplete(true);
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail();
    } catch (error) {
      console.error('Error resending verification:', error);
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const validateCurrentStep = () => {
    switch (step) {
      case 1:
        return formData.email && formData.password && formData.password.length >= 6;
      case 2:
        return formData.companyName && formData.fullName;
      case 3:
        return formData.industry && formData.interests.length > 0;
      default:
        return true;
    }
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a verification link to <strong>{formData.email}</strong>
            </p>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Please check your inbox and spam folder. Click the link in the email to verify your account.
              </p>
              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Mail className="h-5 w-5 mr-2" />
                )}
                Resend Verification Email
              </button>
              <Link
                to="/login"
                className="block text-sm text-blue-600 hover:text-blue-700 mt-4"
              >
                Return to Login
              </Link>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-center text-red-700">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Step {step} of 4
          </p>
        </div>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute top-0 left-0 w-full">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Create a password"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Password must be at least 6 characters long
                    </p>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <select
                      required
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select your industry</option>
                      {INDUSTRIES.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Areas of Interest
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {INTEREST_AREAS.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => handleInterestToggle(interest)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            formData.interests.includes(interest)
                              ? 'bg-blue-100 text-blue-700 border-blue-200'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                          } border hover:bg-blue-50 transition-colors`}
                        >
                          {formData.interests.includes(interest) && (
                            <Check className="inline-block w-4 h-4 mr-1" />
                          )}
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Information
                    </label>
                    <textarea
                      value={formData.additionalInfo}
                      onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      placeholder="Tell us more about your form building needs (optional)"
                    />
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-700 mb-2">Summary</h4>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="font-medium text-gray-700">Email:</dt>
                        <dd>{formData.email}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-700">Company:</dt>
                        <dd>{formData.companyName}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-700">Name:</dt>
                        <dd>{formData.fullName}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-700">Industry:</dt>
                        <dd>{formData.industry}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-700">Interests:</dt>
                        <dd>{formData.interests.join(', ')}</dd>
                      </div>
                    </dl>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between pt-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  Back
                </button>
              )}
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!validateCurrentStep()}
                  className="ml-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-5 w-5 ml-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Complete Signup
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};