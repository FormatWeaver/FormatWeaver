import React, { useState } from 'react';
import { useTemplate } from '../context/TemplateContext';
import { BoltIcon } from './Icons';

const AIAutofillModal: React.FC = () => {
    const { 
        closeAutofillModal,
        handleAutofill,
        isAutofilling,
        autofillError
    } = useTemplate();

    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            handleAutofill(prompt);
        }
    }

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4"
            onClick={closeAutofillModal}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-2xl border border-gray-200 dark:border-slate-700 transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Autofill with AI</h2>
                <p className="text-gray-500 dark:text-slate-400 mb-6">
                    Describe the content you want to generate, and the AI will fill out the entire form.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="ai-autofill-prompt" className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                                Your High-Level Request
                            </label>
                            <textarea
                                id="ai-autofill-prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={4}
                                className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                                placeholder="e.g., A project update for a successful Q4 social media push that grew our follower count by 5%."
                            />
                        </div>
                        {autofillError && <p className="text-red-500 text-sm">{autofillError}</p>}
                    </div>
                    <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-slate-700/50">
                        <button
                            type="button"
                            onClick={closeAutofillModal}
                            className="py-2 px-4 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-800 dark:text-slate-200 rounded-lg font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isAutofilling || !prompt.trim()}
                            className="py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-semibold transition-colors disabled:bg-yellow-500/50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <BoltIcon className="w-5 h-5"/>
                            {isAutofilling ? 'Generating...' : 'Autofill Form'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AIAutofillModal;