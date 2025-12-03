import { X, Lock } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 p-8 rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E91E8C] to-[#8B5CF6] flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-3 text-center text-[#1a2332]">
          로그인이 필요합니다
        </h3>

        {/* Description */}
        <p className="mb-8 text-center text-gray-600" style={{ fontSize: '16px' }}>
          해당 서비스는 로그인 후 이용 가능합니다.
        </p>

        {/* Social Login Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onLogin}
            className="w-full px-6 py-3 rounded-xl bg-[#FEE500] text-[#000000] hover:bg-[#FDD835] hover:shadow-lg transition-all font-medium"
          >
            카카오 로그인하기
          </button>
          <button
            onClick={onLogin}
            className="w-full px-6 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-lg transition-all font-medium"
          >
            구글 로그인하기
          </button>
          <button
            onClick={onLogin}
            className="w-full px-6 py-3 rounded-xl bg-[#03C75A] text-white hover:bg-[#02B350] hover:shadow-lg transition-all font-medium"
          >
            네이버 로그인하기
          </button>
        </div>
      </div>
    </div>
  );
}
