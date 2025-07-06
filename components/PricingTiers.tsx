import React from 'react';
import { StarIcon, CheckIcon, UserGroupIcon, BriefcaseIcon } from './Icons';
import type { SubscriptionPlan } from '../types';
import { useTemplate } from '../context/TemplateContext';

interface PricingTiersProps {
    currentPlan: SubscriptionPlan | null;
    onSelectPlan: (plan: SubscriptionPlan) => void;
}

const PricingTiers: React.FC<PricingTiersProps> = ({ currentPlan, onSelectPlan }) => {
    const { isAuthenticated } = useTemplate();

    const plans = [
        {
            name: 'Free',
            price: '$0',
            description: 'For personal use and trying out Format Weaver.',
            icon: BriefcaseIcon,
            features: [
                '5 Saved Templates',
                '1 Workspace',
                'AI-Powered Suggestions',
                'Bulk Processing via CSV',
            ],
            buttonText: 'Get Started',
        },
        {
            name: 'Pro',
            price: '$10',
            pricePeriod: '/ month',
            description: 'For power users who need unlimited creation.',
            icon: StarIcon,
            iconClass: 'text-yellow-500',
            features: [
                'Unlimited Templates',
                'Unlimited Workspaces',
                'Advanced AI Refinement',
                'All AI Generation Tools',
            ],
            buttonText: 'Upgrade to Pro',
            buttonClass: 'bg-primary hover:bg-primary-hover text-white',
        },
        {
            name: 'Team',
            price: '$25',
            pricePeriod: '/ month',
            description: 'For teams who want to collaborate seamlessly.',
            icon: UserGroupIcon,
            iconClass: 'text-indigo-500',
            features: [
                'All features from Pro',
                'Invite Team Members',
                'Shared Workspaces',
                'Role-Based Permissions',
            ],
            buttonText: 'Upgrade to Team',
            buttonClass: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map(plan => {
                const isCurrent = currentPlan === plan.name;
                const buttonAction = () => {
                    if (plan.name !== 'Free' || !isAuthenticated) {
                        onSelectPlan(plan.name as SubscriptionPlan);
                    }
                };
                
                let buttonText = plan.buttonText;
                let buttonClasses = plan.buttonClass || 'bg-primary hover:bg-primary-hover text-white';

                if (isCurrent) {
                    buttonText = 'Your Current Plan';
                    buttonClasses = 'bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-slate-200 cursor-default';
                } else if (!currentPlan && plan.name === 'Free') {
                     buttonText = 'Sign up for Free';
                     buttonClasses = 'bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-800 dark:text-slate-200';
                } else if (currentPlan && plan.name !== 'Free') {
                    buttonText = `Switch to ${plan.name}`;
                }


                return (
                    <div key={plan.name} className={`flex flex-col p-6 rounded-lg border-2 ${
                        isCurrent ? 'border-primary' : 'border-gray-200 dark:border-slate-700'
                    } bg-gray-50/50 dark:bg-slate-900/50`}>
                        <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-4">
                                <plan.icon className={`w-8 h-8 ${plan.iconClass || 'text-primary'}`} />
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-slate-200">{plan.name}</h3>
                            </div>
                            <p className="text-gray-500 dark:text-slate-400 text-sm mb-4 h-10">{plan.description}</p>
                            <div className="mb-6">
                                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
                                {plan.pricePeriod && <span className="text-gray-500 dark:text-slate-400">{plan.pricePeriod}</span>}
                            </div>
                            <ul className="space-y-3">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700 dark:text-slate-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-8">
                            <button
                                onClick={buttonAction}
                                disabled={isCurrent || (plan.name === 'Free' && isAuthenticated)}
                                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-80 ${buttonClasses}`}
                            >
                                {buttonText}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PricingTiers;