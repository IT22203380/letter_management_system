import api from '../api/api';

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

export const getLetterCounts = async (): Promise<LetterCounts> => {
  try {
    const response = await api.get('/letter-stats/counts');
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

export const getLetters = async (type?: string) => {
  try {
    const url = type ? `/letter-stats?type=${type}` : '/letter-stats';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching letters:', error);
    return [];
  }
};

export const updateLetter = async (type: string, id: string, data: any) => {
  try {
    // Handle irregular plural forms
    const endpointMap: Record<string, string> = {
      fax: 'faxes',
      email: 'emails',
      registered: 'registered-posts',
      normal: 'normal-posts'
    };
    
    const endpoint = `/${endpointMap[type] || `${type}s`}/${id}`;
    console.log(`Updating ${type} at endpoint:`, endpoint); // Debug log
    
    const response = await api.put(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating ${type}:`, error);
    throw error; 
  }
};

export const createEmail = async (emailData: any) => {
  try {
    const response = await api.post('/emails', emailData);
    return response.data;
  } catch (error) {
    console.error('Error creating email:', error);
    throw error;
  }
};

export const createFax = async (faxData: any) => {
  try {
    const response = await api.post('/faxes', faxData);
    return response.data;
  } catch (error) {
    console.error('Error creating fax:', error);
    throw error;
  }
};

export const deleteLetter = async (type: string, id: string) => {
  try {
    // Handle irregular plural forms
    const endpointMap: Record<string, string> = {
      fax: 'faxes',
      email: 'emails',
      registered: 'registered-posts',
      normal: 'normal-posts'
    };
    
    const endpoint = `/${endpointMap[type] || `${type}s`}/${id}`;
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error deleting ${type}:`, error);
    throw error;
  }
};
