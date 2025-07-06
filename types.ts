export type VariableType = 'text' | 'list' | 'date' | 'number' | 'boolean';

export interface Variable {
  id: string;
  name: string;
  type: VariableType;
  originalText: string;
  itemFormat?: string; // For list type
  booleanLabels?: { // For boolean type
    true: string;
    false: string;
  };
}

export interface Selection {
  text: string;
  start: number;
  end: number;
}

export type Token = 
  | { type: 'string'; content: string }
  | { type: 'variable'; variableId: string; name: string; originalText: string };

export type WorkspaceMemberRole = 'Owner' | 'Editor';

export interface WorkspaceMember {
  user_id: string; // From Supabase auth
  email: string; // For display
  role: WorkspaceMemberRole;
}

export interface Workspace {
  id: string;
  name: string;
  members: WorkspaceMember[];
  created_at: string;
}

export interface SavedTemplate {
  id: string;
  name: string;
  workspace_id: string;
  folder_id: string | null;
  tokens: Token[];
  variables: Variable[];
  created_at: string;
}

export interface Folder {
    id: string;
    name: string;
    workspace_id: string;
    parent_id: string | null;
    created_at: string;
}

export interface AISuggestion {
  name: string;
  type: VariableType;
  originalText: string;
}

export interface AIGenerationTarget {
  name: string;
  type: 'text' | 'list';
}

export type SubscriptionPlan = 'Free' | 'Pro' | 'Team';

export interface User {
  id: string; // Supabase user ID
  email: string;
  subscriptionPlan: SubscriptionPlan;
  stripe_customer_id: string | null;
}

export type UpgradeReason = 'template_limit' | 'workspace_limit' | 'team_feature';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}