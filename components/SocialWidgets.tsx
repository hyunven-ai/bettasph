"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";

interface SocialWidgetsProps {
  whatsapp?: string;
  telegram?: string;
  color?: string;
}

export function SocialWidgets({ whatsapp, telegram, color = "#20c997" }: SocialWidgetsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Jika tidak ada kontak sama sekali, jangan tampilkan widget
  if (!whatsapp && !telegram) return null;

  const cleanWa = whatsapp ? whatsapp.replace(/\D/g, '') : '';
  const cleanTg = telegram ? telegram.replace('@', '') : '';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Menu Options (Expandable) */}
      <div 
        className={`flex flex-col gap-3 transition-all duration-300 origin-bottom ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {telegram && (
          <a
            href={`https://t.me/${cleanTg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group"
          >
            <span className="bg-white px-3 py-1.5 rounded-lg shadow-md text-sm font-medium text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
              Chat Telegram
            </span>
            <div className="w-12 h-12 bg-[#229ED9] hover:bg-[#1f8bc2] text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110">
              <MessageCircle className="w-6 h-6" />
            </div>
          </a>
        )}

        {whatsapp && (
          <a
            href={`https://wa.me/${cleanWa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group"
          >
            <span className="bg-white px-3 py-1.5 rounded-lg shadow-md text-sm font-medium text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
              Chat WhatsApp
            </span>
            <div className="w-12 h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964 1.006-3.588c-.608-1.065-.928-2.294-.929-3.551 0-4.004 3.258-7.262 7.262-7.262 4.007 0 7.265 3.258 7.265 7.262 0 4.005-3.259 7.262-7.262 7.262z"/></svg>
            </div>
          </a>
        )}
      </div>

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all hover:scale-105 border-2 border-transparent"
        style={{ borderColor: isOpen ? color : 'transparent', background: isOpen ? 'white' : color, color: isOpen ? color : 'white' }}
        aria-label="Contact Us"
      >
        <MessageCircle className={`w-7 h-7 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
      </button>
    </div>
  );
}
