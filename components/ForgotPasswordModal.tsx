import React, { useState } from 'react';
import { useTemplate } from '../context/TemplateContext';
import { MailIcon, ArrowLeftIcon } from './Icons';

interface ForgotPasswordModalProps {
  closeModal: () => void;
  openSignIn: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ closeModal, openSignIn }) => {
  const { forgotPassword, authError } = useTemplate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    const success = await forgotPassword(email);
    if (success) {
      setIsSubmitted(true);
    }
    setIsLoading(false);
  };

  return (
    <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4"
        onClick={closeModal}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-slate-700 transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        {isSubmitted ? (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-500/20 mb-4">
              <MailIcon className="h-6 w-6 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-slate-200">Check your email</h2>
            <p className="text-gray-500 dark:text-slate-400 mb-6">
              If an account with <strong className="text-gray-700 dark:text-slate-300">{email}</strong> exists, we've sent instructions to reset your password.
            </p>
            <button
              onClick={closeModal}
              className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-slate-200">Forgot Password?</h2>
            <p className="text-center text-gray-500 dark:text-slate-400 mb-6">No worries, we'll send you reset instructions.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Email</label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {authError && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-md">{authError}</p>}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                </button>
              </div>

              <div className="text-center">
                  <button type="button" onClick={openSignIn} className="font-semibold text-primary/80 hover:text-primary hover:underline flex items-center gap-2 mx-auto">
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back to Sign In
                  </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;