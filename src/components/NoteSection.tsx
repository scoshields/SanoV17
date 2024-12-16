import React from 'react';
import { RefreshCw } from 'lucide-react';
import { NoteSection as NoteSectionType } from '../types';
import { cn } from '../utils/cn';

interface NoteSectionProps {
  section: NoteSectionType;
  onRegenerate: (sectionId: string) => void;
}

export function NoteSection({ section, onRegenerate }: NoteSectionProps) {
  return (
    <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
        <h3 className="font-medium text-gray-900">{section.heading}</h3>
        <button
          onClick={() => onRegenerate(section.id)}
          disabled={section.isProcessing}
          className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={cn(
            "w-4 h-4",
            section.isProcessing && "animate-spin"
          )} />
          {section.isProcessing ? 'Processing...' : 'Regenerate'}
        </button>
      </div>
      <div className={cn(
        "p-4",
        section.isProcessing && "animate-pulse"
      )}>
        {section.error ? (
          <p className="text-red-600">{section.error}</p>
        ) : (
          <div className="prose max-w-none whitespace-pre-wrap">
            {section.content}
          </div>
        )}
      </div>
    </div>
  );
}