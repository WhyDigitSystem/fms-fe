import { useState } from 'react';
import BranchMasterList from './BranchList';
import BranchMasterForm from './BranchMasterForm';

const BranchMaster = () => {
    const [currentView, setCurrentView] = useState('list'); // 'list' or 'form'
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleAddNew = () => {
        setSelectedBranch(null);
        setCurrentView('form');
    };

    const handleEdit = (branch) => {
        setSelectedBranch(branch);
        setCurrentView('form');
    };

    const handleBack = () => {
        setCurrentView('list');
        setSelectedBranch(null);
    };

    const handleSaveSuccess = (action) => {
        // Trigger refresh of the list
        setRefreshTrigger(prev => prev + 1);
        console.log(`Branch ${action} successfully`);
    };

    return (
        <div>
            {currentView === 'list' ? (
                <BranchMasterList
                    onAddNew={handleAddNew}
                    onEdit={handleEdit}
                    refreshTrigger={refreshTrigger}
                />
            ) : (
                <BranchMasterForm
                    editData={selectedBranch}
                    onBack={handleBack}
                    onSaveSuccess={handleSaveSuccess}
                />
            )}
        </div>
    );
};

export default BranchMaster;