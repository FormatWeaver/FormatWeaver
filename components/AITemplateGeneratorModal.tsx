import React, { useState } from 'react';
import { useTemplate } from '../context/TemplateContext';
import { DocumentSparklesIcon } from './Icons';

const AITemplateGeneratorModal: React.FC = () => {
    const { 
        closeAITemplateGeneratorModal,
        handleGenerateTemplateFromPrompt,
        isGeneratingTemplate,
        templateGenerationError
    } = useTemplate();

    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            handleGenerateTemplateFromPrompt(prompt);
        }
    }

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4"
            onClick={closeAITemplateGeneratorModal}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-2xl border border-gray-200 dark:border-slate-700 transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Generate Template with AI</h2>
                <p className="text-gray-500 dark:text-slate-400 mb-6">
                    Describe the template you need, and the AI will create it for you from scratch.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="ai-template-prompt" className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                                Your Request
                            </label>
                            <textarea
                                id="ai-template-prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={5}
                                className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                                placeholder="e.g., A client follow-up email after a meeting, a simple non-disclosure agreement, or a weekly project status report..."
                            />
                        </div>
                        {templateGenerationError && <p className="text-red-500 text-sm bg-red-500/10 p-3 rounded-md">{templateGenerationError}</p>}
                    </div>
                    <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-slate-700/50">
                        <button
                            type="button"
                            onClick={closeAITemplateGeneratorModal}
                            disabled={isGeneratingTemplate}
                            className="py-2 px-4 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-800 dark:text-slate-200 rounded-lg font-semibold transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isGeneratingTemplate || !prompt.trim()}
                            className="py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <DocumentSparklesIcon className="w-5 h-5"/>
                            {isGeneratingTemplate ? 'Generating...' : 'Generate Template'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AITemplateGeneratorModal;