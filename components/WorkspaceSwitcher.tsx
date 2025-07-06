import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTemplate } from '../context/TemplateContext';
import { BriefcaseIcon, ChevronUpDownIcon, CheckIcon, AddIcon, Cog6ToothIcon, StarIcon } from './Icons';

const WorkspaceSwitcher: React.FC = () => {
    const { 
        workspaces, 
        activeWorkspaceId, 
        switchWorkspace, 
        openNewWorkspaceModal,
        openTeamSettingsModal,
        currentUser,
        openSubscriptionModal
    } = useTemplate();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const activeWorkspace = useMemo(() => {
        return workspaces.find(w => w.id === activeWorkspaceId);
    }, [workspaces, activeWorkspaceId]);

    const isOwner = useMemo(() => {
        if (!activeWorkspace || !currentUser) return false;
        return activeWorkspace.members.some(m => m.email === currentUser.email && m.role === 'Owner');
    }, [activeWorkspace, currentUser]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);


    if (!activeWorkspace) {
        return null;
    }

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-left bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg font-semibold transition-colors text-gray-700 dark:text-slate-300 py-2 px-3 w-full sm:w-56"
            >
                <BriefcaseIcon className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <span className="flex-grow truncate text-sm">{activeWorkspace.name}</span>
                <ChevronUpDownIcon className="w-5 h-5 text-gray-400 dark:text-slate-500 flex-shrink-0" />
            </button>

            {isOpen && (
                 <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-700 z-30 p-2">
                    <div className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase px-2 py-1">Switch Workspace</div>
                    <div className="my-1 max-h-60 overflow-y-auto">
                        {workspaces.map(ws => (
                            <button
                                key={ws.id}
                                onClick={() => {
                                    switchWorkspace(ws.id);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
                            >
                                {ws.id === activeWorkspaceId ? (
                                    <CheckIcon className="w-5 h-5 text-primary"/>
                                ) : (
                                    <span className="w-5 h-5"></span>
                                )}
                                <span className="flex-grow text-sm text-gray-800 dark:text-slate-200">{ws.name}</span>
                            </button>
                        ))}
                    </div>
                    <div className="border-t border-gray-200 dark:border-slate-700 pt-2 mt-1">
                         <button
                            onClick={() => {
                                openNewWorkspaceModal();
                                setIsOpen(false);
                            }}
                            className="w-full text-left flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 text-sm text-gray-800 dark:text-slate-200"
                        >
                            <AddIcon className="w-5 h-5"/>
                            Create New Workspace
                        </button>
                        {isOwner && (
                            <button
                                onClick={() => {
                                    openTeamSettingsModal();
                                    setIsOpen(false);
                                }}
                                className="w-full text-left flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 text-sm text-gray-800 dark:text-slate-200"
                            >
                                <Cog6ToothIcon className="w-5 h-5"/>
                                Workspace Settings
                            </button>
                        )}
                        <button
                            onClick={() => {
                                openSubscriptionModal();
                                setIsOpen(false);
                            }}
                             className="w-full text-left flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 text-sm text-gray-800 dark:text-slate-200"
                        >
                           <StarIcon className="w-5 h-5 text-yellow-500"/>
                           Manage Subscription
                        </button>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default WorkspaceSwitcher;
