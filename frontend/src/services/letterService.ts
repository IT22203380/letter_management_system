import axios from 'axios';

// Base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Helper function to handle file upload headers
const getFileUploadHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  };
};

interface LetterCounts {
  total: number;
  normal: number;
  registered: number;
  email: number;
  fax: number;
  pending: number;
  processing: number;
  completed: number;
}

// Map letter types to their respective endpoints
const ENDPOINT_MAP: Record<string, string> = {
  normal: 'normal-posts',
  registered: 'registered-posts',
  email: 'emails',
  fax: 'faxes'
};

// Get letter statistics
export const getLetterCounts = async (): Promise<LetterCounts> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/letter-stats/counts`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching letter counts:', error);
    return {
      total: 0,
      normal: 0,
      registered: 0,
      email: 0,
      fax: 0,
      pending: 0,
      processing: 0,
      completed: 0
    };
  }
};

// Get letters with optional filtering by type
export const getLetters = async (type?: string) => {
  try {
    let url = `${API_BASE_URL}/letter-stats`;
    if (type) {
      url += `?type=${type}`;
    }
    const response = await axios.get(url, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching letters:', error);
    return [];
  }
};

// Create a new letter
export const createLetter = async (type: string, data: any) => {
  try {
    const endpoint = ENDPOINT_MAP[type];
    if (!endpoint) {
      throw new Error(`Invalid letter type: ${type}`);
    }

    const formData = new FormData();
    
    // Append all fields to formData
    Object.keys(data).forEach(key => {
      if (key === 'attachments') {
        // Handle file attachments
        data.attachments?.forEach((file: File) => {
          formData.append('attachments', file);
        });
      } else {
        formData.append(key, data[key]);
      }
    });

    const response = await axios.post(
      `${API_BASE_URL}/${endpoint}`,
      formData,
      {
        headers: getFileUploadHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error creating ${type}:`, error);
    throw error;
  }
};

// Update an existing letter
export const updateLetter = async (type: string, id: string, data: any) => {
  try {
    const endpoint = ENDPOINT_MAP[type];
    if (!endpoint) {
      throw new Error(`Invalid letter type: ${type}`);
    }

    const formData = new FormData();
    let hasFiles = false;
    
    // Append all fields to formData
    Object.keys(data).forEach(key => {
      if (key === 'attachments') {
        // Handle file attachments
        data.attachments?.forEach((file: any) => {
          if (file instanceof File) {
            formData.append('attachments', file);
            hasFiles = true;
          }
        });
      } else {
        formData.append(key, data[key]);
      }
    });

    // Use appropriate headers based on whether we have files
    const headers = hasFiles 
      ? getFileUploadHeaders()
      : getAuthHeaders();

    const response = await axios.put(
      `${API_BASE_URL}/${endpoint}/${id}`,
      formData,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating ${type}:`, error);
    throw error;
  }
};

// Delete a letter
export const deleteLetter = async (type: string, id: string) => {
  try {
    const endpoint = ENDPOINT_MAP[type];
    if (!endpoint) {
      throw new Error(`Invalid letter type: ${type}`);
    }

    const response = await axios.delete(
      `${API_BASE_URL}/${endpoint}/${id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error(`Error deleting ${type}:`, error);
    throw error;
  }
};

// Get a single letter by ID and type
export const getLetterById = async (type: string, id: string) => {
  try {
    const endpoint = ENDPOINT_MAP[type];
    if (!endpoint) {
      throw new Error(`Invalid letter type: ${type}`);
    }

    const response = await axios.get(
      `${API_BASE_URL}/${endpoint}/${id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    throw error;
  }
};

// Download an attachment
export const downloadAttachment = async (type: string, letterId: string, filename: string) => {
  try {
    const endpoint = ENDPOINT_MAP[type];
    if (!endpoint) {
      throw new Error(`Invalid letter type: ${type}`);
    }

    const response = await axios.get(
      `${API_BASE_URL}/${endpoint}/${letterId}/attachments/${filename}`,
      {
        headers: getAuthHeaders(),
        responseType: 'blob'
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error downloading attachment:', error);
    throw error;
  }
};