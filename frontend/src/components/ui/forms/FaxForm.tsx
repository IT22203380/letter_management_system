import React, { useState, useEffect, useRef } from 'react';
import { FaFilePdf, FaFileImage, FaFileAlt, FaTimes } from 'react-icons/fa';
import { FiUpload, FiEye, FiSend } from 'react-icons/fi';
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
  url?: string;
}

export interface FaxFormData {
  id?: string;
  senderNumber: string;
  senderOrganization: string;
  senderEmail: string;
  faxNumber: string;
  subject: string;
  message: string;
  date: string;
  time: string;
  status?: string;
  priority?: string;
  type?: string;
  attachments?: UploadedFile[];
  isConfidential?: string;
  mode?: string;
}

interface FaxFormProps {
  initialData?: Partial<FaxFormData>;
  onSubmit: (data: FaxFormData) => void;
  onCancel: () => void;
}

interface FaxEntry {
  id: string;
  senderNumber: string;
  senderOrganization: string;
  senderEmail: string;
  faxNumber: string;
  subject: string;
  message: string;
  date: string;
  time: string;
  status: string;
  priority: string;
  type: string;
  createdAt: string;
  attachments?: UploadedFile[];
}

const FaxForm: React.FC<FaxFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FaxFormData>(() => ({
    senderNumber: '',
    senderOrganization: '',
    senderEmail: '',
    faxNumber: '',
    subject: '',
    message: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().substring(0, 5),
    status: 'pending',
    priority: 'medium',
    type: 'fax',
    attachments: [],
    isConfidential: 'No',
    mode: 'By hand',
    ...initialData
  }));

  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recentEntries, setRecentEntries] = useState<FaxEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(5);
  
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

  // Fetch recent fax entries
  useEffect(() => {
    const fetchRecentFaxes = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/faxes`);
        setRecentEntries(response.data);
      } catch (err) {
        setError('Failed to load recent fax entries');
        console.error('Error fetching recent faxes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentFaxes();
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

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Append form fields
      formDataToSend.append('senderNumber', formData.senderNumber);
      formDataToSend.append('senderOrganization', formData.senderOrganization);
      formDataToSend.append('senderEmail', formData.senderEmail);
      formDataToSend.append('faxNumber', formData.faxNumber);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('message', formData.message);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('time', formData.time);
      formDataToSend.append('status', formData.status || 'pending');
      formDataToSend.append('type', 'fax');
      formDataToSend.append('isConfidential', formData.isConfidential);
      formDataToSend.append('mode', formData.mode);
      formDataToSend.append('priority', formData.priority);
      
      // Append files
      if (formData.attachments && formData.attachments.length > 0) {
        formData.attachments.forEach((fileObj) => {
          formDataToSend.append('attachments', fileObj.file);
        });
      }

      let result;
      if (formData.id) {
        // Update existing fax
        result = await axios.put(`${import.meta.env.VITE_BASE_URL}/faxes/${formData.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Fax updated successfully');
      } else {
        // Create new fax
        result = await axios.post(`${import.meta.env.VITE_BASE_URL}/faxes`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Fax submitted successfully');
      }
      
      onSubmit(result.data);
      
      // Reset form for new entries
      if (!formData.id) {
        setFormData({
          senderNumber: '',
          senderOrganization: '',
          senderEmail: '',
          faxNumber: '',
          subject: '',
          message: '',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().substring(0, 5),
          status: 'pending',
          priority: 'medium',
          type: 'fax',
          attachments: [],
          isConfidential: 'No',
          mode: 'By hand',
        });
      }
      
    } catch (error) {
      console.error('Error submitting fax:', error);
      let errorMessage = 'Failed to submit fax';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
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

  return (
    <>
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('faxForm.senderNumber')}
            </label>
              <input
                type="tel"
                name="senderNumber"
                value={formData.senderNumber}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required/>
                
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('faxForm.organization')}</label>
              <input
                type="text"
                name="senderOrganization"
                value={formData.senderOrganization}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('faxForm.email')}</label>
              <input
                type="email"
                name="senderEmail"
                value={formData.senderEmail}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('faxForm.faxNumber')}</label>
              <input
                type="tel"
                name="faxNumber"
                value={formData.faxNumber}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('faxForm.date')}</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('faxForm.time')}</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('faxForm.subject')}</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('faxForm.message')}</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={6}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common.isConfidential')}
  </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isConfidential"
                      value="Yes"
                      checked={formData.isConfidential === 'yes'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    {t('common.yes')}
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isConfidential"
                      value="No"
                      checked={formData.isConfidential !== 'no'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    {t('common.no')}
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.mode')}
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="mode"
                      value="By hand"
                      checked={formData.mode === 'byHand'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    {t('common.byHand')}
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="mode"
                      value="postal"
                      checked={formData.mode === 'postal'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    {t('common.postal')}
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('common.priority')}
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="low">{t('common.low')}</option>
                  <option value="medium">{t('common.medium')}</option>
                  <option value="high">{t('common.high')}</option>
                </select>
              </div>
            </div>
          </div>

          <div>
  <div className="flex items-center space-x-4">
    <label className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
      <FiUpload className="mr-2" />
      {t('faxForm.uploadFile')}
      <input
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.xlsx,.xls"
      />
    </label>
  </div>

            {formData.attachments && formData.attachments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">{t('faxForm.attachments')}</h4>
                <ul className="space-y-2">
                  {formData.attachments.map((file) => (
                    <li key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        {file.type.includes('image/') ? (
                          <FaFileImage className="text-blue-500 mr-2" />
                        ) : file.type === 'application/pdf' ? (
                          <FaFilePdf className="text-red-500 mr-2" />
                        ) : (
                          <FaFileAlt className="text-gray-500 mr-2" />
                        )}
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({file.size} bytes)</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => console.log('Preview file')}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <FiEye />
                        </button>
                        <button
                          type="button"
                          onClick={() => console.log('Remove file')}
                          className="text-red-500 hover:text-red-700"
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
              {t('faxForm.cancel')}
            </button>
            <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 inline-flex items-center disabled:opacity-50"
            >
                <FiSend className="mr-2" />
                {isLoading ? t('faxForm.sending') : t('submit')}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Fax Entries Table */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('faxForm.recentFaxes')}</h3>
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
                {t('faxForm.previous')}
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
                  {t('faxForm.next')}
              </button>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent faxes</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by sending a new fax.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden border border-gray-200 sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('faxForm.dateAndTime')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('faxForm.from')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('faxForm.to')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('faxForm.subject')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('faxForm.attachments')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('faxForm.status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(entry.date)}
                        </div>
                        <div className="text-xs text-gray-500">
                        {entry.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{entry.senderOrganization || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{entry.senderNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.faxNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {entry.subject || 'No subject'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {entry.attachments?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {entry.attachments.map((file, index) => {
                              if (!file) return null;
                              
                              const fileExt = file.name?.split('.').pop()?.toLowerCase() || '';
                              const fileUrl = file.url || '';
                              const fileName = file.name || 'Unnamed file';
                              
                              return (
                                <a 
                                  key={index}
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                                  title={`Click to view ${fileName}`}
                                >
                                  {file.type?.startsWith('image/') ? (
                                    <FaFileImage className="h-3 w-3 mr-1 text-blue-500" />
                                  ) : file.type === 'application/pdf' || fileExt === 'pdf' ? (
                                    <FaFilePdf className="h-3 w-3 mr-1 text-red-500" />
                                  ) : file.type?.startsWith('text/') || 
                                    file.type?.includes('document') || 
                                    ['doc', 'docx', 'txt'].includes(fileExt) ? (
                                    <FaFileAlt className="h-3 w-3 mr-1 text-blue-600" />
                                  ) : (
                                    <FaFileAlt className="h-3 w-3 mr-1 text-gray-500" />
                                  )}
                                  <span className="truncate max-w-xs">
                                    {fileName.length > 15 ? `${fileName.substring(0, 12)}...` : fileName}
                                  </span>
                                </a>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No attachments</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(entry.status)}`}>
                          {entry.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination controls */}
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
                      <span className="sr-only">{t('faxForm.previous')}</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === number
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
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
                      <span className="sr-only">{t('faxForm.next')}</span>
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
    </>
  );
};

export default FaxForm;