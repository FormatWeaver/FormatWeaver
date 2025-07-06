import React from 'react';
import { useTemplate } from '../context/TemplateContext';
import { MagicWandIcon, AcademicCapIcon, ChatBubbleLeftRightIcon, BriefcaseIcon, ArrowsPointingInIcon, ArrowsPointingOutIcon, XCircleIcon } from './Icons';

const BulkRefineModal: React.FC = () => {
    const {
        closeBulkRefineModal,
        isBulkRefining,
        bulkRefineError,
        bulkRefineProgress,
        handleBulkRefine,
        csvData,
    } = useTemplate();

    type RefineOption = {
        name: "Formal" | "Casual" | "Professional" | "Shorter" | "Longer";
        icon: React.FC<{className?: string}>;
        prompt: string;
        color: string;
    };

    const options: RefineOption[] = [
        { name: "Formal", icon: AcademicCapIcon, prompt: "more formal and academic", color: "text-blue-400" },
        { name: "Casual", icon: ChatBubbleLeftRightIcon, prompt: "more casual and conversational", color: "text-green-400" },
        { name: "Professional", icon: BriefcaseIcon, prompt: "more professional and business-oriented", color: "text-indigo-400" },
        { name: "Shorter", icon: ArrowsPointingInIcon, prompt: "shorter and more concise", color: "text-yellow-400" },
        { name: "Longer", icon: ArrowsPointingOutIcon, prompt: "longer and more detailed", color: "text-purple-400" },
    ];
    
    const totalRows = csvData?.length || 0;
    const processedRows = Math.floor(bulkRefineProgress * totalRows);

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4"
            onClick={isBulkRefining ? undefined : closeBulkRefineModal}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-lg border border-gray-200 dark:border-slate-700 transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 mb-2">
                    <MagicWandIcon className="w-8 h-8 text-purple-400"/>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Refine with AI</h2>
                </div>
                <p className="text-gray-500 dark:text-slate-400 mb-6">
                    Choose a style to apply to the first text-based variable in all {totalRows} rows. This may take a few moments.
                </p>

                {isBulkRefining ? (
                    <div className="text-center space-y-4">
                        <p className="text-lg font-semibold text-gray-700 dark:text-slate-300 animate-pulse">Refining in progress...</p>
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4">
                            <div 
                                className="bg-primary h-4 rounded-full transition-all duration-500" 
                                style={{ width: `${bulkRefineProgress * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{processedRows} / {totalRows} rows processed</p>
                    </div>
                ) : bulkRefineError ? (
                     <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 flex items-start gap-3 my-4">
                        <XCircleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                        <p className="font-bold">Refinement Error</p>
                        <p>{bulkRefineError}</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {options.map(opt => (
                            <button
                                key={opt.name}
                                onClick={() => handleBulkRefine(opt.prompt)}
                                className="flex flex-col items-center justify-center gap-3 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border-2 border-gray-200 dark:border-slate-700 hover:border-primary hover:bg-primary/10 transition-colors"
                            >
                                <opt.icon className={`w-8 h-8 ${opt.color}`} />
                                <span className="font-semibold text-gray-800 dark:text-slate-200">{opt.name}</span>
                            </button>
                        ))}
                    </div>
                )}


                <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-slate-700/50">
                    <button
                        type="button"
                        onClick={closeBulkRefineModal}
                        disabled={isBulkRefining}
                        className="py-2 px-4 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-800 dark:text-slate-200 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                        {isBulkRefining ? 'Please wait...' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkRefineModal;