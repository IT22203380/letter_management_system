import React from 'react';
import { Letter } from '../../../types/letter';
import NormalPostForm from '../forms/NormalPostForm';
import RegisteredPostForm from '../forms/RegisteredPostForm';
import EmailForm from '../forms/EmailForm';
import FaxForm from '../forms/FaxForm';
import { FiX } from 'react-icons/fi';

interface LetterEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  letter: Letter | null;
  onSubmit: (updatedLetter: Letter) => void;
}

const LetterEditDialog: React.FC<LetterEditDialogProps> = ({
  isOpen,
  onClose,
  letter,
  onSubmit
}) => {
  if (!isOpen || !letter) return null;

  const renderForm = () => {
    switch (letter.type) {
      case 'normal':
        return (
          <NormalPostForm
            initialData={letter}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        );
      case 'registered':
        return (
          <RegisteredPostForm
            initialData={letter}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        );
      case 'email':
        return (
          <EmailForm
            initialData={letter}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        );
      case 'fax':
        return (
          <FaxForm
            initialData={letter}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="bg-purple-700 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Edit {letter.type.charAt(0).toUpperCase() + letter.type.slice(1)} Letter
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {renderForm()}
        </div>
      </div>
    </div>
  );
};

export default LetterEditDialog;
