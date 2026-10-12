/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Phone,
  X,
  Send,
  Sparkles,
  ExternalLink,
  Bot,
  MapPin,
  Mail,
  Check,
  ShoppingBag,
  Heart,
  HelpCircle,
  Copy,
} from 'lucide-react';
import { useStore } from '../store';
import { FLOWERS } from '../data/mockData';
import { Flower } from '../types';
import { formatVND } from '../utils/calculations';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  recommendedFlower?: Flower;
  suggestedCardMessage?: string;
}

const QUICK_PROMPTS = [
  '🌹 Bó 99 bông hồng sáp nhũ giá bao nhiêu?',
  '💌 Viết lời chúc thiệp sinh nhật người yêu',
  '🎓 Tư vấn hoa mừng lễ tốt nghiệp',
  '🚚 Phí giao hàng từ 294 Phạm Văn Bạch?',
  '✨ Hướng dẫn bảo quản hoa sáp thơm',
  '🎁 Mã giảm giá hôm nay có gì?',
];

export const ZaloChatWidget: React.FC = () => {
  const { state, dispatch } = useStore();
  const isOpen = state.isZaloOpen;
  const setIsOpen = (open: boolean) =>
    dispatch({ type: 'SET_MODAL', payload: { modal: 'isZaloOpen', isOpen: open } });

  const [activeTab, setActiveTab] = useState<'ai' | 'contact'>('ai');
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: "Dạ Rose (294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM) xin chào bạn! Mình là Trợ Lý AI của tiệm hoa sáp Rose 🌹. Bạn cần mình tư vấn mẫu hoa sáp thơm, báo giá giao hỏa tốc hay giúp bạn soạn lời chúc thiệp ngọt ngào ạ?",
      time: 'Vừa xong',
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputMsg).trim();
    if (!query) return;

    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg('');
    setIsTyping(true);

    // AI Floral Assistant reasoning
    setTimeout(() => {
      const q = query.toLowerCase();
      let botReply = "Dạ mình đã ghi nhận thông tin. Bạn có thể cho mình biết thêm đối tượng nhận hoa (người yêu, mẹ, bạn bè, đối tác) hoặc ngân sách dự kiến để mình gợi ý mẫu hoa sáp phù hợp nhất nhé!";
      let recommended: Flower | undefined = undefined;
      let cardMsgSuggestion: string | undefined = undefined;

      if (q.includes('99 bông') || q.includes('cầu hôn') || q.includes('đại tiệc') || q.includes('đỏ nhung')) {
        const grandFlower = FLOWERS.find((f) => f.basePrice === 679000) || FLOWERS[0];
        recommended = grandFlower;
        botReply = `Dạ mẫu **${grandFlower.name}** là thiết kế hoa sáp 99 bông đại tiệc đẳng cấp nhất tại 294 Phạm Văn Bạch!
- Giá bán thực tế: **${formatVND(grandFlower.basePrice)}** (hình ảnh chụp thật từ xưởng).
- Ý nghĩa: 99 đóa hoa sáp đỏ nhung tượng trưng cho tình yêu thiên trường địa cửu, cánh dập 5 lớp mềm mại, lưu hương tinh dầu thơm ngát 3-5 năm.
- Tặng kèm: Thiệp viết tay cao cấp và đèn LED đom đóm lung linh.`;
      } else if (q.includes('sinh nhật') || q.includes('lời chúc') || q.includes('thiệp') || q.includes('hồng pastel')) {
        cardMsgSuggestion = "Chúc em một tuổi mới ngập tràn niềm vui, nụ cười luôn rạng rỡ và tình yêu của chúng mình sẽ luôn nồng nàn, bền lâu như đóa hoa sáp vĩnh cửu này!";
        const birthdayFlower = FLOWERS.find((f) => f.basePrice === 259000) || FLOWERS[1];
        recommended = birthdayFlower;
        botReply = `Dạ dịp sinh nhật người thương, mình gợi ý bạn mẫu **${birthdayFlower.name}** (${formatVND(birthdayFlower.basePrice)}). 
Thiết kế hoa sáp tone hồng ngọt ngào, giấy gói xếp ly Hàn Quốc chỉn chu, chụp hình sống ảo cực xinh!
Mình cũng vừa soạn sẵn một lời chúc thiệp ngọt ngào cho bạn ở bên dưới, bạn có thể bấm sao chép hoặc gán trực tiếp vào thiệp đơn hàng nhé! ✨`;
      } else if (q.includes('tốt nghiệp') || q.includes('vàng') || q.includes('mini') || q.includes('bạn bè')) {
        const friendFlower = FLOWERS.find((f) => f.basePrice === 279000) || FLOWERS[2];
        recommended = friendFlower;
        botReply = `Dạ mừng lễ tốt nghiệp và tặng bạn bè, mẫu **${friendFlower.name}** (${formatVND(friendFlower.basePrice)}) là lựa chọn phù hợp nhất!
- Hoa sáp vĩnh cửu không bao giờ héo, người nhận có thể lưu giữ cùng kỷ yếu làm kỷ niệm suốt đời.`;
      } else if (q.includes('khai trương') || q.includes('đối tác') || q.includes('sự kiện')) {
        const vipFlower = FLOWERS.find((f) => f.basePrice === 559000) || FLOWERS[0];
        recommended = vipFlower;
        botReply = `Dạ chúc mừng khai trương và tri ân đối tác, tiệm có mẫu **${vipFlower.name}** (${formatVND(vipFlower.basePrice)}).
- Thiết kế bề thế, tone màu rạng rỡ may mắn giúp cửa hàng đối tác luôn tươi tắn và hồng phát!`;
      } else if (q.includes('phí ship') || q.includes('giao hàng') || q.includes('địa chỉ') || q.includes('phạm văn bạch')) {
        botReply = `Dạ cửa hàng Rose tọa lạc tại:
📍 **294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM**
- **Freeship hỏa tốc** trong bán kính < 3 km (quanh khu vực Phạm Văn Bạch, Tân Sơn, Tân Bình).
- Khu vực Gò Vấp, Quận 12, Phú Nhuận: Giao 30-45 phút, phí ship chỉ 25.000 ₫.
- Hotline/Zalo giao nhanh: **0888 208 306**
- Email: **nguyenthiendoan2@gmail.com**`;
      } else if (q.includes('bảo quản') || q.includes('độ bền') || q.includes('hoa sáp')) {
        botReply = `Dạ hoa sáp thơm Rose có độ bền **3 đến 5 năm**:
1. Để nơi khô ráo, thoáng mát (tránh tiếp xúc trực tiếp với nước vì cánh làm từ phôi sáp xà phòng tự nhiên).
2. Tránh phơi dưới ánh nắng gắt nhiệt độ cao để giữ màu sắc tươi tắn.
3. Cánh hoa ướp tinh dầu hoa hồng thơm dịu, nếu sau 1 năm muốn thơm thêm bạn có thể nhỏ vài giọt tinh dầu yêu thích vào chân xốp nhé!`;
      } else if (q.includes('voucher') || q.includes('mã giảm') || q.includes('khuyến mãi')) {
        botReply = `Dạ tiệm Rose đang có các mã ưu đãi độc quyền hôm nay:
- Mã **ROSE10**: Giảm ngay 10% cho khách hàng mới (tối đa 100k).
- Mã **WOMENSDAY**: Giảm 20% dịp lễ Quốc Tế Phụ Nữ (tối đa 200k).
- Mã **VALENTINE142**: Giảm 15% mùa yêu Valentine (tối đa 150k).
- Mã **SIEUDAIDON**: Tự động chiết khấu 10% khi đặt từ 3 bó hoa sáp trở lên.
- Mã **FREESHIPROSE**: Miễn phí vận chuyển khu vực Tân Sơn.`;
      } else if (q.includes('zalo') || q.includes('số điện thoại') || q.includes('liên hệ')) {
        botReply = `Dạ bạn có thể liên hệ trực tiếp với tiệm Rose qua:
- Zalo: **0888208306** (Nhắn tin xem ảnh mẫu hoa thực tế)
- Hotline: **0888 208 306**
- Email: **nguyenthiendoan2@gmail.com**
- Địa chỉ: **294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM**`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          recommendedFlower: recommended,
          suggestedCardMessage: cardMsgSuggestion,
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  const handleApplyCardMessage = (msg: string) => {
    dispatch({ type: 'SET_CARD_MESSAGE', payload: msg });
    dispatch({
      type: 'SHOW_TOAST',
      payload: { message: 'Đã gán lời chúc thiệp vào đơn hàng!', type: 'success' },
    });
  };

  return (
    <aside aria-label="Chatbot tư vấn và liên hệ Rose" className="fixed bottom-18 md:bottom-6 right-3 sm:right-6 z-40">
      {isOpen ? (
        <div className="w-[calc(100vw-1.5rem)] sm:w-[420px] max-w-[420px] bg-white rounded-2xl shadow-2xl border border-rose-200 overflow-hidden flex flex-col h-[520px] max-h-[calc(100vh-90px)] animate-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="bg-rose-950 text-white p-4 flex items-center justify-between border-b border-rose-900">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-serif text-sm font-bold shadow-xs">
                R
              </div>
              <div>
                <h4 className="text-xs font-bold flex items-center gap-1.5">
                  <span>Rose AI Florist & Consultation</span>
                  <Sparkles className="w-3 h-3 text-amber-300" />
                </h4>
                <span className="text-[10px] text-rose-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  294 Phạm Văn Bạch · Zalo 0888208306
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-rose-300 hover:text-white p-1 rounded transition-colors cursor-pointer"
              title="Đóng chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 bg-rose-50/70 border-b border-rose-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('ai')}
              className={`py-2.5 cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'ai' ? 'bg-white text-rose-950 border-b-2 border-rose-800' : 'text-stone-600 hover:bg-rose-100/50'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-rose-700" />
              <span>Chatbot Tư Vấn AI</span>
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`py-2.5 cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'contact' ? 'bg-white text-rose-950 border-b-2 border-rose-800' : 'text-stone-600 hover:bg-rose-100/50'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-rose-700" />
              <span>Zalo & Hotline Trực Tiếp</span>
            </button>
          </div>

          {/* Body */}
          {activeTab === 'ai' ? (
            <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#FFF9FA]">
              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-rose-900 text-white rounded-br-none shadow-xs'
                          : 'bg-white text-stone-800 rounded-bl-none border border-rose-200/80 shadow-2xs'
                      }`}
                    >
                      <div className="whitespace-pre-line">{m.text}</div>

                      {/* Attached Product Recommendation */}
                      {m.recommendedFlower && (
                        <div className="mt-3 p-2.5 bg-rose-50/80 rounded-xl border border-rose-200 flex items-center gap-2.5">
                          <img
                            src={m.recommendedFlower.imageUrl}
                            alt={m.recommendedFlower.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-lg object-cover bg-white shrink-0 border border-rose-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-stone-900 text-[11px] truncate">
                              {m.recommendedFlower.name}
                            </h5>
                            <span className="font-mono text-xs font-bold text-rose-800 block">
                              {formatVND(m.recommendedFlower.salePrice || m.recommendedFlower.basePrice)}
                            </span>
                            <div className="flex gap-2 mt-1">
                              <button
                                onClick={() => dispatch({ type: 'SELECT_FLOWER', payload: m.recommendedFlower! })}
                                className="text-[10px] text-rose-700 hover:underline font-medium cursor-pointer"
                              >
                                Xem chi tiết
                              </button>
                              <span>·</span>
                              <button
                                onClick={() =>
                                  dispatch({
                                    type: 'ADD_TO_CART',
                                    payload: {
                                      flower: m.recommendedFlower!,
                                      sizeVariant: 'standard',
                                      quantity: 1,
                                    },
                                  })
                                }
                                className="text-[10px] text-emerald-700 hover:underline font-semibold cursor-pointer"
                              >
                                Thêm vào giỏ
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Suggested Card Message */}
                      {m.suggestedCardMessage && (
                        <div className="mt-2.5 p-2 bg-amber-50 rounded-lg border border-amber-200 text-[11px]">
                          <span className="font-semibold text-amber-900 block mb-1">
                            💌 Gợi ý lời chúc thiệp:
                          </span>
                          <p className="italic text-amber-800 mb-2">"{m.suggestedCardMessage}"</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(m.suggestedCardMessage!);
                                setCopiedMessage(m.id);
                                setTimeout(() => setCopiedMessage(null), 2000);
                              }}
                              className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-900 rounded border border-amber-300 text-[10px] font-medium flex items-center gap-1 cursor-pointer"
                            >
                              {copiedMessage === m.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedMessage === m.id ? 'Đã chép' : 'Sao chép'}</span>
                            </button>
                            <button
                              onClick={() => handleApplyCardMessage(m.suggestedCardMessage!)}
                              className="px-2 py-1 bg-rose-800 hover:bg-rose-900 text-white rounded text-[10px] font-medium cursor-pointer"
                            >
                              Gán vào thiệp đơn
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-stone-400 mt-1 px-1">{m.time}</span>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-1.5 p-2.5 bg-white rounded-xl border border-rose-200 w-fit">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[10px] text-stone-400 ml-1">Rose AI đang trả lời...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick suggestion prompt chips */}
              <div className="px-3 py-2 bg-white border-t border-rose-200/70 overflow-x-auto no-scrollbar flex gap-1.5 shrink-0">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-950 rounded-full text-[11px] whitespace-nowrap border border-rose-200 transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input form */}
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-2.5 bg-white border-t border-rose-200 flex gap-2">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Hỏi về hoa sáp, ngân sách, lời chúc, ship..."
                  className="flex-1 text-xs p-2.5 bg-rose-50/50 border border-rose-200 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-800"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-rose-900 hover:bg-rose-800 text-white rounded-lg cursor-pointer transition-colors shadow-2xs"
                  title="Gửi tin nhắn"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            /* Contact Tab */
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
              <div className="space-y-3">
                {/* Zalo Direct Button */}
                <a
                  href="https://zalo.me/0888208306"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl flex items-center justify-between transition-colors text-xs text-blue-900 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                      Zalo
                    </span>
                    <div>
                      <span className="font-bold text-sm block">Chat Zalo: 0888 208 306</span>
                      <span className="text-[11px] text-blue-700">Gửi ảnh mẫu hoa thực tế & chốt đơn 24/7</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                </a>

                {/* Hotline Call */}
                <a
                  href="tel:0888208306"
                  className="p-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-between transition-colors text-xs text-emerald-900 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-sm block">Hotline Giao Hỏa Tốc: 0888 208 306</span>
                      <span className="text-[11px] text-emerald-800">Giao nhanh 30-45 phút nội thành TP.HCM</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                </a>

                {/* Email Direct */}
                <a
                  href="mailto:nguyenthiendoan2@gmail.com"
                  className="p-3.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl flex items-center justify-between transition-colors text-xs text-rose-950 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-700 text-white flex items-center justify-center shadow-xs">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-sm block">Email: nguyenthiendoan2@gmail.com</span>
                      <span className="text-[11px] text-rose-700">Hỗ trợ doanh nghiệp & đơn hàng số lượng lớn</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-rose-700 group-hover:translate-x-0.5 transition-transform" />
                </a>

                {/* Address Card */}
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-stone-900">
                    <MapPin className="w-4 h-4 text-rose-700 shrink-0" />
                    <span>Cửa Hàng Hoa Sáp Rose</span>
                  </div>
                  <p className="text-[11px] text-stone-600 pl-6">
                    294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM
                  </p>
                  <p className="text-[10px] text-stone-500 pl-6">
                    Mở cửa: 08:00 - 22:00 tất cả các ngày trong tuần
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('ai')}
                className="w-full py-2.5 bg-rose-900 hover:bg-rose-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4" />
                <span>Trở lại trò chuyện với Chatbot AI</span>
              </button>
            </div>
          )}

        </div>
      ) : (
        /* Floating Button with Badge */
        <button
          onClick={() => setIsOpen(true)}
          className="p-3.5 bg-rose-900 hover:bg-rose-800 text-white rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2.5 group ring-4 ring-rose-200/60"
          title="Mở Chatbot AI tư vấn hoa sáp & Zalo 0888208306"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-1 -right-1 ring-2 ring-rose-900" />
          </div>
          <span className="hidden sm:inline text-xs font-semibold pr-1">
            Chatbot AI · Zalo 0888208306
          </span>
        </button>
      )}
    </aside>
  );
};
