import React, { useMemo, useRef, useState } from 'react';
import { useTemplate } from '../context/TemplateContext';
import type { Variable } from '../types';
import { UploadIcon, MagicWandIcon, ChevronDownIcon, DownloadIcon, CopyIcon, TableCellsIcon } from './Icons';

const BulkDataView: React.FC = () => {
    const { 
        variables, 
        csvData, 
        selectedCsvRowIndex, 
        selectCsvRow, 
        updateCsvRowData,
        clearCsvData,
        importCsv,
        getOutputForRow,
        openBulkRefineModal
    } = useTemplate();

    const fileInputRef = useRef<HTMLInputElement>(null);
    
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-start gap-4 flex-wrap">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-slate-300">Bulk Data Editor</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{csvData?.length || 0} rows loaded. Click a row to preview.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                     <button
                        onClick={openBulkRefineModal}
                        className="flex items-center gap-2 py-2 px-3 rounded-lg font-semibold transition-colors bg-purple-600 hover:bg-purple-700 text-white border border-purple-500"
                        title="Refine all rows with AI"
                    >
                        <MagicWandIcon className="w-5 h-5" />
                        Refine All with AI
                    </button>
                    <ExportMenu />
                </div>
            </div>
            <div className="overflow-x-auto bg-gray-50 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-700 rounded-lg max-h-[50vh]">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 dark:bg-slate-800/60 sticky top-0 z-10">
                        <tr>
                            {variables.map(v => (
                                <th key={v.id} className="p-3 font-mono text-primary whitespace-nowrap">{`{{${v.name}}}`}</th>
                            ))}
                            <th className="p-3 font-semibold text-gray-700 dark:text-slate-300 whitespace-nowrap">Output Preview</th>
                        </tr>
                    </thead>
                    <tbody>
                        {csvData?.map((row, rowIndex) => {
                            const isSelected = rowIndex === selectedCsvRowIndex;
                            const outputPreview = getOutputForRow(row);
                            return (
                                <tr 
                                    key={rowIndex} 
                                    onClick={() => selectCsvRow(rowIndex)}
                                    className={`border-t border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${isSelected ? 'bg-primary/10' : ''}`}
                                >
                                    {variables.map(variable => (
                                        <td key={variable.id} className="p-2 align-top">
                                            <CellInput 
                                                variable={variable} 
                                                value={row[variable.name]} 
                                                onChange={(newValue) => updateCsvRowData(rowIndex, variable.name, newValue)} 
                                            />
                                        </td>
                                    ))}
                                    <td className="p-3 align-top text-gray-500 dark:text-slate-400 font-mono text-xs">
                                        <div className="max-h-24 overflow-y-auto relative whitespace-pre-wrap break-words">
                                            {outputPreview}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
             <div className="pt-4 mt-4 border-t border-gray-200 dark:border-slate-700/50 flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold transition-colors bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-600"
                >
                    <UploadIcon className="w-5 h-5" />
                    Import a different CSV...
                </button>
                 <button
                    onClick={clearCsvData}
                    className="w-full sm:w-auto py-2 px-4 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:underline"
                >
                    Clear & Exit Bulk Mode
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    onChange={(e) => e.target.files && importCsv(e.target.files[0])}
                    className="hidden"
                />
            </div>
        </div>
    );
};

const ExportMenu: React.FC = () => {
    const { generateAndDownloadZip, copyAllOutputsToClipboard, exportOutputsToCsv } = useTemplate();
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleCopy = () => {
        copyAllOutputsToClipboard();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setIsOpen(false);
    };

    const handleDownloadZip = async () => {
        setIsDownloading(true);
        await generateAndDownloadZip();
        setIsDownloading(false);
        setIsOpen(false);
    }
    
    const handleExportCsv = () => {
        exportOutputsToCsv();
        setIsOpen(false);
    }

    return (
        <div className="relative inline-block text-left">
            <div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex items-center gap-2 w-full justify-center rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 font-semibold text-gray-700 dark:text-slate-300 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800"
                >
                    Export All
                    <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" />
                </button>
            </div>

            {isOpen && (
                <div 
                    className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-slate-600"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <div className="py-1">
                        <button onClick={handleCopy} className="text-left w-full px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-3">
                            <CopyIcon className="w-5 h-5"/>
                            <span>{copied ? 'Copied!' : 'Copy All Outputs'}</span>
                        </button>
                         <button onClick={handleExportCsv} className="text-left w-full px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-3">
                            <TableCellsIcon className="w-5 h-5"/>
                            <span>Export to CSV</span>
                        </button>
                        <button onClick={handleDownloadZip} disabled={isDownloading} className="text-left w-full px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-3 disabled:opacity-50">
                            <DownloadIcon className="w-5 h-5"/>
                            <span>{isDownloading ? 'Zipping...' : 'Download as .zip'}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


const CellInput: React.FC<{ variable: Variable, value: any, onChange: (newValue: any) => void }> = ({ variable, value, onChange }) => {
    switch (variable.type) {
        case 'boolean':
            return (
                 <div className="flex justify-start items-center h-full">
                    <input
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => onChange(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-400 dark:border-slate-600 text-primary focus:ring-primary bg-gray-100 dark:bg-slate-800"
                    />
                </div>
            );
        case 'date':
            return (
                <input
                    type="date"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm"
                />
            );
        case 'number':
            return (
                <input
                    type="number"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm"
                />
            );
        case 'list':
             return (
                <textarea
                    value={Array.isArray(value) ? value.join('\n') : ''}
                    onChange={(e) => onChange(e.target.value.split('\n'))}
                    rows={3}
                    className="w-full p-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm font-mono"
                />
            );
        default: // 'text'
            return (
                <textarea
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    rows={3}
                    className="w-full p-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm"
                />
            );
    }
}

export default BulkDataView;