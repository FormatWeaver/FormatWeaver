import React, { useMemo } from 'react';
import { useTemplate } from '../context/TemplateContext';
import { ArrowRightIcon } from './Icons';

const FolderCrumb: React.FC = () => {
    const { folders, currentFolderId, setCurrentFolderId } = useTemplate();

    const breadcrumbs = useMemo(() => {
        const path = [];
        let currentId = currentFolderId;
        while (currentId) {
            const folder = folders.find(f => f.id === currentId);
            if (folder) {
                path.unshift(folder);
                currentId = folder.parent_id;
            } else {
                break;
            }
        }
        return path;
    }, [currentFolderId, folders]);

    return (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800/50 p-2 rounded-lg border border-gray-200 dark:border-slate-700">
            <button 
                onClick={() => setCurrentFolderId(null)} 
                className="font-semibold hover:text-gray-800 dark:hover:text-white transition-colors"
            >
                Home
            </button>
            {breadcrumbs.map(folder => (
                <React.Fragment key={folder.id}>
                    <ArrowRightIcon className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                    <button 
                        onClick={() => setCurrentFolderId(folder.id)}
                        className="font-semibold hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                        {folder.name}
                    </button>
                </React.Fragment>
            ))}
        </div>
    );
};

export default FolderCrumb;