import React, { useState } from 'react';
import { Letter } from '../../../types/letter';
import getIconComponent from '../IconMapper';
import { FiEye, FiEdit, FiTrash2, FiX } from 'react-icons/fi';

interface LetterManagementDialogProps {
    isOpen: boolean;
    onClose: () => void;
    letterType: string;
    letters: Letter[];
    onView: (letter: Letter) => void;
    onEdit: (letter: Letter) => void
    onDelete: (letter: Letter) => void;
}

const LetterManagementDialog: React.FC<LetterManagementDialogProps> = ({
    isOpen,
    onClose,
    letterType,
    letters,
    onView,
    onEdit,
    onDelete
}) => {
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleDeleteConfirm = (letter: Letter) => {
        onDelete(letter);
        setDeleteConfirm(null);
    };

    const getStatusColor = (status?: string) => {
        if (!status) return 'bg-gray-100 text-gray-800';
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDateTime = (date: string, time: string) => {
        try {
            const dateObj = new Date(`${date}T${time}`);
            return dateObj.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return `${date} ${time}`;
        }
    };

    const renderLetterTypeSpecificColumn = (letter: Letter) => {
        switch (letterType) {
            case 'email':
                return (
                    <>
                        <td className="border border-gray-200 px-4 py-3">
                            <div className="text-sm">
                                <div className="font-medium">From: {letter.from || 'N/A'}</div>
                                <div className="font-medium mt-1">To: {letter.to || 'N/A'}</div>
                            </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                            <div className="text-sm">
                                <div className="font-medium">{letter.subject || 'No Subject'}</div>
                            </div>
                        </td>
                    </>
                );
            case 'fax':
                return (
                    <td className="border border-gray-200 px-4 py-3">
                        <div className="text-sm">
                            <div className="font-medium">Fax Number:</div>
                            <div className="text-gray-500">{letter.faxNumber || 'N/A'}</div>
                        </div>
                    </td>
                );
            case 'registered':
                return (
                    <td className="border border-gray-200 px-4 py-3">
                        <div className="text-sm">
                            <div className="font-medium">Reg. Number:</div>
                            <div className="text-gray-500">{letter.registrationNumber || 'N/A'}</div>
                        </div>
                    </td>
                );
            default: // normal post
                return (
                    <>
                        <td className="border border-gray-200 px-4 py-3">
                            <div className="text-sm">
                                <div className="font-medium">From: {letter.senderName || 'N/A'}</div>
                                <div className="text-gray-500 text-xs">{letter.from || ''}</div>
                            </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                            <div className="text-sm">
                                <div className="font-medium">To: {letter.receiverName || 'N/A'}</div>
                                <div className="text-gray-500 text-xs">{letter.to || ''}</div>
                            </div>
                        </td>
                    </>
                );
        }
    };

    const renderTableHeaders = () => {
        switch (letterType) {
            case 'email':
                return (
                    <>
                        <th className="border border-gray-200 px-4 py-3 text-left">Email Details</th>
                        <th className="border border-gray-200 px-4 py-3 text-left">Subject</th>
                    </>
                );
            case 'fax':
                return <th className="border border-gray-200 px-4 py-3 text-left">Fax Number</th>;
            case 'registered':
                return <th className="border border-gray-200 px-4 py-3 text-left">Registration Number</th>;
            default: // normal post
                return (
                    <>
                        <th className="border border-gray-200 px-4 py-3 text-left">Sender</th>
                        <th className="border border-gray-200 px-4 py-3 text-left">Receiver</th>
                    </>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">
                        {letterType ? `${letterType.charAt(0).toUpperCase() + letterType.slice(1)} Letters` : 'All Letters'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FiX size={24} />
                    </button>
                </div>
                
                <div className="overflow-auto flex-1">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                {letterType === 'email' && (
                                    <>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            From / To
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subject
                                        </th>
                                    </>
                                )}
                                {letterType === 'fax' && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fax Details
                                    </th>
                                )}
                                {letterType === 'registered' && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Registration
                                    </th>
                                )}
                                {letterType === 'normal' && (
                                    <>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sender / Receiver
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Details
                                        </th>
                                    </>
                                )}
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date/Time
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {letters.map((letter) => (
                                <tr key={letter.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {letter.id}
                                    </td>
                                    {renderLetterTypeSpecificColumn(letter)}
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {formatDateTime(letter.date, letter.time)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(letter.status)}`}>
                                            {letter.status || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => onView(letter)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="View"
                                            >
                                                <FiEye />
                                            </button>
                                            <button
                                                onClick={() => onEdit(letter)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Edit"
                                            >
                                                <FiEdit />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(letter.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Confirm Deletion</h3>
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                        <p className="mb-6">Are you sure you want to delete this {letterType} letter? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const letter = letters.find(l => l.id === deleteConfirm);
                                    if (letter) handleDeleteConfirm(letter);
                                }}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LetterManagementDialog;