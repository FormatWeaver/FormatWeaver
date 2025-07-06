import React, { useState } from 'react';
import { useTemplate } from '../context/TemplateContext';
import type { AISuggestion } from '../types';

const SuggestionModal: React.FC = () => {
  const { aiSuggestions, suggestionError, closeSuggestionModal, createVariablesFromSuggestions } = useTemplate();
  const [selectedSuggestions, setSelectedSuggestions] = useState<AISuggestion[]>(aiSuggestions);

  const handleToggleSuggestion = (suggestion: AISuggestion) => {
    setSelectedSuggestions(prev => 
      prev.some(s => s.name === suggestion.name)
        ? prev.filter(s => s.name !== suggestion.name)
        : [...prev, suggestion]
    );
  };

  const handleSubmit = () => {
    createVariablesFromSuggestions(selectedSuggestions);
  };

  return (
    <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4"
        onClick={closeSuggestionModal}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-2xl border border-gray-200 dark:border-slate-700 transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">AI Suggestions</h2>
        <p className="text-gray-500 dark:text-slate-400 mb-6">The AI has analyzed your template. Select the variables you'd like to create.</p>
        
        {suggestionError ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">
            <p className="font-bold">An error occurred:</p>
            <p>{suggestionError}</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {aiSuggestions.map((suggestion, index) => (
              <label 
                key={index} 
                className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedSuggestions.some(s => s.name === suggestion.name) 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedSuggestions.some(s => s.name === suggestion.name)}
                  onChange={() => handleToggleSuggestion(suggestion)}
                  className="mt-1 h-5 w-5 rounded border-gray-400 dark:border-slate-600 text-primary focus:ring-primary bg-white dark:bg-slate-800"
                />
                <div className="flex-grow">
                  <p className="font-mono font-bold text-primary">{`{{${suggestion.name}}}`}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Type: <span className="font-semibold text-gray-600 dark:text-slate-300">{suggestion.type}</span></p>
                  <p className="mt-2 text-sm text-gray-700 dark:text-slate-300 font-mono bg-gray-100 dark:bg-slate-800/50 p-2 rounded-md border border-gray-200 dark:border-slate-700/50">
                    {suggestion.originalText}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-slate-700/50">
          <button
            type="button"
            onClick={closeSuggestionModal}
            className="py-2 px-4 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-800 dark:text-slate-200 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedSuggestions.length === 0 || !!suggestionError}
            className="py-2 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed"
          >
            {`Create ${selectedSuggestions.length} Variable(s)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestionModal;