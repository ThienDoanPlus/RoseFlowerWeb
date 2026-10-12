/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, MessageSquare, Phone, CheckCheck } from 'lucide-react';
import { useStore } from '../../store';
import { ChatMessage } from '../../types';

export const CustomerChatDrawer: React.FC = () => {
  const { state, dispatch } = useStore();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (state.isCustomerChatOpen) {
      scrollToBottom();
    }
  }, [state.isCustomerChatOpen, state.chatMessages]);

  if (!state.isCustomerChatOpen) return null;

  const quickReplies = [
    'Dạ xưởng hoa Rose Flowers tại 294 Phạm Văn Bạch xin chào quý khách!',
    'Dạ hoa sáp thơm bên em lưu hương từ 3-5 năm và bảo quản không lo héo tàn ạ!',
    'Dạ em đã nhận được yêu cầu in thiệp riêng, florist bên em sẽ viết thiệp nắn nót ạ.',
    'Dạ đơn hàng đang được shipper hỏa tốc giao đến quý khách trong 45 phút tới ạ.',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: state.currentRole === 'CUSTOMER' ? 'customer' : 'staff',
      senderName: state.user?.name || (state.currentRole === 'CUSTOMER' ? 'Khách hàng' : 'Trần Thị Mai (Florist)'),
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    dispatch({ type: 'SEND_CHAT_MESSAGE', payload: newMsg });
    setInputText('');

    // Simulate auto reply if customer sent message
    if (state.currentRole === 'CUSTOMER') {
      setTimeout(() => {
        const replyMsg: ChatMessage = {
          id: `msg-reply-${Date.now()}`,
          sender: 'staff',
          senderName: 'Trần Thị Mai (Florist Trưởng)',
          text: 'Dạ shop đã nhận được tin nhắn! Florist đang hỗ trợ kiểm tra hoa và sẽ chuẩn bị đơn chu đáo nhất cho bạn ạ ❤️',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        dispatch({ type: 'SEND_CHAT_MESSAGE', payload: replyMsg });
      }, 1200);
    }
  };

  const handleClose = () => {
    dispatch({ type: 'SET_MODAL', payload: { modal: 'isCustomerChatOpen', isOpen: false } });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 bg-rose-900 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-serif text-lg border border-white/20">
              🌹
            </div>
            <div>
              <h3 className="font-display font-medium text-base leading-tight">
                Tư Vấn Khách Hàng Trực Tuyến
              </h3>
              <p className="text-[11px] text-rose-200 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Florist đang trực tuyến tại 294 Phạm Văn Bạch
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Context Badge */}
        <div className="bg-rose-50/80 px-4 py-2 border-b border-rose-100 flex items-center justify-between text-xs text-rose-900">
          <span className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-rose-700" />
            Hotline: <strong>0888 208 306</strong>
          </span>
          <span className="text-[11px] bg-white px-2 py-0.5 rounded-full border border-rose-200 font-medium">
            Vai trò: {state.currentRole}
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF8F5]">
          {state.chatMessages.map((msg) => {
            const isMe =
              (state.currentRole === 'CUSTOMER' && msg.sender === 'customer') ||
              (state.currentRole !== 'CUSTOMER' && msg.sender === 'staff');

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-stone-400 mb-0.5 px-1 font-medium">
                  {msg.senderName} · {msg.timestamp}
                </span>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-rose-900 text-white rounded-tr-xs'
                      : 'bg-white text-stone-800 border border-stone-200 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reply Suggestions */}
        <div className="p-2.5 bg-white border-t border-stone-100 flex gap-1.5 overflow-x-auto scrollbar-none">
          {quickReplies.map((qr, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qr)}
              className="text-[11px] text-stone-600 bg-stone-50 hover:bg-rose-50 hover:text-rose-900 border border-stone-200 rounded-full px-2.5 py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              {qr.slice(0, 32)}...
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập nội dung tư vấn khách hàng..."
            className="flex-1 text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800"
          />
          <button
            onClick={() => handleSend()}
            className="p-2.5 bg-rose-900 hover:bg-rose-800 text-white rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
