import React from 'react';
import { Letter } from '../../../types/letter';
import { FiX } from 'react-icons/fi';

interface LetterViewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    letter: Letter | null;
}

const LetterViewDialog: React.FC<LetterViewDialogProps> = ({
    isOpen,
    onClose,
    letter
}) => {
    if (!isOpen || !letter) return null;

    const getStatusColor = (status?: string) => {
        if (!status) return 'bg-gray-100 text-gray-800';
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority?: string) => {
        if (!priority) return 'bg-gray-100 text-gray-800';
        switch (priority.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-orange-100 text-orange-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="bg-purple-700 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                        {letter.type.charAt(0).toUpperCase() + letter.type.slice(1)} Letter Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 focus:outline-none"
                    >
                        <FiX size={24} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div className="space-y-4">
                        {letter.subject && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">{letter.subject}</h3>
                                <p className="text-sm text-gray-500 mt-1">Subject</p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Letter ID</label>
                                <p className="text-gray-900">{letter.id || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <p className="text-gray-900 capitalize">{letter.type || 'N/A'}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                            <p className="text-gray-900">{letter.from || 'N/A'}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                            <p className="text-gray-900">{letter.to || 'N/A'}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <p className="text-gray-900">{letter.date || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(letter.status)}`}>
                                    {letter.status ? letter.status.toUpperCase() : 'N/A'}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(letter.priority)}`}>
                                    {letter.priority ? letter.priority.toUpperCase() : 'N/A'}
                                </span>
                            </div>
                        </div>
                        {letter.message && (
                            <div className="mt-4">
                                <div className="border rounded-md p-4 bg-gray-50">
                                    <p className="whitespace-pre-line text-gray-800">{letter.message}</p>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Message</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LetterViewDialog;