import React from 'react';
import { useTemplate } from '../context/TemplateContext';
import { StarIcon } from './Icons';
import type { UpgradeReason } from '../types';

interface UpgradeModalProps {
    reason: UpgradeReason;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ reason }) => {
    const { closeUpgradeModal, openSubscriptionModal, redirectToCheckout } = useTemplate();

    const content = {
        template_limit: {
            title: "You've Reached Your Template Limit",
            message: "The Free plan allows for up to 5 saved templates. To create unlimited templates, please upgrade to a Pro or Team plan.",
            buttonText: "View Pro Plans",
            plan: 'Pro'
        },
        workspace_limit: {
            title: "You've Reached Your Workspace Limit",
            message: "The Free plan includes one workspace. To create multiple workspaces for different projects or clients, please upgrade to a Pro or Team plan.",
            buttonText: "View Pro Plans",
            plan: 'Pro'
        },
        team_feature: {
            title: "Unlock Team Collaboration",
            message: "Inviting members and sharing workspaces is a feature of our Team plan. Upgrade to start collaborating with your colleagues.",
            buttonText: "View Team Plan",
            plan: 'Team'
        },
    };

    const currentContent = content[reason];

    const handleUpgradeClick = () => {
        closeUpgradeModal();
        // For simplicity, we'll just redirect to the relevant plan's checkout
        redirectToCheckout(currentContent.plan as 'Pro' | 'Team');
    };

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4"
            onClick={closeUpgradeModal}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-lg border border-gray-200 dark:border-slate-700 transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-400/20 mb-4">
                        <StarIcon className="h-7 w-7 text-yellow-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{currentContent.title}</h2>
                    <p className="text-gray-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                        {currentContent.message}
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={closeUpgradeModal}
                            className="py-2 px-4 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-800 dark:text-slate-200 rounded-lg font-semibold transition-colors"
                        >
                            Maybe Later
                        </button>
                        <button
                            onClick={handleUpgradeClick}
                            className="py-2 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors"
                        >
                            {currentContent.buttonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;