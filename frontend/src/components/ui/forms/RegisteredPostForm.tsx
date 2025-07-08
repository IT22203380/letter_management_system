import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaFilePdf, FaFileImage, FaFileAlt, FaTimes, FaFileWord, FaTimesCircle } from 'react-icons/fa';
import { FiUpload, FiSend, FiEye, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface UploadedFile {
  id: string;
  file?: File;
  previewUrl?: string;
  name: string;
  type: string;
  size: number;
  filename?: string;
  url?: string;
}

interface RegisteredPostEntry {
  id: string;
  registrationNumber: string;
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
  subject: string;
  message: string;
  attachments: UploadedFile[];
  createdAt: string;
}

interface RegisteredPostFormProps {
  initialData?: RegisteredPostEntry;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const RegisteredPostForm: React.FC<RegisteredPostFormProps> = ({ initialData, onSubmit }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    registrationNumber: initialData?.registrationNumber || '',
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
    type: 'registered',
    subject: initialData?.subject || '',
    message: initialData?.message || ''
  });

  const [attachments, setAttachments] = useState<UploadedFile[]>(initialData?.attachments || []);
  const [recentEntries, setRecentEntries] = useState<RegisteredPostEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(5);

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const displayedEntries = Array.isArray(recentEntries) ? recentEntries.slice(indexOfFirstEntry, indexOfLastEntry) : [];
  const totalPages = Array.isArray(recentEntries) ? Math.ceil(recentEntries.length / entriesPerPage) : 1;

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        date: initialData.date || new Date().toISOString().split('T')[0],
        time: initialData.time || new Date().toTimeString().substring(0, 5),
        isConfidential: initialData.isConfidential || 'No',
        mode: initialData.mode || 'By hand',
        status: initialData.status || 'pending',
        priority: initialData.priority || 'medium',
        type: 'registered',
        attachments: initialData.attachments || []
      }));
    }
  }, [initialData]);

  useEffect(() => {
    const fetchRecentEntries = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/registered-posts`);
        
        // Ensure response.data is an array before setting state
        if (Array.isArray(response.data?.data)) {
          setRecentEntries(response.data.data);
        } else if (Array.isArray(response.data)) {
          // Handle case where response.data is already the array
          setRecentEntries(response.data);
        } else {
          console.warn('Unexpected response format:', response.data);
          setRecentEntries([]);
        }
      } catch (error) {
        console.error('Error fetching recent entries:', error);
        setRecentEntries([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentEntries();
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

  const handleRemoveFile = async (id: string, filename?: string) => {
    // If this is an existing file (has filename), delete it from the server
    if (filename && initialData?.id) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_BASE_URL}/registered-posts/${initialData.id}/attachments/${filename}`
        );
      } catch (error) {
        console.error('Error deleting attachment:', error);
        alert('Failed to delete attachment. Please try again.');
        return;
      }
    }
    
    // Remove from local state
    setAttachments(prev => {
      const updated = prev.filter(file => {
        if (file.id === id) {
          if (file.previewUrl) {
            URL.revokeObjectURL(file.previewUrl);
          }
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
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Append form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'attachments') {
          formDataToSend.append(key, formData[key as keyof typeof formData]);
        }
      });
      
      // Append files
      if (attachments.length > 0) {
        attachments.forEach(fileObj => {
          if (fileObj.file) {
            formDataToSend.append('attachments', fileObj.file);
          }
        });
      }

      let response;
      if (initialData?.id) {
        // Update existing post
        response = await axios.put(
          `${import.meta.env.VITE_BASE_URL}/registered-posts/${initialData.id}`,
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        toast.success('Registered post updated successfully!');
      } else {
        // Create new post
        response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/registered-posts`,
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        toast.success('Registered post created successfully!');
      }

      console.log('Server response:', response.data);

      // Call parent's onSubmit with the response data
      if (onSubmit) {
        onSubmit(response.data);
      }
      
      if (!initialData?.id) {
        // Reset form for new entries
        setFormData({
          registrationNumber: '',
          senderName: '',
          senderAddress: '',
          receiverName: '',
          receiverAddress: '',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().substring(0, 5),
          isConfidential: 'no',
          mode: 'byHand',
          status: 'pending',
          priority: 'medium',
          type: 'registered',
          subject: '',
          message: ''
        });
        setAttachments([]);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save registered post. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (!type) return <FaFileAlt className="text-gray-500 text-xl" />;
    if (type.includes('image/')) return <FaFileImage className="text-blue-500 text-xl" />;
    if (type === 'application/pdf') return <FaFilePdf className="text-red-500 text-xl" />;
    if (type.includes('word') || type.includes('document')) return <FaFileWord className="text-blue-600 text-xl" />;
    return <FaFileAlt className="text-gray-500 text-xl" />;
  };

  // Add state for the selected attachment
  const [selectedAttachment, setSelectedAttachment] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);

  // Function to handle attachment click
  const handleAttachmentClick = (file: UploadedFile, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!file.url) return;
    
    // Remove any leading slashes from the URL to prevent double slashes
    const cleanUrl = file.url.startsWith('/') ? file.url.substring(1) : file.url;
    
    // Construct the full URL without adding /api
    const baseUrl = import.meta.env.VITE_BASE_URL || '';
    const fullUrl = `${baseUrl}${baseUrl.endsWith('/') ? '' : '/'}${cleanUrl}`;
    
    console.log('Opening attachment URL:', fullUrl); // For debugging
    
    setSelectedAttachment({
      url: fullUrl,
      name: file.name || 'Attachment',
      type: file.type || 'application/octet-stream'
    });
  };

  // Function to render the attachment preview based on type
  const renderAttachmentPreview = () => {
    if (!selectedAttachment) return null;

    const { url, name, type } = selectedAttachment;
    
    if (type.startsWith('image/')) {
      return (
        <div className="max-h-[80vh] overflow-auto">
          <img 
            src={url} 
            alt={name} 
            className="max-w-full h-auto mx-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-image.png';
            }}
          />
        </div>
      );
    } else if (type === 'application/pdf') {
      return (
        <div className="w-full h-[80vh]">
          <iframe 
            src={`${url}#view=fitH`} 
            className="w-full h-full border-0"
            title={name}
          />
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <FaFileAlt className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Preview not available for this file type</p>
          <a
            href={url}
            download={name}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          >
            <FiDownload className="mr-2 h-4 w-4" />
            Download File
          </a>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Registration Number */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
           {t('registeredPostForm.registrationNumber')} <span className="text-red-500">*</span>
          </label>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
        </div>

        {/* Sender and Receiver Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Sender Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('registeredPostForm.senderDetails')}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('registeredPostForm.senderName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="senderName"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="senderAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('registeredPostForm.senderAddress')}
                </label>
                <textarea
                  id="senderAddress"
                  name="senderAddress"
                  value={formData.senderAddress}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Receiver Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              {t('registeredPostForm.receiverDetails')}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="receiverName" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('registeredPostForm.receiverName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="receiverName"
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="receiverAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('registeredPostForm.receiverAddress')}
                </label>
                <textarea
                  id="receiverAddress"
                  name="receiverAddress"
                  value={formData.receiverAddress}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Add Date and Time Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('date')}
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
            {t('time')}
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

        {/* Additional Information */}
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
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700">{t('postal')}</span>
                  </label>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {t('attachments')}
          </h3>
          <div className="flex space-x-4">
            <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
              <FiUpload className="mr-2" />
             {t('uploadFile')}
              <input 
                type="file" 
                multiple 
                className="hidden" 
                onChange={handleFileChange}
                ref={fileInputRef}
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              />
            </label>
            {/* <button
              type="button"
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => alert('Scan functionality will be implemented here')}
            >
              <FaBarcode className="mr-2" />
              {t('registeredPostForm.scanDocument')}
            </button> */}
          </div>
          
          {/* Uploaded Files List */}
          {attachments.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
              {t('attachedFiles')}
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
                        <span className="ml-2 flex-1 w-0 truncate" title={file.name}>
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
                            handleRemoveFile(file.id, file.filename);
                          }}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          title={t('registeredPostForm.remove')}
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
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium  text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 inline-flex items-center disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <FiSend className="mr-2" />
            )}
            {t('registeredPostForm.submit')}
          </button>
        </div>
      </form>

      {/* Recent Entries Table */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Registered Posts</h3>
          {Array.isArray(recentEntries) && recentEntries.length > entriesPerPage && (
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
                Previous
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
                Next
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
        ) : Array.isArray(recentEntries) && recentEntries.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent entries</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new registered post.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden border border-gray-200 sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                {/* Table Headers */}
                <thead className="bg-gray-50">
                  <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sender → Receiver
                  </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mode
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attachments
                    </th>
                  </tr>
                </thead>
                {/* Table Body */}
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedEntries.map((entry) => (
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-medium text-blue-600">
                          {entry.registrationNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]" title={entry.senderName}>
                            {entry.senderName}
                          </div>
                          <svg className="h-4 w-4 mx-2 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]" title={entry.receiverName}>
                            {entry.receiverName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          entry.mode === 'By hand' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {entry.mode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(entry.status)}`}>
                          {entry.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {entry.attachments && entry.attachments.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {entry.attachments.map((file, index) => {
                              // Skip if file is null or undefined
                              if (!file) return null;
                              
                              // Get file extension for fallback icon
                              const fileExt = file.name ? file.name.split('.').pop()?.toLowerCase() : '';
                              const fileUrl = file.url || '';
                              const fileName = file.name || 'Unnamed file';
                              
                              return (
                                <a 
                                  key={index}
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                                  onClick={(e) => handleAttachmentClick(file, e)}
                                  title={`Click to view ${fileName}`}
                                >
                                  {file.type?.startsWith('image/') ? (
                                    <FaFileImage className="h-3 w-3 mr-1 text-blue-500" />
                                  ) : file.type === 'application/pdf' || fileExt === 'pdf' ? (
                                    <FaFilePdf className="h-3 w-3 mr-1 text-red-500" />
                                  ) : file.type?.startsWith('text/') || 
                                    file.type?.includes('document') || 
                                    (fileExt && ['doc', 'docx', 'txt'].includes(fileExt)) ? (
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
                          <span className="text-xs text-gray-400">No attachments</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Footer */}
            {Array.isArray(recentEntries) && recentEntries.length > entriesPerPage && (
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
                      <span className="sr-only">Previous</span>
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
                      <span className="sr-only">Next</span>
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

      {/* Attachment Preview Modal */}
      {selectedAttachment && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setSelectedAttachment(null)}>
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div 
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {selectedAttachment.name}
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => setSelectedAttachment(null)}
                  >
                    <FaTimesCircle className="h-6 w-6" />
                  </button>
                </div>
                <div className="mt-2">
                  {renderAttachmentPreview()}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <a
                  href={selectedAttachment.url}
                  download={selectedAttachment.name}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiDownload className="mr-2 h-4 w-4" />
                  Download
                </a>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setSelectedAttachment(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {showPreview && previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900">{previewFile.name}</h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowPreview(false)}
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              {previewFile.type.includes('image/') ? (
                <img 
                  src={previewFile.previewUrl} 
                  alt={previewFile.name}
                  className="max-w-full h-auto mx-auto"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8">
                  {getFileIcon(previewFile.type)}
                  <p className="mt-2 text-sm text-gray-500">
                    {previewFile.name} • {formatFileSize(previewFile.size)}
                  </p>
                  <a
                    href={previewFile.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={e => e.stopPropagation()}
                  >
                    <FiEye className="mr-2 h-4 w-4" />
                    View Full Screen
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisteredPostForm;