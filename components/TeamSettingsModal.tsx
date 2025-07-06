import React, { useState, useMemo } from 'react';
import { useTemplate } from '../context/TemplateContext';
import { UserGroupIcon, TrashIcon, ChevronDownIcon, ShieldExclamationIcon, StarIcon } from './Icons';
import type { WorkspaceMember, WorkspaceMemberRole } from '../types';

const TeamSettingsModal: React.FC = () => {
    const { 
        closeTeamSettingsModal,
        activeWorkspaceId,
        workspaces,
        inviteUserToWorkspace,
        removeUserFromWorkspace,
        changeUserRole,
        currentUser,
        openDeleteWorkspaceModal,
        openSubscriptionModal,
    } = useTemplate();
    
    const [inviteEmail, setInviteEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const activeWorkspace = useMemo(() => {
        return workspaces.find(w => w.id === activeWorkspaceId);
    }, [workspaces, activeWorkspaceId]);

    const canInvite = currentUser?.subscriptionPlan === 'Team';

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeWorkspaceId || !inviteEmail.trim()) return;
        
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        
        const result = await inviteUserToWorkspace(activeWorkspaceId, inviteEmail.trim());

        if (result.success) {
            setSuccessMessage(`Invitation sent to ${inviteEmail.trim()}.`);
            setInviteEmail('');
        } else {
            setError(result.error || 'An unknown error occurred.');
        }
        setIsLoading(false);
    };

    if (!activeWorkspace) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4"
            onClick={closeTeamSettingsModal}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-2xl border border-gray-200 dark:border-slate-700 transform transition-all flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                        <UserGroupIcon className="w-7 h-7 text-indigo-400"/>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Workspace Settings</h2>
                            <p className="text-gray-500 dark:text-slate-400">{activeWorkspace.name}</p>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4">Invite New Member</h3>
                        {canInvite ? (
                            <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                    placeholder="member@example.com"
                                    className="flex-grow p-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                    required
                                />
                                <button type="submit" disabled={isLoading || !inviteEmail.trim()} className="py-2 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors disabled:opacity-50">
                                    {isLoading ? 'Inviting...' : 'Send Invite'}
                                </button>
                            </form>
                        ) : (
                            <div className="p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-yellow-700 dark:text-yellow-300">
                                    Team invitations are a premium feature.
                                </p>
                                <button 
                                    onClick={() => {
                                        closeTeamSettingsModal();
                                        openSubscriptionModal();
                                    }}
                                    className="flex-shrink-0 flex items-center gap-2 py-2 px-4 rounded-lg font-semibold transition-colors bg-yellow-500 hover:bg-yellow-600 text-black"
                                >
                                    <StarIcon className="w-5 h-5"/>
                                    Upgrade to Team Plan
                                </button>
                            </div>
                        )}
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        {successMessage && <p className="text-green-500 text-sm mt-2">{successMessage}</p>}
                    </div>

                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4">Manage Members</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {activeWorkspace.members.map(member => (
                                <MemberRow 
                                    key={member.user_id} 
                                    member={member} 
                                    workspaceId={activeWorkspace.id} 
                                    isCurrentUser={currentUser?.id === member.user_id}
                                    isLastOwner={activeWorkspace.members.filter(m => m.role === 'Owner').length <= 1}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-red-500/30">
                        <h3 className="text-lg font-semibold text-red-500 flex items-center gap-2">
                            <ShieldExclamationIcon className="w-6 h-6" />
                            Danger Zone
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                            This action is irreversible. Please be certain.
                        </p>
                        <div className="mt-4">
                            <button
                                onClick={() => openDeleteWorkspaceModal(activeWorkspace)}
                                className="py-2 px-4 text-sm font-semibold text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
                            >
                                Delete this workspace
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-slate-700/50">
                    <button type="button" onClick={closeTeamSettingsModal} className="py-2 px-4 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-800 dark:text-slate-200 rounded-lg font-semibold transition-colors">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

interface MemberRowProps {
    member: WorkspaceMember;
    workspaceId: string;
    isCurrentUser: boolean;
    isLastOwner: boolean;
}

const MemberRow: React.FC<MemberRowProps> = ({ member, workspaceId, isCurrentUser, isLastOwner }) => {
    const { removeUserFromWorkspace, changeUserRole } = useTemplate();
    const [role, setRole] = useState<WorkspaceMemberRole>(member.role);

    const handleRoleChange = (newRole: WorkspaceMemberRole) => {
        setRole(newRole);
        changeUserRole(workspaceId, member.user_id, newRole);
    }
    
    const canBeRemoved = !(isLastOwner && member.role === 'Owner');
    const canChangeRole = !(isLastOwner && member.role === 'Owner');

    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-700">
            <div>
                <p className="font-semibold text-gray-800 dark:text-slate-200">{member.email}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">{isCurrentUser ? 'You' : ''}</p>
            </div>
            <div className="flex items-center gap-4">
                {canChangeRole ? (
                    <RoleSelector role={role} onRoleChange={handleRoleChange} />
                ) : (
                    <span className="px-3 py-1 text-sm font-semibold text-gray-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 rounded-md">{member.role}</span>
                )}
                {canBeRemoved && (
                    <button 
                        onClick={() => removeUserFromWorkspace(workspaceId, member.user_id)}
                        className="p-2 text-gray-400 dark:text-slate-400 hover:text-red-500 rounded-full transition-colors hover:bg-red-500/10"
                        title={`Remove ${member.email}`}
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
}

const RoleSelector: React.FC<{role: WorkspaceMemberRole, onRoleChange: (role: WorkspaceMemberRole) => void}> = ({ role, onRoleChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const roles: WorkspaceMemberRole[] = ['Owner', 'Editor'];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1 text-sm font-semibold text-gray-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600"
            >
                {role}
                <ChevronDownIcon className="w-4 h-4" />
            </button>
            {isOpen && (
                <div 
                    className="absolute top-full right-0 mt-1 w-32 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-gray-200 dark:border-slate-600 z-10"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    {roles.map(r => (
                        <button
                            key={r}
                            onClick={() => {
                                onRoleChange(r);
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700"
                        >
                            {r}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


export default TeamSettingsModal;