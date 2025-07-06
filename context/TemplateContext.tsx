import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import type { User, Variable, Selection, Token, SavedTemplate, VariableType, AISuggestion, AIGenerationTarget, Folder, Workspace, WorkspaceMember, WorkspaceMemberRole, SubscriptionPlan, UpgradeReason, Toast } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { supabase } from '../supabaseClient';
import type { AuthError, Session } from '@supabase/supabase-js';


const PLAN_LIMITS = {
  Free: {
    templates: 5,
    workspaces: 1,
    team: false,
  },
  Pro: {
    templates: Infinity,
    workspaces: Infinity,
    team: false,
  },
  Team: {
    templates: Infinity,
    workspaces: Infinity,
    team: true,
  },
};

interface TemplateContextType {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Toasts
  toasts: Toast[];
  showToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;

  // Auth
  isAuthenticated: boolean;
  currentUser: User | null;
  authError: string | null;
  signUp: (email: string, pass: string) => Promise<{error: AuthError | null}>;
  signIn: (email: string, pass: string) => Promise<{error: AuthError | null}>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{error: AuthError | null}>;
  
  // Subscription
  isSubscriptionModalOpen: boolean;
  openSubscriptionModal: () => void;
  closeSubscriptionModal: () => void;
  isUpgradeModalOpen: boolean;
  openUpgradeModal: (reason: UpgradeReason) => void;
  closeUpgradeModal: () => void;
  upgradeReason: UpgradeReason | null;
  redirectToCheckout: (plan: SubscriptionPlan) => Promise<void>;

  // Workspaces & Teams
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (name: string) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  isNewWorkspaceModalOpen: boolean;
  openNewWorkspaceModal: () => void;
  closeNewWorkspaceModal: () => void;
  isTeamSettingsModalOpen: boolean;
  openTeamSettingsModal: () => void;
  closeTeamSettingsModal: () => void;
  inviteUserToWorkspace: (workspaceId: string, email: string) => Promise<{success: boolean, error?: string}>;
  removeUserFromWorkspace: (workspaceId: string, userId: string) => Promise<void>;
  changeUserRole: (workspaceId: string, userId: string, role: WorkspaceMemberRole) => Promise<void>;
  isDeleteWorkspaceModalOpen: boolean;
  workspaceToDelete: Workspace | null;
  openDeleteWorkspaceModal: (workspace: Workspace) => void;
  closeDeleteWorkspaceModal: () => void;

  // Core State
  templateTokens: Token[];
  variables: Variable[];
  formData: FormData;
  outputText: string;
  selection: Selection | null;
  isModalOpen: boolean;
  variableToEdit: Variable | null;
  templateString: string;
  
  resetTemplate: (newTemplate: string) => void;
  handleTextSelect: (newSelection: Selection) => void;
  openModal: () => void;
  openModalForEdit: (variableId: string) => void;
  closeModal: () => void;
  handleCreateVariable: (data: Omit<Variable, 'id' | 'originalText'>) => void;
  handleUpdateVariable: (id: string, data: Partial<Omit<Variable, 'id' | 'originalText'>>) => void;
  handleDeleteVariable: (variableId: string) => void;
  handleFormChange: (variableName: string, value: string | string[] | boolean) => void;
  
  // Template Persistence & Organization
  savedTemplates: SavedTemplate[];
  folders: Folder[];
  currentFolderId: string | null;
  setCurrentFolderId: (folderId: string | null) => void;
  saveTemplate: (name: string, folderId: string | null) => Promise<void>;
  loadTemplate: (template: SavedTemplate) => void;
  deleteTemplate: (templateId: string) => Promise<void>;
  loadDemo: () => void;
  createFolder: (name: string, parentId: string | null) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  renameItem: (id: string, type: 'folder' | 'template', newName: string) => Promise<void>;
  
  // Modals for Organization
  isNewFolderModalOpen: boolean;
  openNewFolderModal: () => void;
  closeNewFolderModal: () => void;
  isMoveItemModalOpen: boolean;
  itemToMove: {id: string, type: 'folder' | 'template'} | null;
  openMoveItemModal: (id: string, type: 'folder' | 'template') => void;
  closeMoveItemModal: () => void;
  moveItem: (itemId: string, itemType: 'folder' | 'template', newParentId: string | null) => Promise<void>;


  // CSV
  csvData: Record<string, any>[] | null;
  csvHeaders: string[];
  csvError: string | null;
  selectedCsvRowIndex: number;
  importCsv: (file: File) => void;
  clearCsvData: () => void;
  selectCsvRow: (newIndex: number) => void;
  updateCsvRowData: (rowIndex: number, variableName: string, value: any) => void;
  getOutputForRow: (rowData: Record<string, any>) => string;
  generateAndDownloadZip: () => Promise<void>;
  isCsvMappingModalOpen: boolean;
  rawCsvData: { data: Record<string, string>[], headers: string[] } | null;
  applyCsvMapping: (mapping: Record<string, string>) => void;
  closeCsvMappingModal: () => void;
  copyAllOutputsToClipboard: () => void;
  exportOutputsToCsv: () => void;


  // AI Suggestions
  isSuggesting: boolean;
  isSuggestionModalOpen: boolean;
  aiSuggestions: AISuggestion[];
  suggestionError: string | null;
  handleSuggestVariables: () => Promise<void>;
  closeSuggestionModal: () => void;
  createVariablesFromSuggestions: (suggestions: AISuggestion[]) => void;
  
  // AI Content Generation
  aiGenerationTarget: AIGenerationTarget | null;
  isGeneratingContent: boolean;
  generationError: string | null;
  openAIGenerationModal: (target: AIGenerationTarget) => void;
  closeAIGenerationModal: () => void;
  handleGenerateAIContent: (prompt: string) => Promise<void>;
  
  // AI Autofill
  isAutofillModalOpen: boolean;
  isAutofilling: boolean;
  autofillError: string | null;
  openAutofillModal: () => void;
  closeAutofillModal: () => void;
  handleAutofill: (prompt: string) => Promise<void>;

  // Screen Capture
  isSnapping: boolean;
  startSnapping: () => void;
  cancelSnapping: () => void;
  processImageAndSuggest: (imageData: string) => Promise<void>;

