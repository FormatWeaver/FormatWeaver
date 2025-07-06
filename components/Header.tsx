import React from 'react';
import { WeaverIcon, SunIcon, MoonIcon } from './Icons';
import { useTemplate } from '../context/TemplateContext';
import WorkspaceSwitcher from './WorkspaceSwitcher';

interface HeaderProps {
    openAuthModal: (type: 'signIn' | 'signUp') => void;
}

const Header: React.FC<HeaderProps> = ({ openAuthModal }) => {
  const { isAuthenticated, signOut, theme, toggleTheme } = useTemplate();

  return (
    <header className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 p-4 shadow-lg sticky top-0 z-20">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <WeaverIcon className="w-8 h-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500">
                  Format Weaver
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 -mt-1">Create intelligent text templates from examples.</p>
            </div>
        </div>

        <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="w-6 h-6 text-yellow-400" />
              ) : (
                <MoonIcon className="w-6 h-6 text-indigo-500" />
              )}
            </button>
            {isAuthenticated ? (
                <div className="flex items-center gap-2">
                    <WorkspaceSwitcher />
                    <button 
                        onClick={signOut}
                        className="py-2 px-4 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg font-semibold transition-colors text-gray-700 dark:text-slate-300"
                    >
                        Sign Out
                    </button>
                </div>
            ) : (
                <>
                    <button 
                        onClick={() => openAuthModal('signIn')}
                        className="py-2 px-4 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg font-semibold transition-colors text-gray-700 dark:text-slate-300"
                    >
                        Sign In
                    </button>
                    <button 
                        onClick={() => openAuthModal('signUp')}
                        className="py-2 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors"
                    >
                        Sign Up
                    </button>
                </>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;