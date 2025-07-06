import React, { useState, useEffect, useRef } from 'react';
import { useTemplate } from '../context/TemplateContext';
import type { VariableType } from '../types';

const VariableModal: React.FC = () => {
  const { selection, closeModal, handleCreateVariable, variables, variableToEdit, handleUpdateVariable } = useTemplate();
  
  const isEditing = !!variableToEdit;
  
  const [name, setName] = useState('');
  const [type, setType] = useState<VariableType>('text');
  const [itemFormat, setItemFormat] = useState('- {{item}}');
  const [booleanLabels, setBooleanLabels] = useState({ true: 'true', false: 'false' });
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const existingVariableNames = variables.map(v => v.name);
  const selectionText = selection?.text || variableToEdit?.originalText || '';

  useEffect(() => {
    if (isEditing) {
      setName(variableToEdit.name);
      setType(variableToEdit.type);
      setItemFormat(variableToEdit.itemFormat || '- {{item}}');
      setBooleanLabels(variableToEdit.booleanLabels || { true: 'true', false: 'false' });
    } else {
      const isList = selectionText.includes('\n') && selectionText.trim().split('\n').some(line => line.trim().startsWith('-') || line.trim().startsWith('*'));
      if (isList) {
          setType('list');
      }
    }

    if (inputRef.current) {
        inputRef.current.focus();
    }
  }, [selectionText, isEditing, variableToEdit]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedName = name.trim().replace(/\s+/g, '_').toLowerCase();
    
    if (!sanitizedName) {
        setError('Variable name cannot be empty.');
        return;
    }
    if (!/^[a-z0-9_]+$/.test(sanitizedName)) {
        setError('Name can only contain lowercase letters, numbers, and underscores.');
        return;
    }
    if (existingVariableNames.includes(sanitizedName) && (!isEditing || sanitizedName !== variableToEdit.name)) {
        setError('This variable name is already in use.');
        return;
    }
    
    if(isEditing) {
      handleUpdateVariable(variableToEdit.id, { name: sanitizedName, type, itemFormat, booleanLabels });
    } else {
      handleCreateVariable({ name: sanitizedName, type, itemFormat, booleanLabels });
    }
  };

  const renderTypeOptions = () => {
    const types: {id: VariableType, label: string, description: string}[] = [
        { id: 'text', label: 'Text', description: 'A single line of text.' },
        { id: 'list', label: 'List', description: 'Repeatable text items.' },
        { id: 'date', label: 'Date', description: 'A date picker.' },
        { id: 'number', label: 'Number', description: 'A numerical value.' },
        { id: 'boolean', label: 'Boolean', description: 'A true/false switch.' },
    ];
    
    const radioBaseClasses = "flex items-start text-left gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors bg-gray-50/50 dark:bg-slate-900/50";
    const radioInactiveClasses = "border-gray-300 dark:border-slate-700 hover:border-sky-600";
    const radioActiveClasses = "border-primary ring-2 ring-primary/30";

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {types.map(({ id, label, description }) => (
          <label key={id} className={`${radioBaseClasses} ${type === id ? radioActiveClasses : radioInactiveClasses}`}>
            <input type="radio" name="type" value={id} checked={type === id} onChange={() => setType(id)} className="sr-only" />
            <span className={`mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${type === id ? 'border-primary' : 'border-gray-400 dark:border-slate-500'}`}>
              {type === id && <span className="w-2.5 h-2.5 rounded-full bg-primary transition-transform transform scale-100"></span>}
            </span>
            <div>
              <span className="font-semibold text-gray-800 dark:text-slate-200">{label}</span>
              <p className="text-xs text-gray-500 dark:text-slate-400">{description}</p>
            </div>
          </label>
        ))}
      </div>
    );
  };
  
  return (
    <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4"
        onClick={closeModal}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-lg border border-gray-200 dark:border-slate-700 animate-modal-in"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{isEditing ? 'Edit Variable' : 'Create New Variable'}</h2>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">From Selected Text</label>
          <p className="bg-gray-100 dark:bg-slate-900 p-3 rounded-md border border-gray-300 dark:border-slate-600 font-mono text-gray-700 dark:text-slate-300 text-sm max-h-24 overflow-y-auto">
            {selectionText}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="variable-name" className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
              Variable Name
            </label>
            <input
              ref={inputRef}
              id="variable-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="e.g., project_name"
            />
             {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Type</label>
            {renderTypeOptions()}
          </div>
          
          {type === 'list' && (
            <div>
              <label htmlFor="item-format" className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                List Item Format <span className="text-xs text-gray-500 dark:text-slate-400 font-normal">{'(use `{{item}}` as a placeholder)'}</span>
              </label>
              <input
                id="item-format"
                type="text"
                value={itemFormat}
                onChange={(e) => setItemFormat(e.target.value)}
                className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md font-mono text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          )}

          {type === 'boolean' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Boolean Output</label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="boolean-true" className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Text for 'True'</label>
                  <input
                    id="boolean-true"
                    type="text"
                    value={booleanLabels.true}
                    onChange={(e) => setBooleanLabels(p => ({ ...p, true: e.target.value }))}
                    className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="boolean-false" className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Text for 'False'</label>
                  <input
                    id="boolean-false"
                    type="text"
                    value={booleanLabels.false}
                    onChange={(e) => setBooleanLabels(p => ({ ...p, false: e.target.value }))}
                    className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-slate-700/50">
            <button
              type="button"
              onClick={closeModal}
              className="py-2 px-4 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-800 dark:text-slate-200 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors"
            >
              {isEditing ? 'Update Variable' : 'Create Variable'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VariableModal;