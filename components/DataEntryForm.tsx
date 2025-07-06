import React, { useRef, useState } from 'react';
import { AddIcon, TrashIcon, CodeBracketsIcon, PencilIcon, UploadIcon, XCircleIcon, BoltIcon, RocketIcon, MagicWandIcon } from './Icons';
import { useTemplate } from '../context/TemplateContext';
import type { Variable } from '../types';
import BulkDataView from './BulkDataView';

const DataEntryForm: React.FC = () => {
  const { variables, openModalForEdit, handleDeleteVariable, csvData, csvError, openAutofillModal, loadDemo } = useTemplate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  return (
    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg p-6 flex flex-col">
      <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">2. Data Entry</h2>
        {variables.length > 0 && !csvData && (
          <button
            onClick={openAutofillModal}
            className="flex items-center gap-2 py-2 px-3 rounded-lg font-semibold transition-colors bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-yellow-500 dark:text-yellow-400 border border-gray-300 dark:border-slate-600"
            title="Autofill form with AI"
          >
            <BoltIcon className="w-5 h-5" />
            Autofill with AI
          </button>
        )}
      </div>
      
      {csvError && (
         <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 flex items-start gap-3 mb-4">
            <XCircleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">CSV Error</p>
              <p>{csvError}</p>
            </div>
          </div>
      )}

      {variables.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-10">
          <CodeBracketsIcon className="w-16 h-16 text-gray-300 dark:text-slate-600 mb-4" />
          <p className="text-gray-500 dark:text-slate-400 max-w-xs mb-6">Your variables will appear here once you create them from the pattern input above.</p>
          <button
            onClick={loadDemo}
            className="flex items-center gap-3 py-3 px-6 rounded-lg font-bold transition-transform hover:scale-105 bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg hover:shadow-primary/40"
          >
            <RocketIcon className="w-6 h-6" />
            Show me a Demo
          </button>
        </div>
      ) : csvData ? (
        <BulkDataView />
      ) : (
        <div className="space-y-6">
          <CsvImportButton />
          {variables.map(variable => (
            <div key={variable.id} className="bg-white/40 dark:bg-slate-800/40 p-4 rounded-lg border border-gray-200 dark:border-slate-700/80 transition-shadow hover:shadow-primary/10 hover:shadow-lg">
              <div className="flex justify-between items-center mb-2">
                  <label className="font-mono text-sm font-bold text-primary">
                  {`{{${variable.name}}}`}
                  </label>
                  <div className="flex items-center gap-1">
                    <button 
                        onClick={() => openModalForEdit(variable.id)}
                        className="text-gray-400 dark:text-slate-400 hover:text-sky-400 transition-colors p-1 rounded-full hover:bg-sky-500/10"
                        title={`Edit variable ${variable.name}`}
                    >
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleDeleteVariable(variable.id)}
                        className="text-gray-400 dark:text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-500/10"
                        title={`Delete variable ${variable.name}`}
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
              </div>
              <VariableInput variable={variable} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CsvImportButton: React.FC = () => {
    const { importCsv } = useTemplate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
            <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold transition-colors bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-600"
            >
                <UploadIcon className="w-5 h-5" />
                Import from CSV for Bulk Processing...
            </button>
            <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={(e) => e.target.files && importCsv(e.target.files[0])}
                className="hidden"
            />
        </div>
    );
}


const VariableInput: React.FC<{ variable: Variable }> = ({ variable }) => {
  const { formData, handleFormChange, csvData, openAIGenerationModal } = useTemplate();
  const isDisabled = !!csvData;

  const showAIGenerateButton = (variable.type === 'text' || variable.type === 'list') && !isDisabled;

  const renderInput = () => {
    switch (variable.type) {
      case 'list':
        return <ListInput variableName={variable.name} isDisabled={isDisabled} />;
      case 'date':
        return (
          <input
            type="date"
            value={formData[variable.name] as string || ''}
            onChange={e => handleFormChange(variable.name, e.target.value)}
            disabled={isDisabled}
            className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          />
        );
      case 'number':
         return (
          <input
            type="number"
            value={formData[variable.name] as string || ''}
            onChange={e => handleFormChange(variable.name, e.target.value)}
            disabled={isDisabled}
            className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            placeholder={`Enter number for ${variable.name}...`}
          />
        );
      case 'boolean':
        return <ToggleSwitch variableName={variable.name} isDisabled={isDisabled} />;
      default: // 'text'
        return (
          <input
            type="text"
            value={formData[variable.name] as string || ''}
            onChange={e => handleFormChange(variable.name, e.target.value)}
            disabled={isDisabled}
            className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            placeholder={`Enter value for ${variable.name}...`}
          />
        );
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-grow">{renderInput()}</div>
      {showAIGenerateButton && (
        <button
          onClick={() => openAIGenerationModal({ name: variable.name, type: variable.type as 'text' | 'list' })}
          title="Generate with AI"
          className="p-2 rounded-md bg-gray-200/80 dark:bg-slate-700/80 hover:bg-gray-200 dark:hover:bg-slate-700 text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors flex-shrink-0"
        >
          <MagicWandIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};


const ListInput: React.FC<{ variableName: string, isDisabled: boolean }> = ({ variableName, isDisabled }) => {
    const { formData, handleFormChange } = useTemplate();
    const values = formData[variableName] as string[] || [];
    const [newItem, setNewItem] = useState('');

    const handleAddItem = () => {
        if (newItem.trim()) {
            handleFormChange(variableName, [...values, newItem]);
            setNewItem('');
        }
    };

    const handleRemoveItem = (indexToRemove: number) => {
        handleFormChange(variableName, values.filter((_, index) => index !== indexToRemove));
    };
    
    const handleUpdateItem = (indexToUpdate: number, newValue: string) => {
        const newValues = values.map((item, index) => (index === indexToUpdate ? newValue : item));
        handleFormChange(variableName, newValues);
    };

    return (
        <div className="space-y-3">
            {values.length > 0 && (
                <div className="space-y-2">
                    {values.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 group">
                            <input
                                type="text"
                                value={item}
                                onChange={(e) => handleUpdateItem(index, e.target.value)}
                                disabled={isDisabled}
                                className="flex-grow p-2 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md text-sm transition-colors focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-70 disabled:cursor-not-allowed"
                                placeholder="Enter list item..."
                            />
                            <button onClick={() => handleRemoveItem(index)} disabled={isDisabled} className="p-2 text-gray-400 dark:text-slate-500 hover:text-red-500 rounded-md transition-colors opacity-50 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {!isDisabled && (
              <div className="flex gap-2">
                  <input 
                      type="text"
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                      placeholder="Add new list item..."
                      className="flex-grow p-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  />
                  <button 
                      onClick={handleAddItem} 
                      className="p-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-indigo-400/50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                      disabled={!newItem.trim()}
                      aria-label="Add item to list"
                  >
                      <AddIcon className="w-5 h-5" />
                  </button>
              </div>
            )}
        </div>
    );
}

const ToggleSwitch: React.FC<{ variableName: string, isDisabled: boolean }> = ({ variableName, isDisabled }) => {
    const { formData, handleFormChange } = useTemplate();
    const value = formData[variableName] as boolean || false;

    return (
        <button
            type="button"
            role="switch"
            aria-checked={value}
            onClick={() => handleFormChange(variableName, !value)}
            disabled={isDisabled}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                value ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-600'
            } disabled:opacity-70 disabled:cursor-not-allowed`}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
            }`} />
        </button>
    );
};

export default DataEntryForm;