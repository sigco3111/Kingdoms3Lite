import React from 'react';

interface DiplomaticFeedbackModalProps {
  message: string;
  onClose: () => void;
}

const DiplomaticFeedbackModal: React.FC<DiplomaticFeedbackModalProps> = ({ message, onClose }) => {
  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[70]" 
        onClick={onClose} 
        aria-modal="true" 
        role="dialog"
        aria-labelledby="diplomatic-feedback-title"
    >
      <div 
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="diplomatic-feedback-title" className="text-xl font-semibold text-gray-800 mb-4">외교 알림</h2>
        <p className="text-sm text-gray-700 mb-6 whitespace-pre-line">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            aria-label="확인"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiplomaticFeedbackModal;