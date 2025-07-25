import React from 'react';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
      <div className="flex items-center">
        <i className="fa fa-exclamation-circle mr-2"></i>
        <span>{message}</span>
      </div>
      {onClose && (
        <button 
          className="absolute top-0 right-0 mt-2 mr-2 text-red-500 hover:text-red-700"
          onClick={onClose}
        >
          <i className="fa fa-times"></i>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;    