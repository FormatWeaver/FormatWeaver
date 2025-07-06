import React, { useState, useRef, useEffect } from 'react';
import { useTemplate } from '../context/TemplateContext';
import { FolderPlusIcon } from './Icons';

const NewFolderModal: React.FC = () => {
    const { createFolder, closeNewFolderModal, currentFolderId } = useTemplate();
    const [name, setName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            createFolder(name.trim(), currentFolderId);
            closeNewFolderModal();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4"
            onClick={closeNewFolderModal}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-slate-700 transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 mb-4">
                    <FolderPlusIcon className="w-7 h-7 text-sky-400"/>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Folder</h2>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="folder-name" className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                                Folder Name
                            </label>
                            <input
                                ref={inputRef}
                                id="folder-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="e.g., Client Emails"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-slate-700/50">
                        <button
                            type="button"
                            onClick={closeNewFolderModal}
                            className="py-2 px-4 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-800 dark:text-slate-200 rounded-lg font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="py-2 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                        >
                            Create Folder
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewFolderModal;