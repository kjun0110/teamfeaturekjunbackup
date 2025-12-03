import { Bot } from 'lucide-react';
import { useState } from 'react';
import AIFIXRPanel from './AIFIXRPanel';

export default function FloatingAIButton() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Collapsed Button */}
      <div className="fixed top-24 right-8 z-50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`relative w-16 h-16 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#0D4ABB] flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 ${
            isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          style={{
            animation: isExpanded ? 'none' : 'glow 2s ease-in-out infinite',
            boxShadow: '0 0 30px rgba(0, 212, 255, 0.5)'
          }}
          aria-label="AIFIXR Assistant"
        >
          <Bot className="w-8 h-8 text-white" />
          
          {/* Pulse Ring */}
          <div className="absolute inset-0 rounded-full bg-[#00D4FF] opacity-20 animate-ping" />
        </button>
      </div>

      {/* Expanded Panel */}
      <AIFIXRPanel isOpen={isExpanded} onClose={() => setIsExpanded(false)} />
    </>
  );
}