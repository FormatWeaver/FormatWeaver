import React from 'react';
import { AddIcon, SparklesIcon, CropIcon } from './Icons';
import { useTemplate } from '../context/TemplateContext';


const TemplateEditor: React.FC = () => {
  const { 
    templateString, 
    resetTemplate, 
    handleTextSelect, 
    openModal,
    selection,
    handleSuggestVariables,
    isSuggesting,
    variables,
    startSnapping,
  } = useTemplate();
  
  const handleSelect = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const text = target.value.substring(target.selectionStart, target.selectionEnd);
    
    handleTextSelect({
      text,
      start: target.selectionStart,
      end: target.selectionEnd,
    });
  };

  return (
    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg p-6 flex flex-col h-full">
      <div className="mb-4">
        <div className="flex justify-between items-center gap-4 flex-wrap">
            <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">1. Pattern Input</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">Paste your text, then select parts to create variables.</p>
            </div>
            <div className="flex gap-2">
              <button
                  onClick={startSnapping}
                  disabled={isSuggesting}
                  className="flex items-center gap-2 py-2 px-3 rounded-lg font-semibold transition-colors bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Capture format from screen"
              >
                  <CropIcon className="w-5 h-5 text-indigo-400"/>
                  Snap Format
              </button>
              <button
                  onClick={handleSuggestVariables}
                  disabled={isSuggesting || !templateString || variables.length > 0}
                  className="flex items-center gap-2 py-2 px-3 rounded-lg font-semibold transition-colors bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Suggest variables from text"
              >
                  <SparklesIcon className="w-5 h-5 text-yellow-400"/>
                  {isSuggesting ? 'Thinking...' : 'Suggest'}
              </button>
            </div>
        </div>
      </div>
      <div className="relative flex-grow">
        <textarea
          value={templateString}
          onChange={(e) => resetTemplate(e.target.value)}
          onSelect={handleSelect}
          onMouseUp={handleSelect} // For better cross-browser support
          className="w-full h-full min-h-[250px] p-4 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md resize-y font-mono text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
          placeholder="Paste your template here..."
        />
        {!!selection && (
          <button
            onClick={openModal}
            className="absolute bottom-4 right-4 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 flex items-center gap-2"
          >
            <AddIcon className="w-5 h-5" />
            Create Variable
          </button>
        )}
      </div>
    </div>
  );
};

export default TemplateEditor;