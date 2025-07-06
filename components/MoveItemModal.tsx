import React, { useState, useMemo } from 'react';
import { useTemplate } from '../context/TemplateContext';
import { Folder, SavedTemplate } from '../types';
import { FolderIcon } from './Icons';

interface MoveItemModalProps {
    item: { id: string; type: 'folder' | 'template' };
}

const MoveItemModal: React.FC<MoveItemModalProps> = ({ item }) => {
    const { folders, moveItem, closeMoveItemModal } = useTemplate();
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

    const getDescendantFolderIds = (folderId: string): Set<string> => {
        const descendants = new Set<string>();
        const queue = [folderId];
        while (queue.length > 0) {
            const currentId = queue.shift()!;
            descendants.add(currentId);
            folders.forEach(f => {
                if (f.parent_id === currentId) {
                    queue.push(f.id);
                }
            });
        }
        return descendants;
    };

    const availableFolders = useMemo(() => {
        let invalidIds: Set<string> = new Set();
        if (item.type === 'folder') {
            invalidIds = getDescendantFolderIds(item.id);
        }

        const folderMap = new Map<string | null, Folder[]>();
        folders.forEach(f => {
            if (!folderMap.has(f.parent_id)) {
                folderMap.set(f.parent_id, []);
            }
            folderMap.get(f.parent_id)!.push(f);
        });

        const buildTree = (parentId: string | null, depth: number): { folder: Folder, depth: number }[] => {
            const children = folderMap.get(parentId) || [];
            let result: { folder: Folder, depth: number }[] = [];
            children.forEach(child => {
                if (!invalidIds.has(child.id)) {
                    result.push({ folder: child, depth });
                    result = result.concat(buildTree(child.id, depth + 1));
                }
            });
            return result;
        };

        return buildTree(null, 0);
    }, [folders, item]);

    const handleSubmit = () => {
        moveItem(item.id, item.type, selectedFolderId);
        closeMoveItemModal();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4"
            onClick={closeMoveItemModal}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-lg border border-gray-200 dark:border-slate-700 transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Move Item</h2>
                <div className="space-y-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 max-h-80 overflow-y-auto">
                    <div 
                        onClick={() => setSelectedFolderId(null)}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${selectedFolderId === null ? 'bg-primary/20' : 'hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                    >
                        <FolderIcon className="w-5 h-5 text-sky-400" />
                        <span className="text-gray-800 dark:text-slate-200">Home (Root Folder)</span>
                    </div>
                    {availableFolders.map(({ folder, depth }) => (
                         <div 
                            key={folder.id}
                            onClick={() => setSelectedFolderId(folder.id)}
                            style={{ paddingLeft: `${(depth * 1.5) + 0.5}rem` }}
                            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${selectedFolderId === folder.id ? 'bg-primary/20' : 'hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                        >
                            <FolderIcon className="w-5 h-5 text-sky-400" />
                            <span className="text-gray-800 dark:text-slate-200">{folder.name}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-slate-700/50">
                    <button type="button" onClick={closeMoveItemModal} className="py-2 px-4 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-800 dark:text-slate-200 rounded-lg font-semibold transition-colors">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSubmit} className="py-2 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors">
                        Move Here
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MoveItemModal;