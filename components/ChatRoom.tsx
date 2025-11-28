import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { api, subscribe } from '../services/api';
import { Send, Paperclip, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { TRANSLATIONS, Language } from '../utils/i18n';

interface ChatRoomProps {
  chatId: string;
  chatName: string;
  userId: string;
  isOwner: boolean;
  isSupportChat?: boolean;
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
        senderName: 'Me',
        text: inputText,
        type: 'text'
    });
    setInputText('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-black border-b border-slate-100 dark:border-slate-900 p-4 flex items-center gap-4 sticky top-0 z-20">
        <button onClick={onClose} className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-1 transition">
           <ArrowLeft size={24} className="text-slate-900 dark:text-white" />
        </button>
        <div className="flex-1">
            <h2 className="font-semibold text-slate-900 dark:text-white text-base leading-tight">{chatName}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isSupportChat ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    {isSupportChat ? t.supportChat : (canWrite ? t.communityChat : t.readOnly)}
                </span>
            </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-white dark:bg-black">
        {loading && <div className="text-center text-slate-400 text-sm py-4">{t.loading}</div>}
        
        {!loading && messages.length === 0 && (
            <div className="text-center text-slate-400 py-20 flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-3">
                    <Send size={20} className="text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-sm">{t.noMessages}</p>
            </div>
        )}

        {messages.map((msg) => {
            const isMe = msg.senderId === userId;
            return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                        isMe 
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-black rounded-br-none' 
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-bl-none'
                    }`}>
                        {!isMe && <div className="text-xs font-semibold opacity-70 mb-1">{msg.senderName}</div>}
                        
                        {msg.type === 'image' && msg.imageUrl && (
                            <div className="mb-2 rounded-lg overflow-hidden border border-white/10 dark:border-black/10">
                                <img src={msg.imageUrl} alt="Shared" className="max-w-full h-auto" />
                            </div>
                        )}
                        
                        {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                        
                        <div className={`text-[10px] mt-1 text-right opacity-50`}>
                            {formatTime(msg.timestamp)}
                        </div>
                    </div>
                </div>
            );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-black p-3 border-t border-slate-100 dark:border-slate-900 pb-safe">
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
                    className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full transition"
                >
                    <Paperclip size={20} />
                </button>
                <div className="flex-grow bg-slate-100 dark:bg-slate-900 rounded-3xl flex items-center px-4 py-2 focus-within:ring-1 focus-within:ring-slate-300 dark:focus-within:ring-slate-700 transition">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={t.chatPlaceholder}
                        className="w-full bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                    />
                </div>
                <button 
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className="p-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full hover:opacity-90 disabled:opacity-50 transition"
                >
                    <Send size={18} />
                </button>
            </div>
        ) : (
            <div className="text-slate-400 text-center py-3 text-sm italic">
                {t.ownerOnly}
            </div>
        )}
      </div>
    </div>
  );
};