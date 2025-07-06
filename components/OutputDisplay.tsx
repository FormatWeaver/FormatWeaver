import React, { useState } from 'react';
import { CopyIcon, CheckIcon, DownloadIcon, MagicWandIcon, AcademicCapIcon, ChatBubbleLeftRightIcon, BriefcaseIcon, ArrowsPointingInIcon, ArrowsPointingOutIcon, ArrowUturnLeftIcon, XCircleIcon } from './Icons';
import { useTemplate } from '../context/TemplateContext';


const RefineToolbar: React.FC = () => {
  const { refineOutput, isRefining, outputText, refinedOutput, csvData } = useTemplate();

  const hasText = (refinedOutput?.text ?? outputText).trim().length > 0;
  
  type RefineOption = {
    name: "Formal" | "Casual" | "Professional" | "Shorter" | "Longer";
    icon: React.FC<{className?: string}>;
    prompt: string;
    color: string;
  };

  const options: RefineOption[] = [
    { name: "Formal", icon: AcademicCapIcon, prompt: "more formal and academic", color: "text-blue-400" },
    { name: "Casual", icon: ChatBubbleLeftRightIcon, prompt: "more casual and conversational", color: "text-green-400" },
    { name: "Professional", icon: BriefcaseIcon, prompt: "more professional and business-oriented", color: "text-indigo-400" },
    { name: "Shorter", icon: ArrowsPointingInIcon, prompt: "shorter and more concise", color: "text-yellow-400" },
    { name: "Longer", icon: ArrowsPointingOutIcon, prompt: "longer and more detailed", color: "text-purple-400" },
  ];
  
  return (
    <div className="bg-gray-100 dark:bg-slate-900/50 p-3 rounded-lg border border-gray-200 dark:border-slate-700 mt-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="font-semibold text-gray-700 dark:text-slate-300 text-sm flex items-center gap-2 whitespace-nowrap">
            <MagicWandIcon className="w-5 h-5 text-purple-400" />
            Refine with AI
        </p>
        <div className="flex gap-2 flex-wrap justify-end">
          {options.map(opt => (
            <button 
              key={opt.name} 
              onClick={() => refineOutput(opt.prompt)} 
              disabled={isRefining || !hasText || !!csvData} 
              title={csvData ? "Refinement is disabled in bulk mode. Use 'Refine All' in the Data Entry panel." : `Make text ${opt.name}`}
              className="p-2 bg-white dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <opt.icon className={`w-5 h-5 ${opt.color}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


const OutputDisplay: React.FC = () => {
  const { 
    outputText, 
    refinedOutput,
    revertRefinement,
    isRefining,
    refineError,
    showToast,
  } = useTemplate();

  const displayedText = refinedOutput?.text ?? outputText;

  const handleCopy = () => {
    if (!displayedText) return;
    navigator.clipboard.writeText(displayedText);
    showToast('Copied to clipboard!', 'success');
  };

  return (
    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg p-6 flex flex-col h-full xl:min-h-[calc(100vh-8rem)] xl:sticky xl:top-28">
      <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">3. Weaved Output</h2>
        <div className="flex gap-2">
           {refinedOutput && (
             <button
              onClick={revertRefinement}
              disabled={isRefining}
              className="inline-flex items-center gap-2 py-2 px-4 rounded-lg font-semibold transition-all duration-200 bg-gray-600 dark:bg-slate-600 hover:bg-gray-500 dark:hover:bg-slate-500 text-white"
              aria-label="Revert to original output"
            >
              <ArrowUturnLeftIcon className="w-5 h-5" />
              <span>Revert</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-lg font-semibold transition-all duration-200 bg-primary hover:bg-primary-hover text-white"
            aria-label="Copy output to clipboard"
          >
            <CopyIcon className="w-5 h-5" />
            <span>Copy</span>
          </button>
        </div>
      </div>
      <div className="flex-grow bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md overflow-auto relative flex flex-col">
         <div 
          className="absolute inset-0 dark:hidden"
          style={{
            backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(to right, #e5e7eb 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            opacity: 0.2,
          }}
        ></div>
        <div 
          className="absolute inset-0 hidden dark:block"
          style={{
            backgroundImage: `linear-gradient(#33415533 1px, transparent 1px), linear-gradient(to right, #33415533 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            opacity: 0.5
          }}
        ></div>
        <pre className="relative z-10 p-4 text-gray-800 dark:text-slate-100 whitespace-pre-wrap break-words font-mono text-sm flex-grow">{displayedText}</pre>
        {isRefining && (
          <div className="absolute inset-0 bg-gray-50/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-20">
            <p className="text-lg font-semibold text-gray-700 dark:text-slate-300 animate-pulse">Refining text...</p>
          </div>
        )}
      </div>

      {refineError && (
         <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 flex items-start gap-3 mt-4">
            <XCircleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Refinement Error</p>
              <p>{refineError}</p>
            </div>
          </div>
      )}
      
      <RefineToolbar />
    </div>
  );
};

export default OutputDisplay;