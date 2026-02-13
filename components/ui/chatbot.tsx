'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [session, setSession] = useState<{session_id: string} | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadInitialMessage();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const loadInitialMessage = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${apiUrl}/api/chat/initial/`);
      const data = await response.json();
      
      if (data.success) {
        setMessages([{
          id: Date.now(),
          text: data.message,
          sender: 'bot'
        }]);
        if (data.quick_replies) {
          setQuickReplies(data.quick_replies);
        }
      }
    } catch (error) {
      console.error('Failed to load initial message:', error);
      setMessages([{
        id: Date.now(),
        text: "Hi! I'm SIA Assistant. What's your name?",
        sender: 'bot'
      }]);
    }
  };

  const handleSend = useCallback(async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend) return;

    const userMessage: Message = {
      id: Date.now(),
      text: textToSend,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setQuickReplies([]);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      
      const response = await fetch(`${apiUrl}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          session_id: session?.session_id,
        }),
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.success && data.response) {
        setSession({ session_id: data.session_id });
        
        const botMessage: Message = {
          id: Date.now() + 1,
          text: data.response,
          sender: 'bot',
        };
        setMessages((prev) => [...prev, botMessage]);
        
        if (data.quick_replies && data.quick_replies.length > 0) {
          setQuickReplies(data.quick_replies);
        }
        
        if (!isOpenRef.current) {
          setUnreadCount((prev) => prev + 1);
        }
      } else {
        const errorMessage: Message = {
          id: Date.now() + 1,
          text: data.error || "Sorry, something went wrong.",
          sender: 'bot',
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Connection error. Please try again.",
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }, [input, session]);

  const renderMessageWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white font-semibold break-all"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="chatbot-container">
      {/* Toggle Button - FIXED POSITION */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="chatbot-toggle-btn"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #E8B84A, #E8A87C)',
          boxShadow: '0 4px 24px rgba(232, 184, 74, 0.5)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {unreadCount > 0 && !isOpen && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              minWidth: '20px',
              height: '20px',
              padding: '0 4px',
              borderRadius: '10px',
              backgroundColor: '#ef4444',
              border: '2px solid #2D1B4E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            {unreadCount}
          </span>
        )}

        {isOpen ? (
          <X style={{ width: '24px', height: '24px', color: 'white' }} />
        ) : (
          <MessageCircle style={{ width: '24px', height: '24px', color: 'white' }} />
        )}
      </motion.button>

      {/* Chat Panel - FIXED POSITION, NO OVERLAP */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed',
              bottom: '96px',
              right: '24px',
              zIndex: 9998,
              width: '400px',
              maxWidth: 'calc(100vw - 48px)',
              height: '600px',
              maxHeight: 'calc(100vh - 140px)',
              backgroundColor: '#1a1a2e',
              borderRadius: '16px',
              border: '1px solid rgba(107, 78, 155, 0.3)',
              boxShadow: '0 8px 40px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #2D1B4E, #3d2a5f)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(to bottom right, #E8B84A, #E8A87C)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MessageCircle style={{ width: '20px', height: '20px', color: '#2D1B4E' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: 0 }}>
                  SIA Assistant
                </p>
              </div>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
              className="chatbot-messages"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '10px 16px',
                      borderRadius: '16px',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      ...(msg.sender === 'user'
                        ? {
                            background: 'linear-gradient(to right, #E8B84A, #E8A87C)',
                            color: '#2D1B4E',
                            fontWeight: '500',
                            borderBottomRightRadius: '4px',
                          }
                        : {
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderBottomLeftRadius: '4px',
                          }),
                    }}
                  >
                    {renderMessageWithLinks(msg.text)}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      padding: '12px 16px',
                      borderRadius: '16px',
                      borderBottomLeftRadius: '4px',
                      display: 'flex',
                      gap: '4px',
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#E8B84A',
                          animation: `bounce 0.6s infinite ${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {quickReplies.length > 0 && !isTyping && (
              <div
                style={{
                  padding: '0 16px 8px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  flexShrink: 0,
                }}
              >
                {quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(reply)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      borderRadius: '16px',
                      border: '1px solid rgba(232, 184, 74, 0.3)',
                      backgroundColor: 'transparent',
                      color: '#E8B84A',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(232, 184, 74, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '16px',
                display: 'flex',
                gap: '8px',
                flexShrink: 0,
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message..."
                disabled={isTyping}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  color: 'white',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(to right, #E8B84A, #E8A87C)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: !input.trim() || isTyping ? 0.5 : 1,
                }}
              >
                {isTyping ? (
                  <Loader2 style={{ width: '20px', height: '20px', color: '#2D1B4E', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Send style={{ width: '20px', height: '20px', color: '#2D1B4E' }} />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .chatbot-messages::-webkit-scrollbar {
          width: 6px;
        }
        .chatbot-messages::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .chatbot-messages::-webkit-scrollbar-thumb {
          background: rgba(232, 184, 74, 0.4);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

export default Chatbot;