  // AI Output Refinement
  refinedOutput: { text: string; originalText: string; } | null;
  isRefining: boolean;
  refineError: string | null;
  refineOutput: (tone: string) => Promise<void>;
  revertRefinement: () => void;

  // AI Template Generation
  isAITemplateGeneratorModalOpen: boolean;
  isGeneratingTemplate: boolean;
  templateGenerationError: string | null;
  openAITemplateGeneratorModal: () => void;
  closeAITemplateGeneratorModal: () => void;
  handleGenerateTemplateFromPrompt: (prompt: string) => Promise<void>;

  // AI Bulk Refinement
  isBulkRefineModalOpen: boolean;
  isBulkRefining: boolean;
  bulkRefineError: string | null;
  bulkRefineProgress: number;
  openBulkRefineModal: () => void;
  closeBulkRefineModal: () => void;
  handleBulkRefine: (prompt: string) => Promise<void>;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

type FormData = Record<string, any>;

// --- DEMO DATA ---
const DEMO_VARIABLES: Variable[] = [
    { id: 'demo1', name: 'project_name', type: 'text', originalText: 'Q4 Social Media Push', itemFormat: '- {{item}}', booleanLabels: { true: 'true', false: 'false'} },
    { id: 'demo2', name: 'report_date', type: 'date', originalText: 'January 15, 2024', itemFormat: '- {{item}}', booleanLabels: { true: 'true', false: 'false'} },
    { id: 'demo3', name: 'prepared_by', type: 'text', originalText: 'Bob Williams', itemFormat: '- {{item}}', booleanLabels: { true: 'true', false: 'false'} },
    { id: 'demo4', name: 'key_accomplishments', type: 'list', originalText: '- Finalized content calendar for Instagram.\n- Ran A/B tests on Twitter ad copy.\n- Grew follower count by 5%.', itemFormat: '- {{item}}', booleanLabels: { true: 'Final', false: 'Draft'} },
    { id: 'demo5', name: 'is_final_report', type: 'boolean', originalText: 'Status: Final', itemFormat: '- {{item}}', booleanLabels: { true: 'Final', false: 'Draft'} },
];
const DEMO_TOKENS: Token[] = [
    { type: 'string', content: 'Project Update: ' },
    { type: 'variable', variableId: 'demo1', name: 'project_name', originalText: 'Q4 Social Media Push' },
    { type: 'string', content: '\nReport Date: ' },
    { type: 'variable', variableId: 'demo2', name: 'report_date', originalText: 'January 15, 2024' },
    { type: 'string', content: '\nPrepared by: ' },
    { type: 'variable', variableId: 'demo3', name: 'prepared_by', originalText: 'Bob Williams' },
    { type: 'string', content: '\nStatus: ' },
    { type: 'variable', variableId: 'demo5', name: 'is_final_report', originalText: 'Final'},
    { type: 'string', content: '\n\nKey Accomplishments:\n' },
    { type: 'variable', variableId: 'demo4', name: 'key_accomplishments', originalText: '- Finalized content calendar for Instagram.\n- Ran A/B tests on Twitter ad copy.\n- Grew follower count by 5%.' },
];
const DEMO_FORM_DATA: FormData = {
    project_name: 'Q4 Social Media Push',
    report_date: '2024-01-15',
    prepared_by: 'Bob Williams',
    key_accomplishments: [
        'Finalized content calendar for Instagram.',
        'Ran A/B tests on Twitter ad copy.',
        'Grew follower count by 5%.'
    ],
    is_final_report: true,
};
// --- END DEMO DATA ---


export const TemplateProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme') as 'light' | 'dark';
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Toast State
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const isAuthenticated = !!currentUser;
  
