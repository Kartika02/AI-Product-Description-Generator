import React, { useState, useRef, useEffect } from 'react';
import type { Message, GroundingChunk } from '../types';
import { SparklesIcon, SendIcon, CopyIcon, CheckIcon, SearchIcon } from './Icons';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string, useSearch: boolean) => void;
  isLoading: boolean;
  useSearch: boolean;
  setUseSearch: (useSearch: boolean) => void;
  sources: GroundingChunk[];
  texts: {
    chatInputPlaceholder: string;
    toggleSearchTooltip: string;
    sourcesTitle: string;
  };
}

const ChatBubble: React.FC<{ message: Message }> = ({ message }) => {
    const [isCopied, setIsCopied] = useState(false);
    const textContent = message.parts.map(part => part.text).join("");

    const handleCopy = () => {
        navigator.clipboard.writeText(textContent).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const isModel = message.role === 'model';
    const bubbleClass = isModel
        ? "bg-gray-700 self-start"
        : "bg-indigo-600 self-end text-white";

    return (
        <div className={`w-full flex ${isModel ? 'justify-start' : 'justify-end'}`}>
            <div className={`relative group max-w-xl rounded-lg px-4 py-3 shadow-md ${bubbleClass}`}>
                 <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: textContent.replace(/### (.*?)\n/g, '<h3 class="text-lg font-bold mt-2">$1</h3>').replace(/## (.*?)\n/g, '<h2 class="text-xl font-bold mt-3">$1</h2>') }}></p>
                 {isModel && (
                    <button onClick={handleCopy} className="absolute top-2 right-2 p-1 bg-gray-600 rounded-full text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                       {isCopied ? <CheckIcon className="w-4 h-4 text-green-400"/> : <CopyIcon className="w-4 h-4"/>}
                    </button>
                 )}
            </div>
        </div>
    );
};


export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading, useSearch, setUseSearch, sources, texts }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input, useSearch);
      setInput('');
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl flex flex-col h-full p-4">
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {messages.map((msg, index) => (
          <ChatBubble key={index} message={msg} />
        ))}
        {isLoading && (
            <div className="w-full flex justify-start">
                <div className="bg-gray-700 self-start max-w-xs rounded-lg px-4 py-3 shadow-md">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

       {sources.length > 0 && (
          <div className="mt-4 border-t border-gray-700 pt-2">
            <h4 className="text-xs text-gray-400 font-semibold mb-2">{texts.sourcesTitle}</h4>
            <div className="flex flex-wrap gap-2">
              {sources.map((source, index) => source.web && (
                <a key={index} href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-xs bg-gray-700 hover:bg-gray-600 text-indigo-300 px-2 py-1 rounded-md transition-colors">
                  {source.web.title}
                </a>
              ))}
            </div>
          </div>
        )}


      <div className="mt-4 border-t border-gray-700 pt-4">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={texts.chatInputPlaceholder}
            className="w-full bg-gray-700 text-white rounded-lg p-3 pr-24 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            rows={1}
            disabled={isLoading}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setUseSearch(!useSearch)}
                className={`p-2 rounded-full transition-colors ${useSearch ? 'bg-indigo-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
                title={texts.toggleSearchTooltip}
              >
                <SearchIcon className="w-5 h-5"/>
              </button>
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                <SendIcon className="w-5 h-5" />
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};
