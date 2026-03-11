import { CheckCircle2 } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-sm p-8 text-center duration-200 bg-white shadow-xl rounded-2xl animate-in fade-in zoom-in">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-green-600 bg-green-100 rounded-full">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Scheduled!</h2>
        <p className="mb-6 text-gray-500">
          The interview has been successfully scheduled and an email has been sent to the candidate.
        </p>
        <button 
          onClick={onClose}
          className="w-full py-3 font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}