  const [templateTokens, setTemplateTokens] = useState<Token[]>([{ type: 'string', content: '' }]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [formData, setFormData] = useState<FormData>({});
  
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [variableToEdit, setVariableToEdit] = useState<Variable | null>(null);

  // Workspace, Persistence and Organization State
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [isMoveItemModalOpen, setIsMoveItemModalOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState<{id: string, type: 'folder' | 'template'} | null>(null);
  const [isNewWorkspaceModalOpen, setIsNewWorkspaceModalOpen] = useState(false);
  const [isTeamSettingsModalOpen, setIsTeamSettingsModalOpen] = useState(false);
  const [isDeleteWorkspaceModalOpen, setIsDeleteWorkspaceModalOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null);
  
  // Subscription State
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason | null>(null);

  // CSV State
  const [csvData, setCsvData] = useState<Record<string, any>[] | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [selectedCsvRowIndex, setSelectedCsvRowIndex] = useState(0);
  const [isCsvMappingModalOpen, setIsCsvMappingModalOpen] = useState(false);
  const [rawCsvData, setRawCsvData] = useState<{ data: Record<string, string>[], headers: string[] } | null>(null);

  // AI Suggestions State
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  
  // AI Generation State
  const [aiGenerationTarget, setAIGenerationTarget] = useState<AIGenerationTarget | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // AI Autofill State
  const [isAutofillModalOpen, setIsAutofillModalOpen] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [autofillError, setAutofillError] = useState<string | null>(null);

  // Screen Capture State
  const [isSnapping, setIsSnapping] = useState(false);

  // AI Output Refinement State
  const [refinedOutput, setRefinedOutput] = useState<{ text: string; originalText: string; } | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  // AI Template Generation State
  const [isAITemplateGeneratorModalOpen, setIsAITemplateGeneratorModalOpen] = useState(false);
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  const [templateGenerationError, setTemplateGenerationError] = useState<string | null>(null);

  // AI Bulk Refinement State
  const [isBulkRefineModalOpen, setIsBulkRefineModalOpen] = useState(false);
  const [isBulkRefining, setIsBulkRefining] = useState(false);
  const [bulkRefineError, setBulkRefineError] = useState<string | null>(null);
  const [bulkRefineProgress, setBulkRefineProgress] = useState(0);
  
  const resetToPublicState = () => {
    setTemplateTokens([{ type: 'string', content: '' }]);
    setVariables([]);
    setFormData({});
    setSavedTemplates([]);
    setFolders([]);
    setCurrentFolderId(null);
    setWorkspaces([]);
    setActiveWorkspaceId(null);
    setCurrentUser(null);
    setAuthError(null);
  }

  // --- Theme Logic ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // --- Toast Logic ---
  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // --- Auth & Data Loading with Supabase ---
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuthError(null);
      if (session?.user) {
        // Fetch user profile to get subscription plan
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

        if (profileError || !profile) {
            console.error("Error fetching user profile:", profileError);
            signOut();
            return;
        }

        const user: User = {
            id: session.user.id,
            email: session.user.email!,
            subscriptionPlan: profile.subscription_plan as SubscriptionPlan,
            stripe_customer_id: profile.stripe_customer_id,
        };
        setCurrentUser(user);
        await loadAllUserData(user.id);

      } else {
        resetToPublicState();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const loadAllUserData = async (userId: string) => {
      // 1. Get IDs of all workspaces the user is a member of
      const { data: memberEntries, error: memberError } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', userId);

      if (memberError) {
          console.error("Error fetching user's workspaces", memberError);
          showToast("Failed to load your workspaces.", "error");
          return;
      }
      
      let workspaceIds = memberEntries.map(m => m.workspace_id);
      
      // First time login check - create personal workspace if none exist
      if (workspaceIds.length === 0) {
          const { data: newWorkspace, error: creationError } = await supabase
            .from('workspaces')
            .insert([{ name: 'Personal Workspace' }])
            .select()
            .single();

          if (creationError || !newWorkspace) {
              console.error("Error creating personal workspace", creationError);
              showToast("Failed to initialize your account.", "error");
              return;
          }
          
          const { error: memberInsertError } = await supabase
            .from('workspace_members')
            .insert([{ workspace_id: newWorkspace.id, user_id: userId, role: 'Owner' }]);

          if (memberInsertError) {
              console.error("Error adding owner to new workspace", memberInsertError);
              return;
          }
          workspaceIds = [newWorkspace.id];
      }
      
      // 2. Fetch all details for those workspaces (including all members)
      const { data: workspacesData, error: workspacesError } = await supabase
        .from('workspaces')
        .select(`
            id,
            name,
            created_at,
            workspace_members (
                user_id,
                role,
                user_profiles (
                    email
                )
            )
        `)
        .in('id', workspaceIds);

      if (workspacesError) {
        console.error("Error fetching workspace details", workspacesError);
        showToast("Failed to load workspace details.", "error");
        return;
      }
      
      // Reformat the workspace data to match the frontend type
      const formattedWorkspaces: Workspace[] = workspacesData.map(w => ({
          id: w.id,
          name: w.name,
          created_at: w.created_at,
          members: w.workspace_members.map((m: any) => ({ // Use 'any' here as Supabase type generation can be tricky for nested relations
              user_id: m.user_id,
              role: m.role,
              email: m.user_profiles?.email || 'Unknown User',
          }))
      }));

      // 3. Fetch all templates and folders belonging to these workspaces
      const { data: templatesData, error: templatesError } = await supabase.from('templates').select('*').in('workspace_id', workspaceIds);
      const { data: foldersData, error: foldersError } = await supabase.from('folders').select('*').in('workspace_id', workspaceIds);
      
      if (templatesError || foldersError) {
          console.error("Error fetching templates/folders", templatesError, foldersError);
          showToast("Failed to load your templates and folders.", "error");
          return;
      }

      setWorkspaces(formattedWorkspaces);
      setSavedTemplates(templatesData as SavedTemplate[]);
      setFolders(foldersData as Folder[]);
      
      // 4. Set active workspace
      const lastActiveId = localStorage.getItem(`lastActiveWorkspace_${userId}`);
      if (lastActiveId && workspaceIds.includes(lastActiveId)) {
        setActiveWorkspaceId(lastActiveId);
      } else {
        setActiveWorkspaceId(workspaceIds[0]);
      }
  };

  const signUp = async (email: string, pass: string) => {
    const {data, error} = await supabase.auth.signUp({ email, password: pass });
    if(error) {
        setAuthError(error.message);
    } else if (data.user) {
        setAuthError(null);
        // Create a Stripe Customer via an Edge Function
        await supabase.functions.invoke('create-stripe-customer', {
            body: { userId: data.user.id, email: data.user.email },
        });
        showToast("Please check your email to verify your account.", "info");
    }
    return { error };
  };

  const signIn = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) setAuthError(error.message);
    else setAuthError(null);
    return { error };
  };

  const signOut = async () => { 
    await supabase.auth.signOut();
    // State will be reset by the onAuthStateChange listener
  };

  const forgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
    });
    if (error) setAuthError(error.message);
    else setAuthError(null);
    return { error };
  };

  const debouncedFormData = useDebounce(formData, 300);

  const templateString = useMemo(() => {
    return templateTokens.map(token => {
      if (token.type === 'string') return token.content;
      const variable = variables.find(v => v.id === token.variableId);
      return variable ? `{{${variable.name}}}` : '';
    }).join('');
  }, [templateTokens, variables]);

  const getOutputForRow = useCallback((rowData: FormData) => {
    let output = templateString;
    variables.forEach(variable => {
      const value = rowData[variable.name];
      const placeholderRegex = new RegExp(`{{\\s*${variable.name}\\s*}}`, 'g');
      
      let replacement = '';
      switch(variable.type) {
        case 'list':
          if (Array.isArray(value)) {
            const format = variable.itemFormat || '{{item}}';
            replacement = value.filter(item => typeof item === 'string' && item.trim() !== '').map(item => format.replace(/{{item}}/g, item)).join('\n');
          }
          break;
        case 'boolean':
          replacement = value ? (variable.booleanLabels?.true ?? 'true') : (variable.booleanLabels?.false ?? 'false');
          break;
        default:
          if (typeof value === 'string' || typeof value === 'number') {
            replacement = String(value);
          }
      }
      output = output.replace(placeholderRegex, replacement);
    });
    return output;
  }, [templateString, variables]);

  const outputText = useMemo(() => {
    return getOutputForRow(debouncedFormData);
  }, [getOutputForRow, debouncedFormData]);

  useEffect(() => {
    setRefinedOutput(null);
  }, [debouncedFormData]);

  const resetTemplate = (newTemplate: string) => {
    setTemplateTokens([{ type: 'string', content: newTemplate }]);
    setVariables([]);
    setFormData({});
    setSelection(null);
    clearCsvData();
  }

  const handleTextSelect = useCallback((newSelection: Selection) => {
    if (newSelection.text.trim().length > 0 && !newSelection.text.includes('{{')) {
      setSelection(newSelection);
    } else {
      setSelection(null);
    }
  }, []);

  const openModal = useCallback(() => {
    if (selection) {
      setVariableToEdit(null);
      setIsModalOpen(true);
    }
  }, [selection]);

  const openModalForEdit = (variableId: string) => {
    const variable = variables.find(v => v.id === variableId);
    if(variable) {
      setSelection(null);
      setVariableToEdit(variable);
      setIsModalOpen(true);
    }
  }

  const closeModal = () => {
    setIsModalOpen(false);
    setVariableToEdit(null);
  };

  const getInitialValueForType = (type: VariableType, value?: any) => {
    switch(type) {
      case 'list': return Array.isArray(value) ? value : (typeof value === 'string' ? value.split('\n') : []);
      case 'boolean': 
        const truthy = ['true', '1', 'yes', 't', 'y'];
        return typeof value === 'boolean' ? value : truthy.includes(String(value).toLowerCase());
      case 'number': return value || '';
      default: return value || '';
    }
  }

  const handleCreateVariable = (data: Omit<Variable, 'id' | 'originalText'>) => {
    if (!selection) return;
    
    const newVariable: Variable = { ...data, id: generateId(), originalText: selection.text };
    
    setTemplateTokens(currentTokens => {
        const newTokens: Token[] = [];
        let found = false;
        currentTokens.forEach(token => {
            if (token.type === 'string' && !found) {
                const startIdx = token.content.indexOf(selection.text);
                if (startIdx !== -1) {
                    found = true;
                    const endIdx = startIdx + selection.text.length;
                    const before = token.content.substring(0, startIdx);
                    const after = token.content.substring(endIdx);

                    if(before) newTokens.push({ type: 'string', content: before });
                    newTokens.push({ type: 'variable', variableId: newVariable.id, name: newVariable.name, originalText: newVariable.originalText });
                    if(after) newTokens.push({ type: 'string', content: after });
                } else {
                    newTokens.push(token);
                }
            } else {
                newTokens.push(token);
            }
        });
        return newTokens;
    });
      
    setVariables(prev => [...prev, newVariable]);
    setFormData(prev => ({ ...prev, [newVariable.name]: getInitialValueForType(newVariable.type) }));
    setSelection(null);
    closeModal();
  };

  const handleUpdateVariable = (id: string, data: Partial<Omit<Variable, 'id' | 'originalText'>>) => {
    let oldName = '';
    let typeChanged = false;

    setVariables(vars => vars.map(v => {
      if (v.id === id) {
        oldName = v.name;
        typeChanged = v.type !== data.type;
        return { ...v, ...data, name: data.name || v.name, type: data.type || v.type };
      }
      return v;
    }));
    
    setFormData(currentData => {
      const newData = { ...currentData };
      const newName = data.name || oldName;
      if (oldName && oldName !== newName) {
        newData[newName] = currentData[oldName];
        delete newData[oldName];
      }
      if (typeChanged && data.type) {
        newData[newName] = getInitialValueForType(data.type);
      }
      return newData;
    });
    
    closeModal();
  }
  
  const handleDeleteVariable = (variableId: string) => {
    const variableToDelete = variables.find(v => v.id === variableId);
    if (!variableToDelete) return;

    setTemplateTokens(currentTokens => 
        currentTokens.map((token): Token => 
            (token.type === 'variable' && token.variableId === variableId)
                ? { type: 'string', content: token.originalText }
                : token
        ).reduce((acc, token) => {
            const lastToken = acc[acc.length - 1];
            if (lastToken && lastToken.type === 'string' && token.type === 'string') {
                lastToken.content += token.content;
            } else {
                acc.push(token);
            }
            return acc;
        }, [] as Token[])
    );

    setVariables(vars => vars.filter(v => v.id !== variableId));
    setFormData(data => {
      const newData = { ...data };
      delete newData[variableToDelete.name];
      return data;
    });
    clearCsvData();
  };

  const handleFormChange = (variableName: string, value: any) => {
    if (csvData) {
      updateCsvRowData(selectedCsvRowIndex, variableName, value);
    } else {
      setFormData(prev => ({ ...prev, [variableName]: value }));
    }
  };

  // --- Subscription Logic ---
  const openSubscriptionModal = () => setIsSubscriptionModalOpen(true);
  const closeSubscriptionModal = () => setIsSubscriptionModalOpen(false);
  
  const openUpgradeModal = (reason: UpgradeReason) => {
    setUpgradeReason(reason);
    setIsUpgradeModalOpen(true);
  };
  const closeUpgradeModal = () => setIsUpgradeModalOpen(false);
  
  const redirectToCheckout = async (plan: SubscriptionPlan) => {
      if (!currentUser) return;
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { plan }
      });

      if (error) {
          showToast('Error redirecting to checkout.', 'error');
          console.error(error);
          return;
      }

      if (data.url) {
          window.location.href = data.url;
      }
  };

  // --- Workspace & Team Logic ---
  const switchWorkspace = (workspaceId: string) => {
    if (!currentUser) return;
    setActiveWorkspaceId(workspaceId);
    localStorage.setItem(`lastActiveWorkspace_${currentUser.id}`, workspaceId);
    setCurrentFolderId(null); // Reset to root of new workspace
  };

  const createWorkspace = async (name: string) => {
    if (!currentUser) return;
    const userWorkspaces = workspaces.filter(w => w.members.some(m => m.user_id === currentUser.id));
    const limit = PLAN_LIMITS[currentUser.subscriptionPlan].workspaces;
    if (userWorkspaces.length >= limit) {
      openUpgradeModal('workspace_limit');
      return;
    }

    const { data: newWorkspace, error } = await supabase.from('workspaces').insert([{ name }]).select().single();
    if (error || !newWorkspace) {
      showToast('Failed to create workspace.', 'error');
    } else {
      const { error: memberError } = await supabase.from('workspace_members').insert([{ workspace_id: newWorkspace.id, user_id: currentUser.id, role: 'Owner' }]);
      if (memberError) {
        showToast('Failed to set workspace owner.', 'error');
        // Attempt to clean up
        await supabase.from('workspaces').delete().eq('id', newWorkspace.id);
      } else {
        // Manually re-fetch all user data to get the new workspace with all members populated correctly
        await loadAllUserData(currentUser.id);
        switchWorkspace(newWorkspace.id);
        showToast(`Workspace "${name}" created!`, 'success');
        closeNewWorkspaceModal();
      }
    }
  };
  
  const openNewWorkspaceModal = () => setIsNewWorkspaceModalOpen(true);
  const closeNewWorkspaceModal = () => setIsNewWorkspaceModalOpen(false);

  const openTeamSettingsModal = () => setIsTeamSettingsModalOpen(true);
  const closeTeamSettingsModal = () => setIsTeamSettingsModalOpen(false);

  const inviteUserToWorkspace = async (workspaceId: string, email: string): Promise<{success: boolean, error?: string}> => {
    if(!currentUser || currentUser.subscriptionPlan !== 'Team') {
        openUpgradeModal('team_feature');
        return { success: false, error: 'Upgrade to the Team plan to invite members.' };
    }
    
    // In a real app, this would be a call to a Supabase Edge Function to avoid exposing user emails.
    // This is a simplified, less secure version for demonstration.
    const { data: invitedUser, error: userError } = await supabase.from('user_profiles').select('user_id').eq('email', email).single();
    
    if (userError || !invitedUser) {
        return { success: false, error: "User with this email does not exist." };
    }

    const { error: insertError } = await supabase.from('workspace_members').insert([{ workspace_id: workspaceId, user_id: invitedUser.user_id, role: 'Editor' }]);
    
    if (insertError) {
        if(insertError.code === '23505') { // unique constraint violation
            return { success: false, error: 'This user is already a member of the workspace.'};
        }
        return { success: false, error: "Failed to invite user." };
    }
    
    await loadAllUserData(currentUser.id); // Re-fetch to update members list
    return { success: true };
  };

  const removeUserFromWorkspace = async (workspaceId: string, userId: string) => {
    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);
    if (error) {
        showToast('Failed to remove member.', 'error');
    } else {
        showToast('Member removed.', 'success');
        setWorkspaces(prev => prev.map(w => w.id === workspaceId ? {
            ...w,
            members: w.members.filter(m => m.user_id !== userId)
        } : w));
    }
  };
  
  const changeUserRole = async (workspaceId: string, userId: string, role: WorkspaceMemberRole) => {
    const { error } = await supabase
      .from('workspace_members')
      .update({ role })
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);

    if (error) {
        showToast("Failed to change role.", 'error');
    } else {
        showToast("Role updated.", 'success');
        setWorkspaces(prev => prev.map(w => w.id === workspaceId ? {
            ...w,
            members: w.members.map(m => m.user_id === userId ? { ...m, role } : m)
        } : w));
    }
  };
  
  const deleteWorkspace = async (workspaceId: string) => {
    const { error } = await supabase.from('workspaces').delete().eq('id', workspaceId);
    if (error) {
        showToast('Failed to delete workspace.', 'error');
    } else {
        showToast('Workspace deleted.', 'success');
        const newWorkspaces = workspaces.filter(w => w.id !== workspaceId);
        setWorkspaces(newWorkspaces);
        if (activeWorkspaceId === workspaceId) {
            const nextWorkspace = newWorkspaces[0] || null;
            setActiveWorkspaceId(nextWorkspace?.id || null);
            if (currentUser && nextWorkspace) {
                localStorage.setItem(`lastActiveWorkspace_${currentUser.id}`, nextWorkspace.id);
            } else if (currentUser) {
                localStorage.removeItem(`lastActiveWorkspace_${currentUser.id}`);
            }
        }
        closeDeleteWorkspaceModal();
    }
  };

  const openDeleteWorkspaceModal = (workspace: Workspace) => {
    setWorkspaceToDelete(workspace);
    setIsDeleteWorkspaceModalOpen(true);
  };

  const closeDeleteWorkspaceModal = () => {
    setWorkspaceToDelete(null);
    setIsDeleteWorkspaceModalOpen(false);
  };

  // --- Template Persistence & Organization Logic ---
  const saveTemplate = async (name: string, folder_id: string | null) => {
    if (!currentUser || !activeWorkspaceId) return;
    
    const limit = PLAN_LIMITS[currentUser.subscriptionPlan].templates;
    const currentWorkspaceTemplates = savedTemplates.filter(t => t.workspace_id === activeWorkspaceId);

    if (currentWorkspaceTemplates.length >= limit) {
      openUpgradeModal('template_limit');
      return;
    }

    const newTemplate = {
      name,
      folder_id,
      workspace_id: activeWorkspaceId,
      tokens: templateTokens,
      variables: variables,
    };

    const { data, error } = await supabase.from('templates').insert([newTemplate]).select().single();

    if (error) {
        showToast('Failed to save template.', 'error');
    } else {
        setSavedTemplates(prev => [...prev, data as SavedTemplate]);
        showToast(`Template "${name}" saved!`, 'success');
    }
  };

  const loadTemplate = (template: SavedTemplate) => {
    setTemplateTokens(template.tokens as Token[]);
    setVariables(template.variables as Variable[]);
    const newFormData: FormData = {};
    (template.variables as Variable[]).forEach(v => {
      newFormData[v.name] = getInitialValueForType(v.type);
    });
    setFormData(newFormData);
    clearCsvData();
    showToast(`Loaded template "${template.name}"`, 'info');
  };
  
  const loadDemo = () => {
    setTemplateTokens(DEMO_TOKENS);
    setVariables(DEMO_VARIABLES);
    setFormData(DEMO_FORM_DATA);
    clearCsvData();
    showToast('Demo loaded!', 'success');
  };

  const deleteTemplate = async (templateId: string) => {
    const template = savedTemplates.find(t => t.id === templateId);
    const { error } = await supabase.from('templates').delete().eq('id', templateId);
    if (error) {
        showToast('Failed to delete template.', 'error');
    } else {
        setSavedTemplates(prev => prev.filter(t => t.id !== templateId));
        if (template) showToast(`Template "${template.name}" deleted.`, 'info');
    }
  };

  const createFolder = async (name: string, parent_id: string | null) => {
      if (!activeWorkspaceId) return;
      const newFolder = { name, parent_id, workspace_id: activeWorkspaceId };
      const { data, error } = await supabase.from('folders').insert([newFolder]).select().single();
      if (error) {
          showToast('Failed to create folder.', 'error');
      } else {
          setFolders(prev => [...prev, data as Folder]);
          showToast(`Folder "${name}" created.`, 'success');
      }
  };

  const deleteFolder = async (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    // Note: RLS and ON DELETE CASCADE in the DB handle the logic.
    // The frontend just needs to send the delete command for the top-level folder.
    const { error } = await supabase.from('folders').delete().eq('id', folderId);
    if (error) {
        showToast('Failed to delete folder.', 'error');
    } else {
        // Optimistically update UI
        let foldersToDelete = new Set<string>([folderId]);
        let queue = [folderId];
        while(queue.length > 0) {
            const currentId = queue.shift()!;
            const children = folders.filter(f => f.parent_id === currentId);
            children.forEach(c => {
                foldersToDelete.add(c.id);
                queue.push(c.id);
            });
        }
        setFolders(prev => prev.filter(f => !foldersToDelete.has(f.id)));
        setSavedTemplates(prev => prev.filter(t => t.folder_id && !foldersToDelete.has(t.folder_id)));
        if(folder) showToast(`Folder "${folder.name}" deleted.`, 'info');
        if (currentFolderId === folderId) setCurrentFolderId(folder?.parent_id || null);
    }
  };

  const renameItem = async (id: string, type: 'folder' | 'template', newName: string) => {
      const response = type === 'folder'
          ? await supabase.from('folders').update({ name: newName }).eq('id', id)
          : await supabase.from('templates').update({ name: newName }).eq('id', id);

      const { error } = response;
      if (error) {
          showToast('Failed to rename.', 'error');
      } else {
          const updater = (items: any[]) => items.map(item => item.id === id ? {...item, name: newName} : item);
          if (type === 'folder') setFolders(updater); else setSavedTemplates(updater);
          showToast(`Renamed to "${newName}".`, 'success');
      }
  }

  const moveItem = async (itemId: string, itemType: 'folder' | 'template', newParentId: string | null) => {
      const response = itemType === 'folder'
        ? await supabase.from('folders').update({ parent_id: newParentId }).eq('id', itemId)
        : await supabase.from('templates').update({ folder_id: newParentId }).eq('id', itemId);
      
      const { error } = response;
      if (error) {
          showToast('Failed to move item.', 'error');
      } else {
          const column = itemType === 'folder' ? 'parent_id' : 'folder_id';
          const updater = (items: any[]) => items.map(item => item.id === itemId ? {...item, [column]: newParentId} : item);
          if (itemType === 'folder') setFolders(updater); else setSavedTemplates(updater);
          showToast('Item moved successfully.', 'success');
      }
  }

  const openNewFolderModal = () => setIsNewFolderModalOpen(true);
  const closeNewFolderModal = () => setIsNewFolderModalOpen(false);
  const openMoveItemModal = (id: string, type: 'folder' | 'template') => {
      setItemToMove({id, type});
      setIsMoveItemModalOpen(true);
  }
  const closeMoveItemModal = () => {
      setItemToMove(null);
      setIsMoveItemModalOpen(false);
  }

  // --- CSV Logic ---
  const importCsv = (file: File) => {
    if (!file) return;
    setCsvError(null);
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            if (results.errors.length) {
                setCsvError(results.errors[0].message);
                return;
            }
            const headers = results.meta.fields || [];
            const data = results.data as Record<string, string>[];
            setRawCsvData({ data, headers });
            setIsCsvMappingModalOpen(true);
        },
        error: (error) => {
          setCsvError(error.message);
        }
    });
  };

  const applyCsvMapping = (mapping: Record<string, string>) => {
    if (!rawCsvData) return;

    const mappedData = rawCsvData.data.map(row => {
        const newRow: Record<string, any> = {};
        for (const varName in mapping) {
            const csvHeader = mapping[varName];
            const variable = variables.find(v => v.name === varName);
            if (variable) {
                newRow[varName] = getInitialValueForType(variable.type, row[csvHeader]);
            }
        }
        return newRow;
    });

    setCsvData(mappedData);
    setCsvHeaders(Object.values(mapping));
    setSelectedCsvRowIndex(0);
    closeCsvMappingModal();
    showToast(`${rawCsvData.data.length} rows imported successfully.`, 'success');
  };

  const closeCsvMappingModal = () => {
    setIsCsvMappingModalOpen(false);
    setRawCsvData(null);
  };


  const clearCsvData = () => {
      setCsvData(null);
      setCsvHeaders([]);
      setCsvError(null);
      setSelectedCsvRowIndex(0);
      setRawCsvData(null);
      setIsCsvMappingModalOpen(false);
      const newFormData: FormData = {};
      variables.forEach(v => {
        newFormData[v.name] = getInitialValueForType(v.type);
      });
      setFormData(newFormData);
  };

  const selectCsvRow = (newIndex: number) => {
    if (csvData && newIndex >= 0 && newIndex < csvData.length) {
      setSelectedCsvRowIndex(newIndex);
    }
  };

  const updateCsvRowData = (rowIndex: number, variableName: string, value: any) => {
    if (!csvData) return;
    const newCsvData = [...csvData];
    const newRow = { ...newCsvData[rowIndex], [variableName]: value };
    newCsvData[rowIndex] = newRow;
    setCsvData(newCsvData);
  };
  
  useEffect(() => {
    if (csvData && csvData.length > 0 && selectedCsvRowIndex < csvData.length) {
      const currentRow = csvData[selectedCsvRowIndex];
      setFormData(currentRow);
    }
  }, [csvData, selectedCsvRowIndex]);

  const generateAndDownloadZip = async () => {
    if (!csvData) return;
    const zip = new JSZip();

    for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        const rowOutput = getOutputForRow(row);
        zip.file(`output_row_${i + 1}.txt`, rowOutput);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = 'format-weaver-outputs.zip';
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('ZIP file download started.', 'success');
  };

  const copyAllOutputsToClipboard = () => {
    if (!csvData) return;
    const allOutputs = csvData.map(row => getOutputForRow(row)).join('\n\n---\n\n');
    navigator.clipboard.writeText(allOutputs);
    showToast('All outputs copied to clipboard!', 'success');
  };

  const exportOutputsToCsv = () => {
    if (!csvData) return;
    const dataToExport = csvData.map(row => ({
        ...row,
        weaved_output: getOutputForRow(row),
    }));

    const csvString = Papa.unparse(dataToExport);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'format-weaver-export.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('CSV export started.', 'success');
  };

  // --- AI Logic (Via Supabase Edge Functions) ---

  const handleSuggestVariables = async () => {
    setIsSuggesting(true);
    setSuggestionError(null);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-variables', {
        body: { templateString },
      });
      if (error) throw error;

      const suggestions: AISuggestion[] = data;
      setAiSuggestions(suggestions.filter(s => templateString.includes(s.originalText)));
    } catch (e: any) {
      console.error("Error invoking suggest-variables function:", e);
      setSuggestionError("Failed to get suggestions from the AI.");
    } finally {
      setIsSuggesting(false);
      setIsSuggestionModalOpen(true);
    }
  };

  const processImageAndSuggest = async (imageData: string) => {
    // This feature would require a more complex Edge Function that can handle file uploads.
    // For now, it remains a placeholder.
    showToast("Screen capture requires a more advanced backend function.", 'info');
    cancelSnapping();
  };

  const handleGenerateTemplateFromPrompt = async (prompt: string) => {
    setIsGeneratingTemplate(true);
    setTemplateGenerationError(null);
    try {
      const { data: aiResponse, error } = await supabase.functions.invoke('generate-template', {
          body: { prompt },
      });
      if (error) throw error;

      if (!aiResponse.templateString || !Array.isArray(aiResponse.variables)) {
        throw new Error("AI response did not match the required format.");
      }

      clearCsvData();

      const newVariables: Variable[] = aiResponse.variables.map((v: any) => ({
        id: generateId(),
        name: v.name,
        type: v.type,
        originalText: v.originalText,
        itemFormat: v.type === 'list' ? '- {{item}}' : undefined,
        booleanLabels: v.type === 'boolean' ? { true: 'Yes', false: 'No' } : undefined,
      }));
      setVariables(newVariables);

      const newTokens: Token[] = [];
      const regex = /{{\s*(\w+)\s*}}/g;
      let lastIndex = 0;
      let matchResult;
      while ((matchResult = regex.exec(aiResponse.templateString)) !== null) {
        if (matchResult.index > lastIndex) {
          newTokens.push({ type: 'string', content: aiResponse.templateString.substring(lastIndex, matchResult.index) });
        }
        const variableName = matchResult[1];
        const variable = newVariables.find(v => v.name === variableName);
        if (variable) {
          newTokens.push({ type: 'variable', variableId: variable.id, name: variable.name, originalText: variable.originalText });
        } else {
          newTokens.push({ type: 'string', content: matchResult[0] });
        }
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < aiResponse.templateString.length) {
        newTokens.push({ type: 'string', content: aiResponse.templateString.substring(lastIndex) });
      }
      setTemplateTokens(newTokens);

      const newFormData: FormData = {};
      newVariables.forEach(v => {
        newFormData[v.name] = getInitialValueForType(v.type);
      });
      setFormData(newFormData);

      closeAITemplateGeneratorModal();
      showToast('Template generated by AI!', 'success');
    } catch (e: any) {
      setTemplateGenerationError("Failed to generate template. The AI returned an unexpected format.");
    } finally {
      setIsGeneratingTemplate(false);
    }
  };
  
  const closeSuggestionModal = () => {
    setIsSuggestionModalOpen(false);
    setAiSuggestions([]);
    setSuggestionError(null);
  };
  
  const createVariablesFromSuggestions = (suggestions: AISuggestion[]) => {
    if (suggestions.length === 0) {
      closeSuggestionModal();
      return;
    }

    let tempTemplateString = templateString;
    const newVariables: Variable[] = [];
    const newFormData: FormData = {};

    suggestions.forEach((suggestion) => {
      const newVar: Variable = {
        ...suggestion,
        id: generateId()
      };
      newVariables.push(newVar);
      newFormData[newVar.name] = getInitialValueForType(newVar.type);
      tempTemplateString = tempTemplateString.replace(suggestion.originalText, `__VAR_${newVar.id}__`);
    });

    const newTokens: Token[] = [];
    let remainingString = tempTemplateString;

    newVariables.forEach(v => {
      const placeholder = `__VAR_${v.id}__`;
      const parts = remainingString.split(placeholder);
      if (parts[0]) {
        newTokens.push({ type: 'string', content: parts[0] });
      }
      newTokens.push({ type: 'variable', variableId: v.id, name: v.name, originalText: v.originalText });
      remainingString = parts.slice(1).join(placeholder);
    });

    if (remainingString) {
      newTokens.push({ type: 'string', content: remainingString });
    }

    setTemplateTokens(newTokens);
    setVariables(prev => [...prev, ...newVariables]);
    setFormData(prev => ({ ...prev, ...newFormData }));
    closeSuggestionModal();
    showToast(`${suggestions.length} variables created!`, 'success');
  };

  const openAIGenerationModal = (target: AIGenerationTarget) => {
    setAIGenerationTarget(target);
    setGenerationError(null);
  }

  const closeAIGenerationModal = () => {
    setAIGenerationTarget(null);
    setGenerationError(null);
  }

  const handleGenerateAIContent = async (prompt: string) => {
    if (!aiGenerationTarget) return;
    
    setIsGeneratingContent(true);
    setGenerationError(null);
    try {
      const { data: generatedText, error } = await supabase.functions.invoke('generate-content', {
        body: { prompt },
      });
      if (error) throw error;
      
      if (aiGenerationTarget.type === 'list') {
        const listItems = generatedText.split('\n').map((item: string) => item.replace(/^-|^\*|^\d+\.\s*/, '').trim()).filter(Boolean);
        handleFormChange(aiGenerationTarget.name, listItems);
      } else {
        handleFormChange(aiGenerationTarget.name, generatedText);
      }
      closeAIGenerationModal();
    } catch (e) {
      setGenerationError("Failed to generate content.");
    } finally {
      setIsGeneratingContent(false);
    }
  }
  
  const openAutofillModal = () => setIsAutofillModalOpen(true);
  const closeAutofillModal = () => {
    setIsAutofillModalOpen(false);
    setAutofillError(null);
  }

  const handleAutofill = async (prompt: string) => {
    setIsAutofilling(true);
    setAutofillError(null);
    try {
      const schema = variables.map(v => ({ name: v.name, type: v.type, description: `Example: "${v.originalText.substring(0, 50).replace(/\n/g, ' ')}..."`}));
      
      const { data: aiFormData, error } = await supabase.functions.invoke('autofill-form', {
        body: { prompt, schema },
      });
      if (error) throw error;
      
      setFormData(prev => ({ ...prev, ...aiFormData }));
      closeAutofillModal();
      showToast('Form autofilled!', 'success');
    } catch (e) {
      setAutofillError("Failed to autofill the form. The AI returned an unexpected format.");
    } finally {
      setIsAutofilling(false);
    }
  }

  const startSnapping = () => setIsSnapping(true);
  const cancelSnapping = () => setIsSnapping(false);

  const refineOutput = async (tone: string) => {
    const textToRefine = refinedOutput?.text ?? outputText;
    if (!textToRefine.trim()) return;
    
    setIsRefining(true);
    setRefineError(null);
    try {
      const { data: refinedText, error } = await supabase.functions.invoke('refine-text', {
        body: { textToRefine, tone },
      });
      if (error) throw error;
      
      setRefinedOutput({ text: refinedText, originalText: textToRefine });
    } catch (e) {
      setRefineError("Failed to refine text.");
    } finally {
      setIsRefining(false);
    }
  }

  const revertRefinement = () => {
    setRefinedOutput(null);
    setRefineError(null);
  };
  
  const openAITemplateGeneratorModal = () => setIsAITemplateGeneratorModalOpen(true);
  const closeAITemplateGeneratorModal = () => {
    setIsAITemplateGeneratorModalOpen(false);
    setTemplateGenerationError(null);
  }
  
  const openBulkRefineModal = () => setIsBulkRefineModalOpen(true);
  const closeBulkRefineModal = () => {
    setIsBulkRefineModalOpen(false);
    setBulkRefineError(null);
    setBulkRefineProgress(0);
  };
  
  const handleBulkRefine = async (tone: string) => {
    // This is complex due to potential timeouts. A better architecture would use a queue system.
    // For now, we'll show a message indicating this limitation.
    showToast("Bulk Refinement is a complex operation and is not yet implemented in this version.", 'info');
  };


  return (
    <TemplateContext.Provider value={{
      theme,
      toggleTheme,
      toasts,
      showToast,
      removeToast,
      isAuthenticated,
      currentUser,
      authError,
      signUp,
      signIn,
      signOut,
      forgotPassword,
      isSubscriptionModalOpen,
      openSubscriptionModal,
      closeSubscriptionModal,
      isUpgradeModalOpen,
      openUpgradeModal,
      closeUpgradeModal,
      upgradeReason,
      redirectToCheckout,
      workspaces,
      activeWorkspaceId,
      switchWorkspace,
      createWorkspace,
      deleteWorkspace,
      isNewWorkspaceModalOpen,
      openNewWorkspaceModal,
      closeNewWorkspaceModal,
      isTeamSettingsModalOpen,
      openTeamSettingsModal,
      closeTeamSettingsModal,
      inviteUserToWorkspace,
      removeUserFromWorkspace,
      changeUserRole,
      isDeleteWorkspaceModalOpen,
      workspaceToDelete,
      openDeleteWorkspaceModal,
      closeDeleteWorkspaceModal,
      templateTokens,
      variables,
      formData,
      outputText,
      selection,
      isModalOpen,
      variableToEdit,
      templateString,
      resetTemplate,
      handleTextSelect,
      openModal,
      openModalForEdit,
      closeModal,
      handleCreateVariable,
      handleUpdateVariable,
      handleDeleteVariable,
      handleFormChange,
      savedTemplates,
      folders,
      currentFolderId,
      setCurrentFolderId,
      saveTemplate,
      loadTemplate,
      deleteTemplate,
      loadDemo,
      createFolder,
      deleteFolder,
      renameItem,
      isNewFolderModalOpen,
      openNewFolderModal,
      closeNewFolderModal,
      isMoveItemModalOpen,
      itemToMove,
      openMoveItemModal,
      closeMoveItemModal,
      moveItem,
      csvData,
      csvHeaders,
      csvError,
      selectedCsvRowIndex,
      importCsv,
      clearCsvData,
      selectCsvRow,
      updateCsvRowData,
      getOutputForRow,
      generateAndDownloadZip,
      copyAllOutputsToClipboard,
      exportOutputsToCsv,
      isCsvMappingModalOpen,
      rawCsvData,
      applyCsvMapping,
      closeCsvMappingModal,
      isSuggesting,
      isSuggestionModalOpen,
      aiSuggestions,
      suggestionError,
      handleSuggestVariables,
      closeSuggestionModal,
      createVariablesFromSuggestions,
      aiGenerationTarget,
      isGeneratingContent,
      generationError,
      openAIGenerationModal,
      closeAIGenerationModal,
      handleGenerateAIContent,
      isAutofillModalOpen,
      isAutofilling,
      autofillError,
      openAutofillModal,
      closeAutofillModal,
      handleAutofill,
      isSnapping,
      startSnapping,
      cancelSnapping,
      processImageAndSuggest,
      refinedOutput,
      isRefining,
      refineError,
      refineOutput,
      revertRefinement,
      isAITemplateGeneratorModalOpen,
      isGeneratingTemplate,
      templateGenerationError,
      openAITemplateGeneratorModal,
      closeAITemplateGeneratorModal,
      handleGenerateTemplateFromPrompt,
      isBulkRefineModalOpen,
      isBulkRefining,
      bulkRefineError,
      bulkRefineProgress,
      openBulkRefineModal,
      closeBulkRefineModal,
      handleBulkRefine,
    }}>
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplate = (): TemplateContextType => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
};