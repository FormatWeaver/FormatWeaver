import React, { useState } from 'react';
import Header from './components/Header';
import TemplateEditor from './components/TemplateEditor';
import DataEntryForm from './components/DataEntryForm';
import OutputDisplay from './components/OutputDisplay';
import VariableModal from './components/VariableModal';
import { TemplateProvider, useTemplate } from './context/TemplateContext';
import SavedTemplatesManager from './components/SavedTemplatesManager';
import SuggestionModal from './components/SuggestionModal';
import AIGenerationModal from './components/AIGenerationModal';
import CaptureOverlay from './components/CaptureOverlay';
import AIAutofillModal from './components/AIAutofillModal';
import SignInModal from './components/SignInModal';
import SignUpModal from './components/SignUpModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import AITemplateGeneratorModal from './components/AITemplateGeneratorModal';
import CsvMappingModal from './components/CsvMappingModal';
import BulkRefineModal from './components/BulkRefineModal';
import NewFolderModal from './components/NewFolderModal';
import MoveItemModal from './components/MoveItemModal';
import NewWorkspaceModal from './components/NewWorkspaceModal';
import TeamSettingsModal from './components/TeamSettingsModal';
import DeleteWorkspaceModal from './components/DeleteWorkspaceModal';
import SubscriptionModal from './components/SubscriptionModal';
import UpgradeModal from './components/UpgradeModal';
import LandingPage from './components/LandingPage';
import ToastContainer from './components/ToastContainer';


type AuthModalType = 'signIn' | 'signUp' | 'forgotPassword';

const AppContent: React.FC = () => {
  const { 
    isModalOpen, 
    isSuggestionModalOpen, 
    aiGenerationTarget, 
    isSnapping, 
    isAutofillModalOpen, 
    isAITemplateGeneratorModalOpen, 
    isCsvMappingModalOpen, 
    isBulkRefineModalOpen,
    isNewFolderModalOpen,
    isMoveItemModalOpen,
    itemToMove,
    isNewWorkspaceModalOpen,
    isTeamSettingsModalOpen,
    isDeleteWorkspaceModalOpen,
    workspaceToDelete,
    isSubscriptionModalOpen,
    isUpgradeModalOpen,
    upgradeReason,
    isAuthenticated,
  } = useTemplate();
  
  const [authModal, setAuthModal] = useState<AuthModalType | null>(null);

  const openAuthModal = (type: AuthModalType) => {
    setAuthModal(type);
  }
  const closeAuthModal = () => setAuthModal(null);

  const switchTo = (type: AuthModalType) => {
    setAuthModal(type);
  }

  if (!isAuthenticated) {
    return (
      <>
        <LandingPage openAuthModal={openAuthModal} />
        {authModal === 'signIn' && <SignInModal closeModal={closeAuthModal} openSignUp={() => switchTo('signUp')} openForgotPassword={() => switchTo('forgotPassword')} />}
        {authModal === 'signUp' && <SignUpModal closeModal={closeAuthModal} openSignIn={() => switchTo('signIn')} />}
        {authModal === 'forgotPassword' && <ForgotPasswordModal closeModal={closeAuthModal} openSignIn={() => switchTo('signIn')} />}
      </>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      <ToastContainer />
      <Header openAuthModal={openAuthModal} />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="flex flex-col gap-8">
            <SavedTemplatesManager openAuthModal={openAuthModal} />
            <TemplateEditor />
            <DataEntryForm />
          </div>

          {/* Right Column */}
          <OutputDisplay />
        </div>
      </main>
      {isModalOpen && <VariableModal />}
      {isSuggestionModalOpen && <SuggestionModal />}
      {aiGenerationTarget && <AIGenerationModal />}
      {isAutofillModalOpen && <AIAutofillModal />}
      {isAITemplateGeneratorModalOpen && <AITemplateGeneratorModal />}
      {isCsvMappingModalOpen && <CsvMappingModal />}
      {isBulkRefineModalOpen && <BulkRefineModal />}
      {isTeamSettingsModalOpen && <TeamSettingsModal />}
      {isSubscriptionModalOpen && <SubscriptionModal />}
      {isUpgradeModalOpen && upgradeReason && <UpgradeModal reason={upgradeReason} />}
      {isSnapping && <CaptureOverlay />}
      {isNewFolderModalOpen && <NewFolderModal />}
      {isMoveItemModalOpen && itemToMove && <MoveItemModal item={itemToMove} />}
      {isNewWorkspaceModalOpen && <NewWorkspaceModal />}
      {isDeleteWorkspaceModalOpen && workspaceToDelete && <DeleteWorkspaceModal workspace={workspaceToDelete} />}
    </div>
  );
};


const App: React.FC = () => {
  return (
    <TemplateProvider>
      <AppContent />
    </TemplateProvider>
  );
};

export default App;