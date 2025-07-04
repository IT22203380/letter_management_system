
import React, { useState, useEffect } from 'react';
import { Letter } from '../types/letter';
import { useTranslation } from 'react-i18next';
import LetterManagementDialog from '../components/ui/dialogs/LetterManagementDialog';
import LetterViewDialog from '../components/ui/dialogs/LetterViewDialog';
import LetterEditDialog from '../components/ui/dialogs/LetterEditDialog';
import { toast } from 'react-toastify';
//import axios from 'axios'; // Import axios
import { getLetterCounts, getLetters, deleteLetter, updateLetter } from '../services/letterService';

const DataEntryDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [selectedLetterType, setSelectedLetterType] = useState<string>('');
  const [showManagementDialog, setShowManagementDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    normal: 0,
    registered: 0,
    email: 0,
    fax: 0,
    pending: 0,
    processing: 0,
    completed: 0
  });

  const fetchCounts = async () => {
    try {
      const counts = await getLetterCounts();
      setCounts(counts);
    } catch (error) {
      console.error('Failed to fetch counts:', error);
      setCounts({
        total: 0,
        normal: 0,
        registered: 0,
        email: 0,
        fax: 0,
        pending: 0,
        processing: 0,
        completed: 0
      });
    }
  };

  const fetchLetters = async () => {
    try {
      const letters = await getLetters(selectedLetterType);
      setLetters(letters);0
    } catch (error) {
      console.error('Failed to fetch letters:', error);
      setLetters([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  useEffect(() => {
    if (selectedLetterType) {
      fetchLetters();
    }
  }, [selectedLetterType]);

  const translations = {
    dashboardTitle: t('dashboard', 'Dashboard'),
    dashboardSubtitle: t('overviewOfYourActivities', 'Overview of your activities'),
    today: t('today', 'Today'),
    letterTypesOverview: t('letterTypesOverview', 'Letter Types Overview'),
    totalLetters: t('totalLetters', 'Total Letters'),
    pending: t('pending', 'Pending'),
    processing: t('processing', 'Processing'),
    completed: t('completed', 'Completed'),
    normalPost: t('normalPost', 'Normal Post'),
    registeredPost: t('registeredPost', 'Registered Post'),
    fax: t('fax', 'Fax'),
    email: t('email', 'Email'),
    viewLetter: t('viewLetter', 'View Letter'),
    editLetter: t('editLetter', 'Edit Letter'),
    deleteLetter: t('deleteLetter', 'Delete Letter'),
    saveChanges: t('saveChanges', 'Save Changes'),
    cancel: t('cancel', 'Cancel'),
  };

  const handleCardClick = (letterType: string) => {
    setSelectedLetterType(letterType);
    setShowManagementDialog(true);
    setShowEditDialog(false);
  };

  const handleViewLetter = (letter: Letter) => {
    setSelectedLetter(letter);
    setShowViewDialog(true);
  };

  const handleEditLetter = (letter: any) => {
    setSelectedLetter(letter);
    setShowEditDialog(true);
  };

  const handleDeleteLetter = async (letter: Letter) => {
    try {
      await deleteLetter(letter.type, letter.id);
      setLetters(prev => prev.filter(l => l.id !== letter.id));
      await fetchCounts(); 
      toast.success(t('letterDeletedSuccessfully', 'Letter deleted successfully'));
    } catch (error) {
      console.error('Error deleting letter:', error);
      toast.error(t('errorDeletingLetter', 'Error deleting letter. Please try again.'));
    }
  };

  const getFilteredLetters = (type: string) => {
    return letters.filter(letter => letter.type === type);
  };

  const letterTypeCards = [
    { 
      type: 'normal', 
      title: translations.normalPost, 
      color: 'border-blue-500 bg-blue-50 hover:bg-blue-100',
      iconBg: 'bg-blue-100',
      count: counts.normal
    },
    { 
      type: 'registered', 
      title: translations.registeredPost,  
      color: 'border-green-500 bg-green-50 hover:bg-green-100',
      iconBg: 'bg-green-100',
      count: counts.registered
    },
    { 
      type: 'fax', 
      title: translations.fax, 
      color: 'border-orange-500 bg-orange-50 hover:bg-orange-100',
      iconBg: 'bg-orange-100',
      count: counts.fax
    },
    { 
      type: 'email', 
      title: translations.email, 
      color: 'border-purple-500 bg-purple-50 hover:bg-purple-100',
      iconBg: 'bg-purple-100',
      count: counts.email
    }
  ];

  const statusCounts = {
    total: counts.total,
    pending: counts.pending,
    processing: counts.processing,
    completed: counts.completed
  };

  const handleFormSubmit = async (updatedLetter: Letter) => {
    try {
      // Update the letter in the database
      await updateLetter(
        updatedLetter.type,
        updatedLetter.id,
        updatedLetter
      );
      
      // Refresh the letters list to get the updated data
      if (selectedLetterType) {
        const updatedLetters = await getLetters(selectedLetterType);
        setLetters(updatedLetters);
      }
      
      // Close the edit dialog before showing the success message
      setShowEditDialog(false);
      
      // Show success message with a small delay to ensure the dialog is closed
      setTimeout(() => {
        toast.success(`${updatedLetter.type.charAt(0).toUpperCase() + updatedLetter.type.slice(1)} updated successfully`, {
          toastId: 'update-success' // Use a unique ID to prevent duplicates
        });
      }, 100);
      
      // Refresh the counts
      await fetchCounts();
      
    } catch (error) {
      console.error('Error updating letter:', error);
      toast.error('Failed to update letter. Please try again.', {
        toastId: 'update-error' // Use a unique ID to prevent duplicates
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{translations.dashboardTitle}</h1>
          <p className="text-gray-600">{translations.dashboardSubtitle}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">{translations.today}</div>
          <div className="text-lg font-semibold text-gray-800">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{translations.totalLetters}</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : statusCounts.total}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{translations.pending}</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : statusCounts.pending}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{translations.processing}</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : statusCounts.processing}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{translations.completed}</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : statusCounts.completed}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Letter Type Cards */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{translations.letterTypesOverview}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {letterTypeCards.map((card) => (
            <div
              key={card.type}
              onClick={() => handleCardClick(card.type)}
              className={`${card.color} border rounded-lg p-6 cursor-pointer transition-colors duration-200 flex items-center`}
            >
              <div className={`${card.iconBg} p-3 rounded-full mr-4`}>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{card.title}</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? '...' : card.count}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dialogs */}
      <LetterManagementDialog
        isOpen={showManagementDialog}
        onClose={() => setShowManagementDialog(false)}
        letterType={selectedLetterType}
        onView={handleViewLetter}
        onEdit={handleEditLetter}
        onDelete={handleDeleteLetter}
        letters={getFilteredLetters(selectedLetterType)}
      />

      <LetterViewDialog
        isOpen={showViewDialog}
        onClose={() => setShowViewDialog(false)}
        letter={selectedLetter}
      />

      <LetterEditDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        letter={selectedLetter}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default DataEntryDashboard;
