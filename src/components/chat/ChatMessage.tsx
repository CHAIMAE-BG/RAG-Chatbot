
import React from 'react';
import { User, Bot } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div
      className={`flex ${
        message.sender === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`flex max-w-[80%] ${
          message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <Avatar className={`h-8 w-8 ${
          message.sender === 'user' ? 'ml-2' : 'mr-2'
        }`}>
          {message.sender === 'user' ? (
            <User className="h-5 w-5" />
          ) : (
            <Bot className="h-5 w-5" />
          )}
        </Avatar>
        
        <div
          className={`rounded-2xl p-3 ${
            message.sender === 'user'
              ? 'bg-brand-50 text-brand-900 border border-brand-100'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          <p className="text-sm">{message.text}</p>
          <p className="text-xs mt-1 opacity-70">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
