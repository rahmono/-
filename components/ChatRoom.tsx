

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { api, subscribe } from '../services/api';
import { Send, Paperclip, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { TRANSLATIONS, Language } from '../utils/i18n';

interface ChatRoomProps {
  chatId: string; // Generic Chat ID (could be projectId or support_id)
  chatName: string;
  userId: string;
  isOwner: boolean; // Controls read-only mode for community chats
  isSupportChat?: boolean; // If true, always allow writing
  onClose: () => void;
  lang: Language;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ chatId, chatName, userId, isOwner, isSupportChat = false, onClose, lang }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const t = TRANSLATIONS[lang];
  const canWrite = isOwner || isSupportChat;

  useEffect(() => {
    loadMessages();
    const unsubscribe = subscribe(() => loadMessages());
    return () => { unsubscribe(); };
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    const data = await api.getMessages(chatId);
    setMessages(data);
    setLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    await api.sendMessage(chatId, {
        chatId: chatId,
        senderId: userId,
        senderName: 'Me', // In real app, fetch user profile name
        text: inputText,
        type: 'text'
    });
    setInputText('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate image upload by creating a local URL
    // In production, this would upload to storage and return a real URL
    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64String = reader.result as string;
        await api.sendMessage(chatId, {
            chatId: chatId,
            senderId: userId,
            senderName: 'Me',
            type: 'image',
            imageUrl: base64String
        });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3 shadow-sm sticky top-0 z-20">
        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
           <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <div className="flex-1">
            <h2 className="font-bold text-slate-800 dark:text-white">{chatName}</h2>
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    {isSupportChat ? t.supportChat : (canWrite ? t.communityChat : t.readOnly)}
                </span>
            </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-grow overflow-y-auto p-4 space-y-3" 
        style={{ backgroundImage: 'radial-gradient(var(--dot-color, #cbd5e1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      >
        <style>{`
          .dark .bg-slate-100 { --dot-color: #334155; }
          :not(.dark) .bg-slate-100 { --dot-color: #cbd5e1; }
        `}</style>
        {loading && <div className="text-center text-slate-400 py-4">{t.loading}</div>}
        
        {!loading && messages.length === 0 && (
            <div className="text-center text-slate-400 py-10 flex flex-col items-center">
                <div className="bg-slate-200 dark:bg-slate-800 p-4 rounded-full mb-3">
                    <Send size={24} className="text-slate-400" />
                </div>
                <p>{t.noMessages} {canWrite ? t.beFirst : ''}</p>
            </div>
        )}

        {messages.map((msg) => {
            const isMe = msg.senderId === userId;
            return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                        isMe 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700'
                    }`}>
                        {!isMe && <div className="text-xs font-bold text-indigo-500 dark:text-indigo-400 mb-1">{msg.senderName}</div>}
                        
                        {msg.type === 'image' && msg.imageUrl && (
                            <div className="mb-2 rounded-lg overflow-hidden">
                                <img src={msg.imageUrl} alt="Shared" className="max-w-full h-auto" />
                            </div>
                        )}
                        
                        {msg.text && <p className="leading-snug">{msg.text}</p>}
                        
                        <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {formatTime(msg.timestamp)}
                        </div>
                    </div>
                </div>
            );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-slate-900 p-3 border-t border-slate-200 dark:border-slate-800 pb-safe">
        {canWrite ? (
            <div className="flex items-end gap-2">
                <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition"
                >
                    <Paperclip size={20} />
                </button>
                <div className="flex-grow bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={t.chatPlaceholder}
                        className="w-full bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-slate-400"
                    />
                </div>
                <button 
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition shadow-md"
                >
                    <Send size={20} />
                </button>
            </div>
        ) : (
            <div className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-center py-3 rounded-xl text-sm border border-slate-200 dark:border-slate-700">
                {t.ownerOnly}
            </div>
        )}
      </div>
    </div>
  );
};
