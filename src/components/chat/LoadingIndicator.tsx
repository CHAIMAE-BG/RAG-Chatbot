
import React from 'react';
import { Bot } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start">
      <div className="flex max-w-[80%] flex-row">
        <Avatar className="h-8 w-8 mr-2">
          <Bot className="h-5 w-5" />
        </Avatar>
        <div className="rounded-2xl p-3 bg-gray-100">
          <div className="flex space-x-2">
            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
