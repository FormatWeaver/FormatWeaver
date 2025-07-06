import React from 'react';
import { useTemplate } from '../context/TemplateContext';
import PricingTiers from './PricingTiers';

const SubscriptionModal: React.FC = () => {
    const { closeSubscriptionModal, currentUser, redirectToCheckout } = useTemplate();
    const currentPlan = currentUser?.subscriptionPlan || 'Free';
    
    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4"
            onClick={closeSubscriptionModal}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-4xl border border-gray-200 dark:border-slate-700 transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-3xl font-bold mb-2 text-center text-gray-900 dark:text-white">Choose Your Plan</h2>
                <p className="text-center text-gray-500 dark:text-slate-400 mb-8">Unlock more features and collaborate with your team.</p>

                <PricingTiers currentPlan={currentPlan} onSelectPlan={redirectToCheckout} />

                <div className="text-center mt-8">
                    <button onClick={closeSubscriptionModal} className="text-sm text-gray-500 dark:text-slate-400 hover:underline">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionModal;