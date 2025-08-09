'use client';

import React, { useState, useEffect } from 'react';
import { getAvailableProviders, switchProvider, AIProviderConfig } from '@/lib/ai-config';

interface AIProviderSelectorProps {
  onProviderChange?: (provider: 'qwen' | 'gemini') => void;
  className?: string;
}

export default function AIProviderSelector({ 
  onProviderChange, 
  className = '' 
}: AIProviderSelectorProps) {
  const [providers, setProviders] = useState({ qwen: false, gemini: false });
  const [currentProvider, setCurrentProvider] = useState<'qwen' | 'gemini'>('qwen');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const available = getAvailableProviders();
    setProviders({ qwen: available.qwen, gemini: available.gemini });
    setCurrentProvider(available.primary);
  }, []);

  const handleProviderChange = (provider: 'qwen' | 'gemini') => {
    if (provider === 'qwen' && !providers.qwen) return;
    if (provider === 'gemini' && !providers.gemini) return;
    
    setCurrentProvider(provider);
    switchProvider(provider);
    onProviderChange?.(provider);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
      >
        <div className="w-2 h-2 rounded-full bg-green-400"></div>
        <span className="text-sm font-medium text-gray-700">
          AI: {currentProvider === 'qwen' ? 'Qwen' : 'Gemini'}
        </span>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 px-2 py-1">AI Provider</div>
            
            <button
              onClick={() => handleProviderChange('qwen')}
              disabled={!providers.qwen}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                currentProvider === 'qwen' 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'hover:bg-gray-50 text-gray-700'
              } ${
                !providers.qwen ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span>Qwen AI</span>
              {currentProvider === 'qwen' && (
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            <button
              onClick={() => handleProviderChange('gemini')}
              disabled={!providers.gemini}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                currentProvider === 'gemini' 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'hover:bg-gray-50 text-gray-700'
              } ${
                !providers.gemini ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span>Gemini AI</span>
              {currentProvider === 'gemini' && (
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            {!providers.qwen && !providers.gemini && (
              <div className="px-3 py-2 text-xs text-red-600">
                No API keys configured
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
