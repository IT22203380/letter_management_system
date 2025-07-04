export interface Letter {
  id: string;
  type: 'normal' | 'registered' | 'fax' | 'email';
  subject: string;
  from: string;
  to: string;
  date: string;
  time: string;
  status: 'pending' | 'processing' | 'completed';
  priority: 'low' | 'medium' | 'high';
  
  // Common fields
  content?: string;
  message?: string;
  
  // Normal/Registered Post fields
  registrationNumber?: string;
  senderName?: string;
  senderAddress?: string;
  receiverName?: string;
  receiverAddress?: string;
  isConfidential?: string;
  mode?: string;
  
  // Email fields
  senderEmail?: string;
  receiverEmail?: string;
  emailPriority?: string;
  
  // Fax fields
  senderNumber?: string;
  senderOrganization?: string;
  faxNumber?: string;
  
  // For mapping
  attachments?: File[];
}

export interface LetterFormData {
  id?: string;
  type: 'normal' | 'registered' | 'fax' | 'email';
  subject: string;
  from: string;
  to: string;
  date: string;
  time: string;
  content?: string;
  message?: string;
  priority: 'low' | 'medium' | 'high';
  status?: 'pending' | 'processing' | 'completed';
  attachments?: File[];
  
  // Additional fields for specific letter types
  registrationNumber?: string;
  senderName?: string;
  senderAddress?: string;
  receiverName?: string;
  receiverAddress?: string;
  isConfidential?: string;
  mode?: string;
  senderEmail?: string;
  receiverEmail?: string;
  emailPriority?: string;
  senderNumber?: string;
  senderOrganization?: string;
  faxNumber?: string;
}