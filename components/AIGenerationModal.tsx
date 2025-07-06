import React, { useState, useEffect, useMemo } from 'react';
import { useTemplate } from '../context/TemplateContext';
import { MagicWandIcon } from './Icons';

const AIGenerationModal: React.FC = () => {
    const { 
        aiGenerationTarget,
        closeAIGenerationModal,
        handleGenerateAIContent,
        isGeneratingContent,
        generationError
    } = useTemplate();

    const [prompt, setPrompt] = useState('');

    const defaultPrompt = useMemo(() => {
        if (!aiGenerationTarget) return '';
        const { name, type } = aiGenerationTarget;
        const formattedName = name.replace(/_/g, ' ');

        if (type === 'list') {
            return `Generate a short list of items for "${formattedName}". For example, generate a list of key accomplishments for a project update. Return a simple list separated by newlines.`;
        }
        return `Write a concise, single-line piece of text for "${formattedName}". For example, write a bug summary.`;
    }, [aiGenerationTarget]);

    useEffect(() => {
        setPrompt(defaultPrompt);
    }, [defaultPrompt]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            handleGenerateAIContent(prompt);
        }
    }

    if (!aiGenerationTarget) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4"
            onClick={closeAIGenerationModal}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-2xl border border-gray-200 dark:border-slate-700 transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">AI Content Generation</h2>
                <p className="text-gray-500 dark:text-slate-400 mb-6">
                    Generating content for the <span className="font-mono text-primary bg-primary/10 dark:bg-slate-900/50 px-1 py-0.5 rounded">{`{{${aiGenerationTarget.name}}}`}</span> variable.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="ai-prompt" className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                                Your Prompt
                            </label>
                            <textarea
                                id="ai-prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={5}
                                className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                                placeholder="e.g., Generate 3-5 key accomplishments for a marketing campaign..."
                            />
                        </div>
                        {generationError && <p className="text-red-500 text-sm">{generationError}</p>}
                    </div>
                    <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-slate-700/50">
                        <button
                            type="button"
                            onClick={closeAIGenerationModal}
                            className="py-2 px-4 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-800 dark:text-slate-200 rounded-lg font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isGeneratingContent || !prompt.trim()}
                            className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:bg-purple-600/50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <MagicWandIcon className="w-5 h-5"/>
                            {isGeneratingContent ? 'Generating...' : 'Generate Content'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AIGenerationModal;