'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Bot, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 1. تحديد شكل الـ Message عشان تشيل الـ options (الزراير) اللي بتيجي من الباك-إيند
interface Message {
  id: number;
  text: string;
  isBot: boolean;
  options?: string[]; 
}

export default function FloatingChatbot() {
  const t = useTranslations('Chatbot');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      { id: Date.now(), text: t('welcome'), isBot: true, options: [] }
    ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isTyping]);

  // 2. دالة إرسال الرسائل المعدلة لاستقبال الـ JSON والـ History والضغط على الزراير
  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    
    const userMsg = customText || input.trim();
    if (!userMsg || isTyping) return;

    // إضافة رسالة المستخدم للشات
    setMessages(prev => [...prev, { id: Date.now(), text: userMsg, isBot: false }]);
    if (!customText) setInput('');
    setIsTyping(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://hana-beefless-rocky.ngrok-free.app';
      
      // تجميع الـ History كامل بالشكل اللي مستنيه سيرفر FastAPI
      const currentMessages = [...messages, { id: Date.now(), text: userMsg, isBot: false }];
      const apiHistory = currentMessages.map(msg => ({
        role: msg.isBot ? 'assistant' : 'user',
        content: msg.text
      }));

      // Call our internal Next.js API proxy to avoid CORS issues
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ history: apiHistory }),
      });

      if (!response.ok) {
        throw new Error('API Error');
      }

      const data = await response.json();
      
      // قراءة الداتا من الـ JSON Mode الجديد
      const replyText = data.response || (isAr ? 'لم أستطع معالجة الرد بشكل صحيح.' : 'Could not process the response correctly.');
      const botOptions = data.options || []; 
      const isConfirmed = data.is_confirmed || false;

      // إضافة رد البوت والأزرار الخاصة بيه جوه الشات
      setMessages(prev => [...prev, { id: Date.now(), text: replyText, isBot: true, options: botOptions }]);
      
      // لو الحجز اتأكد تماماً تقدر ترفع للـ Firebase أو تاخد الـ Action بتاعك هنا
      if (isConfirmed) {
        console.log('تم تأكيد الحجز بنجاح واكتمل الـ Flow!');
      }

    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMsg = isAr 
        ? 'عذراً، حدث خطأ أثناء الاتصال بمساعد الذكاء الاصطناعي. يرجى المحاولة لاحقاً.' 
        : 'Sorry, an error occurred while communicating with the AI assistant. Please try again later.';
      setMessages(prev => [...prev, { id: Date.now(), text: errorMsg, isBot: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div 
        className="fixed bottom-6 z-50"
        style={{ 
          right: isAr ? 'auto' : '24px', 
          left: isAr ? '24px' : 'auto' 
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-[#0070CD] hover:bg-[#005FB0] text-white flex items-center justify-center shadow-xl shadow-[#0070CD]/25 transition-all duration-300 hover:scale-105 relative cursor-pointer"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Bot className="w-6 h-6" />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#00C853] rounded-full border-2 border-white" />
            </>
          )}
        </button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 w-[90vw] sm:w-[370px] h-[460px] bg-white text-[#1A1A2E] rounded-2xl shadow-2xl z-50 flex flex-col border border-gray-200 overflow-hidden"
            style={{ 
              right: isAr ? 'auto' : '24px', 
              left: isAr ? '24px' : 'auto' 
            }}
          >
            {/* Header */}
            <div className="p-4 bg-[#0070CD] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">EMC Assistant</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] inline-block" />
                    <span className="text-[10px] text-white/80 font-medium">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F4F6F7]">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <div 
                    className={`flex gap-2 max-w-[85%] ${msg.isBot ? '' : 'ml-auto rtl:mr-auto rtl:ml-0 flex-row-reverse'}`}
                  >
                    {msg.isBot && (
                      <div className="w-7 h-7 rounded-full bg-[#0070CD] flex items-center justify-center shrink-0 self-end mb-1">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className={`p-3 rounded-2xl text-[13px] leading-relaxed ${
                      msg.isBot 
                        ? 'bg-white text-[#1A1A2E] rounded-bl-sm shadow-sm border border-gray-100' 
                        : 'bg-[#0070CD] text-white rounded-br-sm'
                    }`}>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                  {/* ⚡️ رندرة الأزرار (Options) التفاعلية تحت رسالة البوت وبنفس المحاذاة الشيك بتاعته ⚡️ */}
                  {msg.isBot && msg.options && msg.options.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 pl-9 rtl:pl-0 rtl:pr-9 justify-start">
                      {msg.options.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(undefined, opt)} // عند الضغط بيبعت النص كأنه رسالة مستخدم
                          className="px-3 py-1.5 text-[12px] font-medium text-[#0070CD] bg-white hover:bg-blue-50 border border-gray-200 hover:border-[#0070CD] rounded-full shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-2 max-w-[85%]">
                  <div className="w-7 h-7 rounded-full bg-[#0070CD] flex items-center justify-center shrink-0 self-end mb-1">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="p-3 rounded-2xl bg-white text-gray-500 rounded-bl-sm shadow-sm border border-gray-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
              <input
                type="text"
                placeholder={t('placeholder')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-[#F4F6F7] rounded-xl border border-gray-200 focus:border-[#0070CD] outline-none text-sm placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-2.5 bg-[#0070CD] hover:bg-[#005FB0] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl transition-all flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}