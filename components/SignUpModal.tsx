import React, { useState } from 'react';
import { useTemplate } from '../context/TemplateContext';

interface SignUpModalProps {
  closeModal: () => void;
  openSignIn: () => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ closeModal, openSignIn }) => {
  const { signUp, authError } = useTemplate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signUp(email, password);
    if (success) {
      closeModal();
    }
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
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-slate-200">Create Account</h2>
        <p className="text-center text-gray-500 dark:text-slate-400 mb-6">Save your templates and access them anywhere.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="signup-email" className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Email</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="signup-password" className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Password</label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>

          {authError && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-md">{authError}</p>}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors"
            >
              Sign Up
            </button>
          </div>

           <p className="text-center text-sm text-gray-500 dark:text-slate-400">
            Already have an account?{' '}
            <button type="button" onClick={openSignIn} className="font-semibold text-primary hover:underline">
              Sign In
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUpModal;