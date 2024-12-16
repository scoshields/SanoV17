import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { NoteInput } from './components/NoteInput';
import { ProcessedNote } from './components/ProcessedNote';
import { HowItWorks } from './components/HowItWorks';
import { Note, NoteFormData } from './types';
import { processNoteWithAPI } from './services/api';
import { buildPrompt } from './utils/prompts/promptBuilder';
import { parseSections } from './utils/sections';

function App() {
  const [note, setNote] = useState<Note | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const clearNote = () => {
    setNote(null);
  };

  const processNote = async ({ content, selectedTherapies, noteType, customInstructions, guidedResponses }: NoteFormData) => {
    // Combine guided responses into content if using guided mode
    const noteContent = guidedResponses ? 
      Object.entries(guidedResponses)
        .filter(([_, value]) => value.trim())
        .map(([id, value]) => value.trim())
        .join('\n\n')
      : content;

    const newNote: Note = {
      id: Date.now().toString(),
      content: noteContent,
      originalContent: noteContent,
      isProcessing: true,
      sections: []
    };
    setNote(newNote);

    try {
      const data = await processNoteWithAPI({ 
        content: noteContent,
        prompt: buildPrompt(selectedTherapies, noteType, customInstructions, guidedResponses),
      });
      
      setNote(prev => prev ? {
        ...prev,
        sections: parseSections(data.processedContent, noteType === 'assessment'),
        isProcessing: false
      } : null);
    } catch (error) {
      console.error('Processing error:', error);
      setNote(prev => prev ? {
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to process note. Please try again.',
        isProcessing: false,
        sections: []
      } : null);
    }
  };

  const handleRegenerateSection = async (sectionId: string) => {
    if (!note?.originalContent) return;

    setNote(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sections: prev.sections.map(section => 
          section.id === sectionId 
            ? { ...section, isProcessing: true, error: undefined }
            : section
        )
      };
    });

    try {
      const section = note.sections.find(s => s.id === sectionId);
      if (!section) throw new Error('Section not found');

      const data = await processNoteWithAPI({
        content: note.originalContent,
        prompt: `Please regenerate only the following section of the clinical documentation:\n\n${section.heading}`,
      });

      setNote(prev => {
        if (!prev) return null;
        return {
          ...prev,
          sections: prev.sections.map(section => 
            section.id === sectionId 
              ? { 
                  ...section, 
                  content: data.processedContent,
                  isProcessing: false,
                  error: undefined
                }
              : section
          )
        };
      });
    } catch (error) {
      console.error('Section regeneration error:', error);
      setNote(prev => {
        if (!prev) return null;
        return {
          ...prev,
          sections: prev.sections.map(section => 
            section.id === sectionId 
              ? { 
                  ...section, 
                  error: error instanceof Error ? error.message : 'Failed to regenerate section',
                  isProcessing: false
                }
              : section
          )
        };
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <header className="mb-12">
          <div className="flex items-center justify-center gap-3">
            <img src="/favicon.svg" alt="Sano" className="w-8 h-8" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sano</h1>
              <span className="text-sm sm:text-lg text-gray-500">Clinical Documentation Assistant</span>
            </div>
            <button
              onClick={() => setShowHowItWorks(true)}
              className="ml-4 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
              aria-label="How it works"
            >
              <HelpCircle className="w-5 h-5" />
              How It Works
            </button>
          </div>
          <div className="mt-4 text-center">
            <a
              href="https://buy.stripe.com/9AQcQ70C04SzbqE7st"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              ❤️ Support Development
            </a>
          </div>
        </header>

        <div className="space-y-8">
          <NoteInput 
            onSubmit={processNote}
            onClear={clearNote}
            isProcessing={note?.isProcessing || false}
          />
          {note && (
            <ProcessedNote 
              note={note} 
              onRegenerateSection={handleRegenerateSection} 
            />
          )}
        </div>
      </div>
      <HowItWorks isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
    </div>
  );
}

export default App;