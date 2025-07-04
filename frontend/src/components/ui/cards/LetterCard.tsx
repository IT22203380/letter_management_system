import React from 'react';
import { Letter } from '../../../types/letter';
import getIconComponent from '../IconMapper';

interface LetterCardProps {
  letter: Letter;
  onClick?: (letter: Letter) => void;
}

const LetterCard: React.FC<LetterCardProps> = ({ letter, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLetterTypeIcon = (type: string) => {
    switch (type) {
      case 'normal': return 'PostAdd';
      case 'registered': return 'Mail';
      case 'fax': return 'Fax';
      case 'email': return 'Email';
      default: return 'Description';
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 cursor-pointer border border-gray-200"
      onClick={() => onClick?.(letter)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            {getIconComponent({ iconName: getLetterTypeIcon(letter.type), iconSize: 24, iconColor: '#5B005B' })}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 capitalize">{letter.type} Post</h3>
            <p className="text-sm text-gray-500">ID: {letter.id}</p>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(letter.status)}`}>
            {letter.status.toUpperCase()}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(letter.priority)}`}>
            {letter.priority.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium text-gray-800 line-clamp-2">{letter.subject}</h4>
        <div className="flex justify-between text-sm text-gray-600">
          <span>From: {letter.from}</span>
          <span>{letter.date}</span>
        </div>
        <p className="text-sm text-gray-600">To: {letter.to}</p>
      </div>
    </div>
  );
};

export default LetterCard;