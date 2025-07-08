import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FaFilePdf, FaFileImage, FaFileAlt, FaTimes, FaFileWord } from 'react-icons/fa';
import { FiUpload, FiSend, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';

interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  type: string;
  size: number;
  url?: string;
}

interface NormalPostEntry {
  id: string;
  senderName: string;
  senderAddress: string;
  receiverName: string;
  receiverAddress: string;
  date: string;
  time: string;
  isConfidential: string;
  mode: string;
  status: string;
  priority: string;
  type: string;
  createdAt: string;
  attachments: UploadedFile[];
}

interface NormalPostFormProps {
  initialData?: NormalPostEntry;
  onSubmit: (data: NormalPostEntry) => void;
}

const NormalPostForm: React.FC<NormalPostFormProps> = ({ initialData, onSubmit }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    senderName: initialData?.senderName || '',
    senderAddress: initialData?.senderAddress || '',
    receiverName: initialData?.receiverName || '',
    receiverAddress: initialData?.receiverAddress || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    time: initialData?.time || new Date().toTimeString().substring(0, 5),
    isConfidential: initialData?.isConfidential || 'No',
    mode: initialData?.mode || 'By hand',
    status: initialData?.status || 'pending',
    priority: initialData?.priority || 'medium',
    type: 'normal' as const
  });

  const [attachments, setAttachments] = useState<UploadedFile[]>(initialData?.attachments || []);
  const [recentEntries, setRecentEntries] = useState<NormalPostEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = recentEntries.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(recentEntries.length / entriesPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/normal-posts`);
        const data = Array.isArray(response.data) ? response.data : 
                   (Array.isArray(response.data?.data) ? response.data.data : []);
        setRecentEntries(data);
      } catch (err) {
        setError('Failed to load recent normal posts');
        console.error('Error fetching recent posts:', err);
        setRecentEntries([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentPosts();
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

    setAttachments(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (id: string) => {
    setAttachments(prev => {
      const updated = prev.filter(file => {
        if (file.id === id) {
          URL.revokeObjectURL(file.previewUrl);
          return false;
        }
        return true;
      });
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('senderName', formData.senderName);
      formDataToSend.append('senderAddress', formData.senderAddress);
      formDataToSend.append('receiverName', formData.receiverName);
      formDataToSend.append('receiverAddress', formData.receiverAddress);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('time', formData.time);
      formDataToSend.append('isConfidential', formData.isConfidential);
      formDataToSend.append('mode', formData.mode);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('type', 'normal');
      
      if (attachments.length > 0) {
        attachments.forEach((fileObj) => {
          formDataToSend.append('attachments', fileObj.file);
        });
      }

      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/normal-posts`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setRecentEntries(prev => [response.data, ...prev]);

      onSubmit(response.data);

      setFormData({
        senderName: '',
        senderAddress: '',
        receiverName: '',
        receiverAddress: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().substring(0, 5),
        isConfidential: 'No',
        mode: 'By hand',
        status: 'pending',
        priority: 'medium',
        type: 'normal'
      });
      setAttachments([]);
      toast.success('Normal post saved successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save normal post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeClass = (status: string) => {
    const statusStr = String(status || '').toLowerCase();
    
    switch (statusStr) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sender Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {t('normalPost.senderInfo')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('normalPost.senderName')}
              </label>
              <input
                type="text"
                name="senderName"
                value={formData.senderName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('normalPost.senderAddress')}
              </label>
              <textarea
                name="senderAddress"
                value={formData.senderAddress}
                onChange={handleChange}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Receiver Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {t('normalPost.receiverInfo')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('normalPost.receiverName')}
              </label>
              <input
                type="text"
                name="receiverName"
                value={formData.receiverName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('normalPost.receiverAddress')}
              </label>
              <textarea
                name="receiverAddress"
                value={formData.receiverAddress}
                onChange={handleChange}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('common.date')}
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('common.time')}
              </label>
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
        </div>

        {/* Additional Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {t('normalPost.additionalInfo')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('normalPost.isConfidential')}
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isConfidential"
                    value="Yes"
                    checked={formData.isConfidential === 'Yes'}
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
                    checked={formData.isConfidential === 'No'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {t('common.no')}
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('normalPost.mode')}
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mode"
                    value="By hand"
                    checked={formData.mode === 'By hand'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {t('normalPost.byHand')}
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mode"
                    value="Postal"
                    checked={formData.mode === 'Postal'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {t('normalPost.postal')}
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

        {/* File Upload Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {t('normalPost.attachment')}
          </h3>
          <div className="flex space-x-4">
            <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
              <FiUpload className="mr-2" />
              {t('normalPost.uploadFile')}
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

          {/* Uploaded Files List */}
          {attachments.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {t('normalPost.attachedFiles')}
              </h4>
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {attachments.map((file) => (
                  <li key={file.id} className="pl-3 pr-4 py-3 group hover:bg-gray-50 rounded-md">
                    <div className="flex items-center justify-between">
                      <div 
                        className="w-0 flex-1 flex items-center cursor-pointer"
                        onClick={() => setPreviewFile(file)}
                      >
                        {getFileIcon(file.type)}
                        <span className="ml-2 flex-1 w-0 truncate">
                          {file.name}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile(file.id);
                          }}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          title={t('common.remove')}
                        >
                          <FaTimes className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Form actions */}
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 inline-flex items-center disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <FiSend className="mr-2" />
            )}
            {t('common.submit')}
          </button>
        </div>
      </form>

      {/* Recent Entries Table */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('normalPost.recentNormalPosts')}
        </h3>

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
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {t('normalPost.noEntries')}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('normalPost.getStarted')}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden border border-gray-200 sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('normalPost.dateTime')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('normalPost.senderToReceiver')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('normalPost.mode')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('common.status')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('normalPost.attachments')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentEntries.map((entry) => (
                    <tr 
                      key={entry.id} 
                      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                      onClick={() => {
                        console.log('View entry:', entry.id);
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(entry.date)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {entry.time}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]" title={entry.senderName}>
                            {entry.senderName}
                          </div>
                          <svg className="h-4 w-4 mx-2 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]" title={entry.receiverName}>
                            {entry.receiverName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          entry.mode === 'By hand' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800' }`}>
                          {entry.mode === 'By hand' ? t('normalPost.byHand') : t('normalPost.postal')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(entry.status)}`}>
                          {entry.status || t('common.pending')}
                        </span>
                        {entry.isConfidential === 'Yes' && (
                          <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {t('normalPost.confidential')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {entry.attachments && entry.attachments.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {entry.attachments.map((file, index) => {
                              if (!file) return null;
                              
                              const fileExt = file.name ? file.name.split('.').pop()?.toLowerCase() || '' : '';
                              const fileUrl = file.url || file.previewUrl || '';
                              const fileName = file.name || t('normalPost.unnamedFile');
                              
                              return (
                                <a 
                                  key={index}
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (file.previewUrl || file.url) {
                                      setPreviewFile(file);
                                      setShowPreview(true);
                                    }
                                  }}
                                  title={`${t('normalPost.clickToView')} ${fileName}`}
                                >
                                  {file.type?.startsWith('image/') ? (
                                    <FaFileImage className="h-3 w-3 mr-1 text-blue-500" />
                                  ) : file.type === 'application/pdf' || fileExt === 'pdf' ? (
                                    <FaFilePdf className="h-3 w-3 mr-1 text-red-500" />
                                  ) : file.type?.startsWith('text/') || 
                                    file.type?.includes('document') || 
                                    ['doc', 'docx', 'txt'].includes(fileExt) ? (
                                    <FaFileWord className="h-3 w-3 mr-1 text-blue-600" />
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
                          <span className="text-xs text-gray-400">
                            {t('normalPost.noAttachments')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {recentEntries.length > entriesPerPage && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t('common.previous')}
                  </button>
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t('common.next')}
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-end">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">{t('common.previous')}</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === number ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">{t('common.next')}</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowPreview(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        {previewFile.name || t('normalPost.filePreview')}
                      </h3>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500"
                        onClick={() => setShowPreview(false)}
                      >
                        <FaTimes className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="mt-4 max-h-[70vh] overflow-auto">
                      {previewFile.type?.startsWith('image/') ? (
                        <img 
                          src={previewFile.previewUrl || previewFile.url} 
                          alt={previewFile.name || t('normalPost.preview')} 
                          className="max-w-full h-auto mx-auto"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.png';
                          }}
                        />
                      ) : previewFile.type === 'application/pdf' || (previewFile.name?.toLowerCase().endsWith('.pdf')) ? (
                        <iframe 
                          src={`${previewFile.previewUrl || previewFile.url}#view=fitH`} 
                          className="w-full h-[70vh] border-0"
                          title={previewFile.name || t('normalPost.pdfPreview')}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8">
                          <FaFileAlt className="h-16 w-16 text-gray-400 mb-4" />
                          <p className="text-gray-600 mb-4">
                            {t('normalPost.previewNotAvailable')}
                          </p>
                          <a
                            href={previewFile.previewUrl || previewFile.url}
                            download={previewFile.name}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FiDownload className="mr-2 h-4 w-4" />
                            {t('common.downloadFile')}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <a
                  href={previewFile.previewUrl || previewFile.url}
                  download={previewFile.name}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiDownload className="mr-2 h-4 w-4" />
                  {t('common.download')}
                </a>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowPreview(false)}
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NormalPostForm;