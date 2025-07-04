import React, { useState, useEffect, useRef } from 'react';
import {FaFilePdf, FaFileImage, FaFileAlt, FaTimes } from 'react-icons/fa';
import { FiUpload, FiEye, FiSend } from 'react-icons/fi';
import { updateLetter, createEmail } from '../../../services/letterService';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  type: string;
  size: number;
}

interface EmailEntry {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  time: string;
  status: string;
  priority: string;
  cc?: string;
  bcc?: string;
  message?: string;
  createdAt: string;
}

export interface EmailFormData {
  id?: string;
  subject: string;
  from: string;
  to: string;
  cc?: string;
  bcc?: string;
  message: string;
  date: string;
  time: string;
  status?: string;
  priority?: string;
  type?: string;
  attachments?: UploadedFile[];
}

interface EmailFormProps {
  initialData?: Partial<EmailFormData>;
  onSubmit: (data: EmailFormData) => void;
  onCancel: () => void;
}

const EmailForm: React.FC<EmailFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<EmailFormData>(() => ({
    subject: '',
    from: '',
    to: '',
    message: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().substring(0, 5),
    status: 'pending',
    priority: 'medium',
    type: 'email',
    attachments: [],
    ...initialData
  }));

  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [recentEntries, setRecentEntries] = useState<EmailEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(5);

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = recentEntries.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(recentEntries.length / entriesPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        attachments: initialData.attachments || []
      }));
    }
  }, [initialData]);

  // Fetch recent emails
  useEffect(() => {
    const fetchRecentEmails = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/emails`)
        setRecentEntries(response.data);
      } catch (err) {
        setError('Failed to load recent emails');
        console.error('Error fetching recent emails:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentEmails();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      size: file.size
    }));

    setFormData(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newFiles]
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter(file => {
        const shouldKeep = file.id !== id;
        if (!shouldKeep) {
          URL.revokeObjectURL(file.previewUrl);
        }
        return shouldKeep;
      })
    }));
  };

  const handlePreviewFile = (file: UploadedFile) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image/')) return <FaFileImage className="text-blue-500 text-xl" />;
    if (type === 'application/pdf') return <FaFilePdf className="text-red-500 text-xl" />;
    return <FaFileAlt className="text-gray-500 text-xl" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Append form fields
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('from', formData.from);
      formDataToSend.append('to', formData.to);
      formDataToSend.append('message', formData.message);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('time', formData.time);
      formDataToSend.append('status', formData.status || 'pending');
      formDataToSend.append('priority', formData.priority || 'medium');
      formDataToSend.append('type', 'email');
      
      if (formData.cc) formDataToSend.append('cc', formData.cc);
      if (formData.bcc) formDataToSend.append('bcc', formData.bcc);
      
      // Append files
      if (formData.attachments && formData.attachments.length > 0) {
        formData.attachments.forEach((fileObj) => {
          formDataToSend.append('attachments', fileObj.file);
        });
      }

      let result;
      if (formData.id) {
        // Update existing email
        result = await axios.put(`${import.meta.env.VITE_BASE_URL}/emails/${formData.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success(t('emailUpdatedSuccessfully'));
      } else {
        // Create new email
        result = await axios.post(`${import.meta.env.VITE_BASE_URL}/emails`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success(t('emailSentSuccessfully'));
      }
      
      onSubmit(result.data);
      
      // Reset form for new entries
      if (!formData.id) {
        setFormData({
          subject: '',
          from: '',
          to: '',
          message: '',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().substring(0, 5),
          status: 'pending',
          priority: 'medium',
          type: 'email',
          attachments: [],
        });
      }
      
    } catch (error) {
      console.error('Error submitting email:', error);
      const errorMessage = error instanceof Error ? error.message : t('failedToSendEmail');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'sending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Clean up object URLs
  useEffect(() => {
    return () => {
      formData.attachments?.forEach(file => {
        URL.revokeObjectURL(file.previewUrl);
      });
    };
  }, [formData.attachments]);

  return (
    <>
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('from')}</label>
              <input
                type="email"
                name="from"
                value={formData.from}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('to')}*</label>
              <input
                type="email"
                name="to"
                value={formData.to}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('cc')} ({t('optional')})</label>
              <input
                type="email"
                name="cc"
                value={formData.cc || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('bcc')} ({t('optional')})</label>
              <input
                type="email"
                name="bcc"
                value={formData.bcc || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('date')}</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('time')}</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('subject')}*</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('message')}*</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={6}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>

          <div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <FiUpload className="mr-2" />
                {t('uploadFile')}
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.xlsx,.xls"
                />
              </label>
              {/* <button
                type="button"
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => alert(t('scanFunctionalityComingSoon'))}
              >
                <FaBarcode className="mr-2" />
                {t('scanDocument')}
              </button> */}
            </div>

            {formData.attachments && formData.attachments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">{t('attachments')}</h4>
                <ul className="space-y-2">
                  {formData.attachments.map((file) => (
                    <li key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        {getFileIcon(file.type)}
                        <span className="text-sm ml-2">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({formatFileSize(file.size)})</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handlePreviewFile(file)}
                          className="text-blue-500 hover:text-blue-700"
                          title={t('preview')}
                        >
                          <FiEye />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.id)}
                          className="text-red-500 hover:text-red-700"
                          title={t('remove')}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('sending')}...
                </span>
              ) : (
                <>
                  <FiSend className="inline mr-2" />
                  {formData.id ? t('update') : t('submit')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Emails Table */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('recentEmails')}</h3>
          {recentEntries.length > entriesPerPage && (
            <div className="flex items-center space-x-2">
              <button 
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 border rounded-md text-sm font-medium ${
                  currentPage === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('previous')}
              </button>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 border rounded-md text-sm font-medium ${
                  currentPage === totalPages 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('next')}
              </button>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : recentEntries.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noRecentEmails')}</h3>
              <p className="mt-1 text-sm text-gray-500">{t('getStarted')}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden border border-gray-200 sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('dateAndTime')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('from')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('to')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('subject')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentEntries.map((email) => (
                    <tr key={email.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(email.date)}
                        </div>
                        <div className="text-xs text-gray-500">
                        {email.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {email.from}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {email.to}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {email.subject || t('noSubject')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(email.status)}`}>
                          {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {recentEntries.length > entriesPerPage && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-end">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">{t('previous')}</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === number
                            ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                    
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">{t('next')}</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* File Preview Modal */}
      {showPreview && previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">{t('preview')}: {previewFile.name}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1">
              {previewFile.type.startsWith('image/') ? (
                <img
                  src={previewFile.previewUrl}
                  alt={previewFile.name}
                  className="max-w-full max-h-[70vh] mx-auto"
                />
              ) : previewFile.type === 'application/pdf' ? (
                <iframe
                  src={previewFile.previewUrl}
                  className="w-full h-[70vh]"
                  title={previewFile.name}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <FaFileAlt className="h-16 w-16 mb-4" />
                  <p>{t('previewNotAvailable')}</p>
                  <p className="text-sm mt-2">{t('fileType')}: {previewFile.type}</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                {t('close')}
              </button>
              <a
                href={previewFile.previewUrl}
                download={previewFile.name}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                {t('download')}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmailForm;