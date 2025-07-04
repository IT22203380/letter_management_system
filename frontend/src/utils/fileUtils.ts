// import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3001/api';

// export interface UploadedFile {
//   filename: string;
//   originalname: string;
//   path: string;
//   size: number;
//   mimetype: string;
//   url: string;
// }

// export const uploadFile = async (file: File, type: 'normal' | 'registered' | 'fax' | 'email'): Promise<UploadedFile> => {
//   const formData = new FormData();
//   formData.append('file', file);

//   const response = await axios.post(`${API_BASE_URL}/${type}-posts/upload`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//       'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
//     }
//   });
  
//   return response.data;
// };

// export const deleteFile = async (filename: string, type: 'normal' | 'registered' | 'fax' | 'email'): Promise<void> => {
//   await axios.delete(`${API_BASE_URL}/${type}-posts/files/${filename}`, {
//     headers: {
//       'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
//     }
//   });
// };