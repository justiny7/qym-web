import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  x: number;
  y: number;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, x, y }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed bg-gray-800 p-4 rounded-lg shadow-xl max-w-sm z-50"
      style={{ 
        left: `${x}px`, 
        top: `${y}px`,
      }}
    >
      <div className="flex justify-end">
        <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="text-white">
        {children}
      </div>
    </div>
  );
};

export default Modal;
