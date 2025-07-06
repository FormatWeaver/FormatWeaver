import React, { useState, useMemo, useEffect } from 'react';
import { useTemplate } from '../context/TemplateContext';
import { SaveIcon, FolderIcon, FolderPlusIcon, TrashIcon, DocumentSparklesIcon, PencilIcon, MagnifyingGlassIcon } from './Icons';
import type { SavedTemplate, Folder } from '../types';
import FolderCrumb from './FolderCrumb';


interface SavedTemplatesManagerProps {
    openAuthModal: (type: 'signIn' | 'signUp') => void;
}

const SavedTemplatesManager: React.FC<SavedTemplatesManagerProps> = ({ openAuthModal }) => {
    const { 
        saveTemplate,
        variables, 
        isAuthenticated,
        openAITemplateGeneratorModal,
        openNewFolderModal,
        currentFolderId,
        activeWorkspaceId
    } = useTemplate();
    const [templateName, setTemplateName] = useState('');

    const handleSave = () => {
        if (!isAuthenticated) {
            openAuthModal('signIn');
            return;
        }
        if (!activeWorkspaceId) {
            // Should not happen if user is authenticated
            alert("Error: No active workspace. Please try logging out and in again.");
            return;
        }
        const name = templateName.trim() || `My Template ${new Date().toLocaleTimeString()}`;
        saveTemplate(name, currentFolderId);
        setTemplateName('');
    }

    return (
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg p-6">
            <button
                onClick={openAITemplateGeneratorModal}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 mb-6 rounded-lg font-bold transition-transform hover:scale-[1.02] bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-indigo-500/40"
            >
                <DocumentSparklesIcon className="w-6 h-6" />
                Generate Template with AI
            </button>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-grow w-full">
                    <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder={isAuthenticated ? "Enter template name to save..." : "Sign up to save templates"}
                        className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:opacity-50"
                        disabled={variables.length === 0 || !isAuthenticated}
                    />
                </div>
                <button
                    onClick={handleSave}
                    disabled={variables.length === 0 || !isAuthenticated}
                    className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold transition-colors bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-indigo-400/50 disabled:cursor-not-allowed"
                >
                    <SaveIcon className="w-5 h-5" />
                    Save Current Template
                </button>
            </div>
            {isAuthenticated && (
                <div className="mt-6 border-t border-gray-200 dark:border-slate-700 pt-4">
                   <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-300">Template Library</h3>
                        <button 
                            onClick={openNewFolderModal}
                            className="flex items-center gap-2 py-1 px-3 rounded-lg font-semibold transition-colors bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-600">
                           <FolderPlusIcon className="w-5 h-5" /> New Folder
                        </button>
                   </div>
                   <FolderView />
                </div>
            )}
        </div>
    );
};

const FolderView: React.FC = () => {
    const { 
        savedTemplates, 
        folders, 
        currentFolderId, 
        setCurrentFolderId, 
        loadTemplate, 
        deleteTemplate, 
        deleteFolder, 
        openMoveItemModal, 
        renameItem,
        activeWorkspaceId 
    } = useTemplate();
    const [renaming, setRenaming] = useState<{ id: string, type: 'folder' | 'template', name: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const itemsInCurrentFolder = useMemo(() => {
        if (!activeWorkspaceId) return { childFolders: [], childTemplates: [] };

        const childFolders = folders.filter(f => f.workspace_id === activeWorkspaceId && f.parent_id === currentFolderId);
        const childTemplates = savedTemplates.filter(t => t.workspace_id === activeWorkspaceId && t.folder_id === currentFolderId);

        if (!searchTerm) {
            return { childFolders, childTemplates };
        }

        const lowerCaseSearch = searchTerm.toLowerCase();

        return {
            childFolders: childFolders.filter(f => f.name.toLowerCase().includes(lowerCaseSearch)),
            childTemplates: childTemplates.filter(t => t.name.toLowerCase().includes(lowerCaseSearch)),
        };

    }, [currentFolderId, folders, savedTemplates, activeWorkspaceId, searchTerm]);

    const handleRename = () => {
        if (!renaming) return;
        renameItem(renaming.id, renaming.type, renaming.name);
        setRenaming(null);
    }
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && renaming) {
                handleRename();
            } else if (e.key === 'Escape' && renaming) {
                setRenaming(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [renaming]);


    return (
        <div className="bg-gray-50 dark:bg-slate-900/40 p-4 rounded-lg border border-gray-200 dark:border-slate-700/60 min-h-[200px] flex flex-col">
            <div className="flex gap-2 mb-4">
                <FolderCrumb />
                <div className="relative flex-grow">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 dark:text-slate-500 absolute top-1/2 left-3 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search..."
                        className="w-full p-2 pl-10 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    />
                </div>
            </div>
            <div className="space-y-2 flex-grow overflow-y-auto max-h-60 pr-2">
                {itemsInCurrentFolder.childFolders.length === 0 && itemsInCurrentFolder.childTemplates.length === 0 && (
                    <div className="text-center py-8 text-gray-400 dark:text-slate-500">
                        {searchTerm ? 'No matches found.' : 'This folder is empty.'}
                    </div>
                )}

                {itemsInCurrentFolder.childFolders.sort((a,b) => a.name.localeCompare(b.name)).map(folder => (
                    <div key={folder.id} className="flex items-center justify-between p-2 pl-3 bg-white dark:bg-slate-800 rounded-lg group hover:bg-gray-100 dark:hover:bg-slate-700/60" onDoubleClick={() => setCurrentFolderId(folder.id)}>
                        <div className="flex items-center gap-3 flex-grow cursor-pointer" onClick={() => setCurrentFolderId(folder.id)}>
                            <FolderIcon className="w-6 h-6 text-sky-500 flex-shrink-0" />
                            {renaming?.id === folder.id ? (
                                <input 
                                    type="text"
                                    value={renaming.name}
                                    onChange={(e) => setRenaming({...renaming, name: e.target.value})}
                                    onBlur={handleRename}
                                    autoFocus
                                    className="bg-gray-50 dark:bg-slate-900 border border-primary p-1 rounded-md text-sm w-full"
                                />
                            ) : (
                                <span className="font-semibold text-gray-800 dark:text-slate-200">{folder.name}</span>
                            )}
                        </div>
                        <ItemActions 
                            item={folder} 
                            type="folder" 
                            onRename={() => setRenaming({ id: folder.id, type: 'folder', name: folder.name })} 
                            onDelete={() => deleteFolder(folder.id)} 
                            onMove={() => openMoveItemModal(folder.id, 'folder')}
                        />
                    </div>
                ))}

                 {itemsInCurrentFolder.childTemplates.sort((a,b) => a.name.localeCompare(b.name)).map(template => (
                    <div key={template.id} className="flex items-center justify-between p-2 pl-3 bg-white dark:bg-slate-800 rounded-lg group hover:bg-gray-100 dark:hover:bg-slate-700/60">
                        <div className="flex items-center gap-3 flex-grow cursor-pointer" onClick={() => loadTemplate(template)}>
                            <DocumentSparklesIcon className="w-6 h-6 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                            {renaming?.id === template.id ? (
                                <input 
                                    type="text"
                                    value={renaming.name}
                                    onChange={(e) => setRenaming({...renaming, name: e.target.value})}
                                    onBlur={handleRename}
                                    autoFocus
                                    className="bg-gray-50 dark:bg-slate-900 border border-primary p-1 rounded-md text-sm w-full"
                                />
                            ) : (
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-slate-200">{template.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">Created on {new Date(template.created_at).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>
                         <ItemActions 
                            item={template} 
                            type="template"
                            onRename={() => setRenaming({ id: template.id, type: 'template', name: template.name })} 
                            onDelete={() => deleteTemplate(template.id)} 
                            onMove={() => openMoveItemModal(template.id, 'template')}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

interface ItemActionsProps {
    item: Folder | SavedTemplate;
    type: 'folder' | 'template';
    onRename: () => void;
    onDelete: () => void;
    onMove: () => void;
}

const ItemActions: React.FC<ItemActionsProps> = ({ item, type, onRename, onDelete, onMove }) => {
    return (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
             <button
                onClick={onRename}
                className="p-2 text-gray-400 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 rounded-full transition-colors hover:bg-sky-500/10"
                title={`Rename ${type}`}
            >
                <PencilIcon className="w-4 h-4" />
            </button>
            <button
                onClick={onMove}
                className="p-2 text-gray-400 dark:text-slate-400 hover:text-green-500 dark:hover:text-green-400 rounded-full transition-colors hover:bg-green-500/10"
                title={`Move ${type}`}
            >
                <FolderPlusIcon className="w-4 h-4" />
            </button>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Are you sure you want to delete "${item.name}"? ${type === 'folder' ? 'All contents inside will also be deleted.' : ''}`)) {
                        onDelete();
                    }
                }}
                className="p-2 text-gray-400 dark:text-slate-400 hover:text-red-500 rounded-full transition-colors hover:bg-red-500/10"
                title={`Delete ${type}`}
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
    );
};


export default SavedTemplatesManager;