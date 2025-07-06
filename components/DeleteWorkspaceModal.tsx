import React, { useState, useRef, useEffect } from 'react';
import { useTemplate } from '../context/TemplateContext';
import { ShieldExclamationIcon } from './Icons';
import type { Workspace } from '../types';

interface DeleteWorkspaceModalProps {
    workspace: Workspace;
}

const DeleteWorkspaceModal: React.FC<DeleteWorkspaceModalProps> = ({ workspace }) => {
    const { deleteWorkspace, closeDeleteWorkspaceModal } = useTemplate();
    const [confirmName, setConfirmName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const canDelete = confirmName === workspace.name;

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (canDelete) {
            deleteWorkspace(workspace.id);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] transition-opacity p-4"
            onClick={closeDeleteWorkspaceModal}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-lg border border-red-500/50 transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 mb-4">
                    <ShieldExclamationIcon className="w-7 h-7 text-red-500"/>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Delete Workspace</h2>
                </div>
                <p className="text-gray-500 dark:text-slate-400">
                    This action is permanent and cannot be undone. This will delete the <strong className="text-gray-700 dark:text-slate-300">{workspace.name}</strong> workspace, along with all of its templates and folders.
                </p>
                <p className="mt-4 text-sm text-gray-500 dark:text-slate-400">
                    To confirm, please type <strong className="font-mono text-red-500 bg-red-500/10 px-1 py-0.5 rounded">{workspace.name}</strong> in the box below.
                </p>
                
                <form onSubmit={handleSubmit} className="mt-6">
                    <div className="space-y-4">
                        <div>
                            <input
                                ref={inputRef}
                                id="delete-confirm"
                                type="text"
                                value={confirmName}
                                onChange={(e) => setConfirmName(e.target.value)}
                                className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-slate-700/50">
                        <button
                            type="button"
                            onClick={closeDeleteWorkspaceModal}
                            className="py-2 px-4 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-800 dark:text-slate-200 rounded-lg font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!canDelete}
                            className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:bg-red-600/50 disabled:cursor-not-allowed"
                        >
                            Delete this Workspace
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeleteWorkspaceModal;