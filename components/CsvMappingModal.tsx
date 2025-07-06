import React, { useState, useEffect } from 'react';
import { useTemplate } from '../context/TemplateContext';
import { ChevronRightIcon } from './Icons';

const CsvMappingModal: React.FC = () => {
    const { 
        variables,
        rawCsvData,
        applyCsvMapping,
        closeCsvMappingModal
    } = useTemplate();
    
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);

    const requiredVariables = variables.map(v => v.name);
    const csvHeaders = rawCsvData?.headers || [];

    useEffect(() => {
        // Attempt to auto-map based on name matching
        const initialMapping: Record<string, string> = {};
        requiredVariables.forEach(varName => {
            const exactMatch = csvHeaders.find(h => h === varName);
            if (exactMatch) {
                initialMapping[varName] = exactMatch;
            } else {
                 const looseMatch = csvHeaders.find(h => h.toLowerCase().replace(/[\s_]/g, '') === varName.toLowerCase().replace(/[\s_]/g, ''));
                 if(looseMatch) {
                    initialMapping[varName] = looseMatch;
                 }
            }
        });
        setMapping(initialMapping);
    }, [variables, rawCsvData]);

    const handleSelectChange = (variableName: string, csvHeader: string) => {
        setMapping(prev => ({
            ...prev,
            [variableName]: csvHeader
        }));
        setError(null);
    };

    const handleSubmit = () => {
        const unmappedVars = requiredVariables.filter(v => !mapping[v]);
        if (unmappedVars.length > 0) {
            setError(`All template variables must be mapped to a CSV column. Please map: ${unmappedVars.join(', ')}`);
            return;
        }
        applyCsvMapping(mapping);
    };

    if (!rawCsvData) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4"
            onClick={closeCsvMappingModal}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-2xl border border-gray-200 dark:border-slate-700 transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Map CSV Columns to Variables</h2>
                <p className="text-gray-500 dark:text-slate-400 mb-6">
                    Match each template variable on the left with the corresponding column from your CSV file on the right.
                </p>

                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-4">
                    {requiredVariables.map(varName => (
                        <div key={varName} className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-700">
                            <div className="font-mono text-primary text-center md:text-right font-semibold">
                                {`{{${varName}}}`}
                            </div>
                            <div className="text-gray-400 dark:text-slate-500 mx-auto">
                                <ChevronRightIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <select 
                                    value={mapping[varName] || ''}
                                    onChange={(e) => handleSelectChange(varName, e.target.value)}
                                    className="w-full p-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                                >
                                    <option value="" disabled>Select a CSV column...</option>
                                    {csvHeaders.map(header => (
                                        <option key={header} value={header}>{header}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>

                {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-md mt-6">{error}</p>}
                
                <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-slate-700/50">
                    <button
                        type="button"
                        onClick={closeCsvMappingModal}
                        className="py-2 px-4 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-800 dark:text-slate-200 rounded-lg font-semibold transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="py-2 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors"
                    >
                        Apply Mapping & Import
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CsvMappingModal;