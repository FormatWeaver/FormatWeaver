import React from 'react';
import { WeaverIcon, CodeBracketsIcon, SparklesIcon, TableCellsIcon, UserGroupIcon, SunIcon, MoonIcon } from './Icons';
import PricingTiers from './PricingTiers';
import { useTemplate } from '../context/TemplateContext';

interface LandingPageProps {
  openAuthModal: (type: 'signIn' | 'signUp') => void;
}

const LandingPageHeader: React.FC<LandingPageProps> = ({ openAuthModal }) => {
  const { theme, toggleTheme } = useTemplate();
  return (
    <header className="absolute top-0 left-0 right-0 z-10 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WeaverIcon className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Format Weaver</h1>
        </div>
        <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100/50 dark:hover:bg-slate-700/50 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="w-6 h-6 text-yellow-400" />
              ) : (
                <MoonIcon className="w-6 h-6 text-indigo-500" />
              )}
            </button>
            <button onClick={() => openAuthModal('signIn')} className="py-2 px-4 rounded-lg font-semibold transition-colors text-gray-700 dark:text-slate-300 hover:bg-gray-200/50 dark:hover:bg-slate-800/50">
                Sign In
            </button>
            <button onClick={() => openAuthModal('signUp')} className="py-2 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-primary/40">
                Sign Up for Free
            </button>
        </div>
      </div>
    </header>
  );
};


const LandingPage: React.FC<LandingPageProps> = ({ openAuthModal }) => {
  const features = [
    {
      icon: CodeBracketsIcon,
      title: "From Example to Template Instantly",
      description: "Paste any text, select the parts that change, and instantly create a reusable, intelligent template. No more manual copy-pasting.",
    },
    {
      icon: SparklesIcon,
      title: "AI-Powered Suggestions",
      description: "Let AI analyze your text and automatically suggest variables. Create complex templates in seconds with a single click.",
    },
    {
      icon: TableCellsIcon,
      title: "Bulk Processing with CSVs",
      description: "Import a CSV file, map your columns to your variables, and generate hundreds of unique outputs instantly. Edit and export your results with ease.",
    },
    {
      icon: UserGroupIcon,
      title: "Collaborate with Your Team",
      description: "Create shared workspaces to manage templates with your colleagues. Control access with Owner and Editor roles for secure collaboration.",
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900">
      <LandingPageHeader openAuthModal={openAuthModal} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-white dark:bg-slate-900" style={{
            backgroundImage: 'radial-gradient(circle at top left, rgba(14, 165, 233, 0.15), transparent 30%), radial-gradient(circle at bottom right, rgba(79, 70, 229, 0.15), transparent 30%)'
        }}></div>
        <div className="container mx-auto relative px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
            Stop Tedious Editing. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600">Automate Your Text.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-slate-300">
            Format Weaver turns any text into a smart, reusable template. Define variables once, then generate perfectly formatted outputs forever.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button onClick={() => openAuthModal('signUp')} className="py-3 px-6 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-primary/40 text-lg">
                Get Started for Free
            </button>
            <button onClick={() => openAuthModal('signIn')} className="py-3 px-6 rounded-lg font-semibold transition-colors text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800">
                Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">The Ultimate Text Automation Tool</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-slate-400">Everything you need to stop wasting time and start generating content.</p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-slate-700">
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="mt-2 text-gray-600 dark:text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Simple, Transparent Pricing</h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-slate-400">Choose the plan that's right for you.</p>
            </div>
            <div className="mt-16 max-w-4xl mx-auto">
                 <PricingTiers currentPlan={null} onSelectPlan={() => openAuthModal('signUp')} />
            </div>
        </div>
      </section>

       {/* CTA Section */}
      <section className="py-20 bg-gray-50 dark:bg-slate-800/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Ready to Get Started?</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-slate-400">Create your free account today and revolutionize your workflow.</p>
           <div className="mt-8">
            <button onClick={() => openAuthModal('signUp')} className="py-3 px-8 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-primary/40 text-lg">
                Sign Up Now
            </button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900">
         <div className="container mx-auto py-8 px-4 text-center text-gray-500 dark:text-slate-400">
            <p>&copy; {new Date().getFullYear()} Format Weaver. All rights reserved.</p>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;